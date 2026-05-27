import { useState, useEffect, useRef, useMemo } from 'react';
import { PRODUCTS, CATEGORIES, INCOMING_STATUSES, QUALITY_STATUSES, ALL_UNITS, dbUploadReportImage } from './data.js';
import { Icon, Crest, ModePill, StatusBlock, ProductCombobox, formatDate, relTime, reportIsWithin24h } from './components.jsx';

function emptyLine() {
  return {
    key: Math.random().toString(36).slice(2),
    product: null,
    category_id: null,
    current_stock: '',
    incoming_stock: '',
    incoming_status: 'תקין ובדרך',
    expected_arrival_date: '',
    quality_status: 'תקין',
    notes: '',
    unit: '',
  };
}

function lineFromLinkedProduct(product_id) {
  const p = PRODUCTS.find(pp => pp.id === product_id);
  return { ...emptyLine(), product: { kind: 'catalog', product_id }, category_id: p?.category_id || null, unit: p?.unit || '', builtin: true };
}

function lineFromHistory(hist, products) {
  const p = products.find(pp => pp.id === hist.product_id);
  return {
    ...emptyLine(),
    product: hist.product_id ? { kind:'catalog', product_id: hist.product_id }
                             : { kind:'free', name: hist.free_text_product_name || 'מוצר' },
    category_id: p?.category_id ?? hist.category_id ?? 1,
    current_stock: String(hist.current_stock),
    incoming_stock: String(hist.incoming_stock),
    incoming_status: hist.incoming_status,
    quality_status: hist.quality_status,
    notes: hist.notes || '',
    unit: p?.unit || '',
  };
}

const EXCEL_COLS = [
  { key: 'מוצר',         required: true,  note: 'שם מוצר מהקטלוג או מוצר חופשי' },
  { key: 'מלאי נוכחי',  required: true,  note: 'מספר שלם ≥ 0' },
  { key: 'מלאי בדרך',   required: false, note: 'מספר שלם ≥ 0' },
  { key: 'יחידה',        required: false, note: 'טון / קג / ק"ל / יחידות / …' },
  { key: 'סטטוס אספקה', required: false, note: 'תקין ובדרך / מעוכב בנמל / תקוע בחו"ל' },
  { key: 'סטטוס איכות', required: false, note: 'תקין / בלאי / פסול' },
  { key: 'הערות',        required: false, note: 'טקסט חופשי' },
];

function parseExcelToLines(rows) {
  return rows
    .filter(r => r['מוצר'] && String(r['מוצר']).trim())
    .map(r => {
      const name = String(r['מוצר']).trim();
      const p = PRODUCTS.find(pp => pp.name === name);
      const unit = String(r['יחידה'] || p?.unit || '').trim();
      const incomingStatus = INCOMING_STATUSES.includes(r['סטטוס אספקה']) ? r['סטטוס אספקה'] : 'תקין ובדרך';
      const qualityStatus  = QUALITY_STATUSES.includes(r['סטטוס איכות'])  ? r['סטטוס איכות']  : 'תקין';
      return {
        ...emptyLine(),
        product:         p ? { kind: 'catalog', product_id: p.id } : { kind: 'free', name },
        category_id:     p?.category_id ?? null,
        unit,
        current_stock:   String(r['מלאי נוכחי'] ?? ''),
        incoming_stock:  String(r['מלאי בדרך']  ?? ''),
        incoming_status: incomingStatus,
        quality_status:  qualityStatus,
        notes:           String(r['הערות'] || ''),
      };
    });
}

async function downloadExcelTemplate() {
  const XLSX = await import('xlsx');
  const sample = [
    { 'מוצר': 'קמח חיטה', 'מלאי נוכחי': 50, 'מלאי בדרך': 10, 'יחידה': 'טון', 'סטטוס אספקה': 'תקין ובדרך', 'סטטוס איכות': 'תקין', 'הערות': '' },
    { 'מוצר': 'אורז לבן',  'מלאי נוכחי': 20, 'מלאי בדרך': 0,  'יחידה': 'טון', 'סטטוס אספקה': 'תקין ובדרך', 'סטטוס איכות': 'תקין', 'הערות': '' },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: EXCEL_COLS.map(c => c.key) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'דיווח מלאי');
  XLSX.writeFile(wb, 'תבנית-דיווח-מלאי.xlsx');
}

export function FieldShell({ user, org, history, notifications = [], onSubmit, onLogout, mode, viewport = 'phone' }) {
  const [tab, setTab] = useState('report');
  const [toast, setToast] = useState(null);
  const showToast = (text, kind='ok') => { setToast({ text, kind }); setTimeout(() => setToast(null), 2600); };

  // True when the browser is actually a narrow/mobile viewport
  const [narrow, setNarrow] = useState(() => window.innerWidth < 560);
  useEffect(() => {
    const fn = () => setNarrow(window.innerWidth < 560);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const lastReport = history[0];
  const dailyOk = lastReport && reportIsWithin24h(lastReport.reported_at);
  const isPc = viewport === 'fullscreen' || !narrow;
  const orgName = org?.name || '';

  const notifBanner = notifications.length > 0 && (
    <div style={{padding:'10px 16px', display:'flex', flexDirection:'column', gap:8, background:'var(--brand-bg)', borderBottom:'1px solid var(--brand-line)'}}>
      {notifications.slice(0, 3).map(n => (
        <div key={n.id} style={{display:'flex', alignItems:'flex-start', gap:10}}>
          <Icon name="bell" size={14} style={{color:'var(--brand)', flexShrink:0, marginTop:2}}/>
          <div style={{font:'500 13px var(--font-ui)', color:'var(--brand-2)', flex:1}}>{n.message}</div>
        </div>
      ))}
    </div>
  );

  const tabContent = (
    <>
      {tab === 'report' && (
        <ReportTab user={user} org={org} history={history} dailyOk={dailyOk} mode={mode} viewport={viewport} isPc={isPc}
                   onSubmit={(payload) => { onSubmit(payload); showToast('הדיווח היומי שלך נקלט בהצלחה', 'ok'); setTab('history'); }} />
      )}
      {tab === 'history' && <HistoryTab user={user} history={history} isPc={isPc}/>}
      {tab === 'profile' && <ProfileTab user={user} org={org} onLogout={onLogout}/>}
    </>
  );

  const navItems = [
    { id:'report',  label:'דיווח',    icon:'home',    badge: !dailyOk },
    { id:'history', label:'היסטוריה', icon:'history' },
    { id:'profile', label:'פרופיל',   icon:'user'    },
  ];

  const bottomNav = (
    <div style={{flexShrink:0, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid var(--line)', background:'var(--surface)'}}>
      {navItems.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)}
          style={{appearance:'none', border:0, background:'transparent', padding:'10px 0 14px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)', fontFamily:'var(--font-ui)', fontSize:11, fontWeight:500, position:'relative'}}>
          <Icon name={t.icon} size={20} stroke={tab === t.id ? 2 : 1.6}/>{t.label}
          {t.badge && <span style={{position:'absolute', top:8, insetInlineStart:'calc(50% + 8px)', width:7, height:7, borderRadius:'50%', background:'var(--bad)', boxShadow:'0 0 0 2px var(--surface)'}}/>}
        </button>
      ))}
    </div>
  );

  // ── PC / fullscreen layout ───────────────────────────────────────────────
  if (isPc) {
    return (
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', position:'relative'}}>
        <header className="topbar" style={{padding:'0 20px'}}>
          {/* Start (RTL right): Crest + nav inline */}
          <div style={{display:'flex', alignItems:'center', gap:24}}>
            <Crest subtitle={orgName}/>
            <nav style={{display:'flex', gap:2}}>
              {navItems.map(t => (
                <a key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} style={{position:'relative'}}>
                  {t.label}
                  {t.badge && tab !== t.id && <span style={{position:'absolute', top:8, insetInlineEnd:8, width:6, height:6, borderRadius:'50%', background:'var(--bad)'}}/>}
                </a>
              ))}
            </nav>
          </div>
          {/* End (RTL left): mode + clock + divider + user initials + name + logout */}
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <ModePill mode={mode}/>
            <FieldClock/>
            <div style={{width:1, height:24, background:'var(--line-2)'}}/>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{width:28, height:28, borderRadius:3, background:'var(--ink)', color:'var(--paper)', display:'grid', placeItems:'center', font:'700 11px var(--font-mono)', flexShrink:0}}>
                {user.full_name.split(' ').map(p => p[0]).join('').slice(0,2)}
              </div>
              <div style={{lineHeight:1.1}}>
                <div style={{font:'600 12.5px var(--font-ui)'}}>{user.full_name}</div>
                <div style={{font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>ORG-{String(user.organization_id).padStart(4,'0')}</div>
              </div>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={onLogout}><Icon name="logout" size={14}/></button>
          </div>
        </header>
        {notifBanner}
        {tabContent}
        {toast && (
          <div className="anim-in" style={{position:'fixed', left:'50%', bottom:24, transform:'translateX(-50%)', padding:'12px 18px', background:'var(--surface)', color:'var(--ink)', border:'1px solid var(--line)', borderRadius:8, font:'500 14px var(--font-ui)', display:'flex', alignItems:'center', gap:10, boxShadow:'var(--shadow-2)', zIndex:50}}>
            <Icon name={toast.kind === 'ok' ? 'check' : 'alert'} size={16} stroke={2.4} style={{color: toast.kind === 'ok' ? 'var(--ok)' : 'var(--bad)'}}/>{toast.text}
          </div>
        )}
      </div>
    );
  }

  // ── Phone — native full-screen on real mobile, framed on desktop ─────────
  const phoneInner = (
    <>
      <div style={{flexShrink:0, position:'sticky', top:0, zIndex:5, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:52, background:'var(--surface)', borderBottom:'1px solid var(--ink)'}}>
        <Crest subtitle={orgName}/>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <ModePill mode={mode}/>
          <button className="btn btn--ghost btn--sm" onClick={onLogout}><Icon name="logout" size={14}/></button>
        </div>
      </div>
      <div style={{flex:'1 1 auto', overflowY:'auto', position:'relative'}}>
        {notifBanner}
        {tabContent}
      </div>
      {bottomNav}
      {toast && (
        <div className="anim-in" style={{position:'fixed', left:16, right:16, bottom:80, padding:'12px 14px', background:'var(--surface)', color:'var(--ink)', border:'1px solid var(--line)', borderRadius:8, font:'500 14px var(--font-ui)', display:'flex', alignItems:'center', gap:10, boxShadow:'var(--shadow-2)', zIndex:50}}>
          <Icon name={toast.kind === 'ok' ? 'check' : 'alert'} size={16} stroke={2.4} style={{color: toast.kind === 'ok' ? 'var(--ok)' : 'var(--bad)'}}/>{toast.text}
        </div>
      )}
    </>
  );

  // On an actual phone: fill the full screen natively
  if (narrow) {
    return (
      <div style={{height:'100dvh', display:'flex', flexDirection:'column', background:'var(--surface)', overflow:'hidden'}}>
        {phoneInner}
      </div>
    );
  }

  // On desktop: show the decorative phone frame
  return (
    <div className="phone-stage">
      <div className="phone">
        <div className="phone-status">
          <span className="mono" style={{fontWeight:600}}>9:41</span>
          <span style={{display:'flex', gap:6, alignItems:'center', fontSize:12, color:'var(--ink-3)'}}>
            <span>אזרחי</span>
            <span style={{display:'inline-block', width:18, height:9, border:'1px solid currentColor', borderRadius:2, position:'relative'}}>
              <span style={{position:'absolute', inset:1, background:'currentColor', borderRadius:1, width:'72%'}}/>
            </span>
          </span>
        </div>
        <div className="phone-body">
          {phoneInner}
        </div>
      </div>
    </div>
  );
}

function ReportTab({ user, org, history, dailyOk, mode, onSubmit, viewport = 'phone', isPc: isPcProp }) {
  const [lines, setLines] = useState(() => {
    const linked = org?.linked_products || [];
    if (linked.length === 0) return [emptyLine()];
    return linked.map(pid => lineFromLinkedProduct(pid));
  });
  const [activeKey, setActiveKey]     = useState(null);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const excelRef = useRef(null);
  const [excelRows, setExcelRows]     = useState(null);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelError, setExcelError]   = useState('');

  async function onExcelChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelError('');
    try {
      const XLSX = await import('xlsx');
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf);
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rows.length) { setExcelError('הקובץ ריק או לא ניתן לקריאה.'); return; }
      const missing = rows.some(r => !r['מוצר'] || r['מלאי נוכחי'] === '');
      if (missing) { setExcelError('חסרות עמודות חובה: "מוצר" ו-"מלאי נוכחי".'); return; }
      setExcelRows(rows);
      setExcelFileName(file.name);
    } catch { setExcelError('שגיאה בקריאת הקובץ.'); }
    if (excelRef.current) excelRef.current.value = '';
  }

  function applyExcel() {
    if (!excelRows) return;
    const parsed = parseExcelToLines(excelRows);
    if (!parsed.length) return;
    setLines(parsed);
    setExcelRows(null);
    setExcelFileName('');
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }
  function removeImage() { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }

  const lastReport = history[0];
  const isPc = isPcProp !== undefined ? isPcProp : viewport === 'fullscreen';

  const updateLine = (key, patch) => setLines(prev => prev.map(l => l.key === key ? { ...l, ...patch } : l));
  const removeLine = (key) => setLines(prev => prev.length === 1 ? prev : prev.filter(l => l.key !== key));
  const addFreeLine = () => setLines(prev => [...prev, { ...emptyLine(), product: { kind: 'free', name: '' } }]);

  function loadYesterday() {
    if (!lastReport) return;
    setLines(lastReport.lines.map(h => lineFromHistory(h, PRODUCTS)));
  }

  function resetToLinked() {
    const linked = org?.linked_products || [];
    setLines(linked.length === 0 ? [emptyLine()] : linked.map(pid => lineFromLinkedProduct(pid)));
  }

  function setProductCatalog(key, product_id) {
    const p = PRODUCTS.find(pp => pp.id === product_id);
    updateLine(key, { product: { kind:'catalog', product_id }, unit: p?.unit || '', category_id: p?.category_id || null });
  }
  function setProductFree(key, name) {
    updateLine(key, { product: { kind:'free', name }, unit: '', category_id: null });
  }

  function validate() {
    const errs = {};
    lines.forEach(l => {
      if (!l.product) errs[l.key + ':product'] = 'יש לבחור או להקליד מוצר';
      else if (l.product.kind === 'free' && !l.category_id) errs[l.key + ':category'] = 'יש לבחור משרד ממשלתי';
      if (l.current_stock === '' || isNaN(Number(l.current_stock))) errs[l.key + ':current'] = 'חסר מלאי נוכחי';
      else if (Number(l.current_stock) < 0) errs[l.key + ':current'] = 'אסור שלילי';
      else if (!Number.isInteger(Number(l.current_stock))) errs[l.key + ':current'] = 'יש להזין מספר שלם בלבד';
      if (l.incoming_stock !== '' && !isNaN(Number(l.incoming_stock)) && !Number.isInteger(Number(l.incoming_stock))) errs[l.key + ':incoming'] = 'יש להזין מספר שלם בלבד';
    });
    return errs;
  }

  async function submit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    let image_url = null;
    if (imageFile) {
      setImageUploading(true);
      try { image_url = await dbUploadReportImage(imageFile, user.organization_id); } catch(e) { console.warn('Image upload failed:', e); }
      setImageUploading(false);
    }
    await onSubmit({ user_id: user.id, organization_id: user.organization_id, lines, reported_at: Date.now(), image_url });
    removeImage();
    setSubmitting(false);
  }

  return (
    <div style={{padding: isPc ? '28px 32px 80px' : '16px 16px 80px', display:'flex', flexDirection:'column', gap: isPc ? 18 : 14, maxWidth: isPc ? 1080 : '100%', margin: isPc ? '0 auto' : 0, width:'100%'}}>
      {isPc && (
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', paddingBottom:14, borderBottom:'1px solid var(--ink)'}}>
          <div>
            <div className="tag" style={{color:'var(--brand)', marginBottom:6}}>{mode === 'emergency' ? 'DAILY · 01' : 'WEEKLY · 01'}</div>
            <h1 style={{margin:'0 0 4px', font:'700 30px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>דיווח מלאי יומי</h1>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)'}}>
              <span style={{font:'600 13px var(--font-mono)', color:'var(--ink-2)'}}>{lines.length}</span> פריטים בדיווח
            </div>
          </div>
        </div>
      )}
      <StatusBlock status={dailyOk ? 'ok' : 'missing'} lastReportMs={lastReport?.reported_at}/>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="btn btn--ghost" onClick={loadYesterday} disabled={!lastReport} style={{flex: isPc ? '0 0 auto' : 1, justifyContent:'center'}}>
          <Icon name="copy" size={15}/> טען נתוני אמש
        </button>
        {(org?.linked_products?.length > 0) && (
          <button className="btn btn--ghost" onClick={resetToLinked} style={{flex:'0 0 auto'}}>
            <Icon name="spark" size={15}/> אפס לקטלוג הארגון
          </button>
        )}
        <button className="btn btn--ghost" onClick={addFreeLine} style={{flex:'0 0 auto'}}>
          <Icon name="plus" size={15}/> הוסף מוצר חופשי
        </button>
        <label className="btn btn--ghost" style={{flex:'0 0 auto', cursor:'pointer'}}>
          <Icon name="download" size={15}/> ייבוא מאקסל
          <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={onExcelChange}/>
        </label>
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginTop:4}}>
        <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', letterSpacing:'.04em', textTransform:'uppercase'}}>
          טופס דיווח · {lines.length} {lines.length === 1 ? 'מוצר' : 'מוצרים'}
        </div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {org?.linked_products?.length > 0 && (
            <span className="chip chip--accent" style={{fontSize:11}}>
              <Icon name="check" size={11}/> {org.linked_products.length} מוצרים מקושרים על ידי המטה
            </span>
          )}
          <span className="chip" style={{fontSize:11}}><Icon name="shield" size={11}/> מידור הרמטי</span>
        </div>
      </div>
      <div style={{display:'grid', gap:10, gridTemplateColumns: isPc ? 'repeat(auto-fill, minmax(480px, 1fr))' : '1fr'}}>
        {lines.map((l, idx) => {
          const yesterdayLine = lastReport?.lines?.find(h =>
            l.product?.kind === 'catalog'
              ? h.product_id === l.product?.product_id
              : (l.product?.kind === 'free' && h.free_text_product_name === l.product?.name)
          );
          return (
            <LineCard key={l.key} line={l} index={idx} errors={errors} active={activeKey === l.key}
              onFocus={() => setActiveKey(l.key)}
              onChange={(patch) => updateLine(l.key, patch)}
              onPickCatalog={(pid) => setProductCatalog(l.key, pid)}
              onPickFree={(name) => setProductFree(l.key, name)}
              onRemove={!l.builtin && lines.length > 1 ? () => removeLine(l.key) : null}
              onRestoreYesterday={yesterdayLine ? () => updateLine(l.key, {
                current_stock:   String(yesterdayLine.current_stock),
                incoming_stock:  String(yesterdayLine.incoming_stock),
                incoming_status: yesterdayLine.incoming_status,
                quality_status:  yesterdayLine.quality_status,
                notes:           yesterdayLine.notes || '',
              }) : null}/>
          );
        })}
      </div>
      {/* Excel format guide + preview */}
      <div className="card" style={{padding:14, display:'flex', flexDirection:'column', gap:10}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
          <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>פורמט קובץ אקסל לייבוא</div>
          <button className="btn btn--ghost btn--sm" onClick={downloadExcelTemplate} style={{fontSize:11}}>
            <Icon name="download" size={13}/> הורד תבנית
          </button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, fontFamily:'var(--font-ui)'}}>
            <thead>
              <tr style={{background:'var(--bg-2)'}}>
                {EXCEL_COLS.map(c => (
                  <th key={c.key} style={{padding:'6px 10px', textAlign:'right', borderBottom:'1px solid var(--line)', whiteSpace:'nowrap', color: c.required ? 'var(--ink)' : 'var(--ink-3)', fontWeight: c.required ? 600 : 400}}>
                    {c.key}{c.required && <span style={{color:'var(--bad)', marginRight:2}}>*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {EXCEL_COLS.map(c => (
                  <td key={c.key} style={{padding:'5px 10px', color:'var(--ink-3)', borderBottom:'1px solid var(--line)', whiteSpace:'nowrap', fontSize:11}}>{c.note}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {excelError && <div style={{font:'500 12px var(--font-ui)', color:'var(--bad)', display:'flex', alignItems:'center', gap:5}}><Icon name="alert" size={12}/>{excelError}</div>}
        {excelRows && (
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:4}}>
            <div style={{font:'500 12px var(--font-ui)', color:'var(--ink-2)'}}>
              נטענו {excelRows.length} שורות מתוך <span className="mono" style={{fontSize:11}}>{excelFileName}</span>
            </div>
            <div style={{overflowX:'auto', maxHeight:180, overflowY:'auto', border:'1px solid var(--line)', borderRadius:6}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, fontFamily:'var(--font-ui)'}}>
                <thead style={{position:'sticky', top:0, background:'var(--bg-2)'}}>
                  <tr>
                    {EXCEL_COLS.map(c => (
                      <th key={c.key} style={{padding:'5px 10px', textAlign:'right', borderBottom:'1px solid var(--line)', whiteSpace:'nowrap', fontWeight:500, color:'var(--ink-2)'}}>{c.key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelRows.map((r, i) => (
                    <tr key={i} style={{background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg-2)'}}>
                      {EXCEL_COLS.map(c => (
                        <td key={c.key} style={{padding:'5px 10px', borderBottom:'1px solid var(--line)', whiteSpace:'nowrap', color:'var(--ink)'}}>{String(r[c.key] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn btn--brand" onClick={applyExcel} style={{flex:1, justifyContent:'center'}}>
                <Icon name="check" size={14}/> טען {excelRows.length} שורות לטופס
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => { setExcelRows(null); setExcelFileName(''); }}>
                <Icon name="x" size={13}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image upload */}
      <div className="card" style={{padding:14, display:'flex', flexDirection:'column', gap:10}}>
        <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>תמונה מהדיווח · אופציונלי</div>
        {imagePreview ? (
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <img src={imagePreview} alt="preview" style={{width:72, height:72, objectFit:'cover', borderRadius:8, border:'1px solid var(--line)'}}/>
            <div style={{flex:1}}>
              <div style={{font:'500 13px var(--font-ui)', color:'var(--ink)'}}>{imageFile?.name}</div>
              <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', marginTop:2}}>{(imageFile?.size / 1024).toFixed(0)} KB</div>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={removeImage}><Icon name="x" size={13}/></button>
          </div>
        ) : (
          <label style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px', border:'1.5px dashed var(--line-2)', borderRadius:8, cursor:'pointer', background:'var(--bg-2)'}}>
            <Icon name="doc" size={18} style={{color:'var(--ink-3)'}}/>
            <span style={{font:'500 13px var(--font-ui)', color:'var(--ink-2)'}}>לחץ להעלאת תמונה מהשטח (JPEG, PNG)</span>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={onFileChange}/>
          </label>
        )}
      </div>

      <div style={{position: isPc ? 'sticky' : 'static', bottom: isPc ? 16 : 'auto', display:'flex', flexDirection: isPc ? 'row' : 'column', gap:10, alignItems: isPc ? 'center' : 'stretch', background: isPc ? 'var(--bg)' : 'transparent', padding: isPc ? '12px 0' : 0, zIndex:4}}>
        <button className="btn btn--brand btn--lg" onClick={submit} disabled={submitting || imageUploading} style={{justifyContent:'center', flex: isPc ? '0 0 auto' : 1, minWidth: isPc ? 220 : 0}}>
          {imageUploading ? 'מעלה תמונה…' : submitting ? 'שולח…' : 'שלח דיווח מלאי'}
        </button>
        <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', textAlign:'center', flex:1}}>
          הנתונים נשמרים ישירות לבריכת המידע של מטה רח״ל · מוצפנים בזמן השליחה
        </div>
      </div>
    </div>
  );
}

function LineCard({ line, index, errors, active, onFocus, onChange, onPickCatalog, onPickFree, onRemove, onRestoreYesterday }) {
  const isFree = line.product?.kind === 'free';
  const unit = line.unit;
  const prod = PRODUCTS.find(p => p.id === line.product?.product_id);
  const allowedUnits = isFree ? ALL_UNITS : (prod?.allowed_units || (unit ? [unit] : []));
  return (
    <div className={`card ${active ? 'row-hl' : ''}`} style={{padding:14, display:'flex', flexDirection:'column', gap:12}} onFocus={onFocus} onClick={onFocus}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
        <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
          <span className="mono" style={{color:'var(--ink-3)', fontSize:11, padding:'2px 7px', background:'var(--bg-2)', borderRadius:4, whiteSpace:'nowrap'}}>#{String(index+1).padStart(2,'0')}</span>
          <span style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', whiteSpace:'nowrap'}}>שורת מוצר</span>
        </div>
        <div style={{display:'flex', gap:4}}>
          {onRestoreYesterday && (
            <button title="שחזר נתוני אמש לשורה זו" className="btn btn--ghost btn--sm" onClick={onRestoreYesterday} style={{padding:'6px 8px', fontSize:11, gap:4}}>
              <Icon name="copy" size={13}/> אמש
            </button>
          )}
          {onRemove && <button className="btn btn--ghost btn--sm" onClick={onRemove} style={{padding:'6px 8px'}}><Icon name="trash" size={13}/></button>}
        </div>
      </div>
      <div>
        <label className="label">מוצר</label>
        {isFree ? (
          <input className="input" autoFocus={!line.product.name} placeholder="הקלד שם מוצר חופשי…" maxLength={80}
            value={line.product.name || ''}
            onChange={e => onChange({ product: { kind: 'free', name: e.target.value } })}/>
        ) : (
          <ProductCombobox value={line.product} products={PRODUCTS} categories={CATEGORIES}
            onChange={(v) => onPickCatalog(v.product_id)} onFreeText={(name) => onPickFree(name)}/>
        )}
        {errors[line.key + ':product'] && <ErrorLabel text={errors[line.key + ':product']}/>}
      </div>
      {isFree && (
        <div>
          <label className="label">משרד ממשלתי (קטגוריה)</label>
          <select className="select" value={line.category_id || ''} onChange={e => onChange({ category_id: Number(e.target.value) })}>
            <option value="">— בחר משרד —</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors[line.key + ':category'] && <ErrorLabel text={errors[line.key + ':category']}/>}
        </div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        <div>
          <label className="label">מלאי נוכחי</label>
          <div style={{position:'relative'}}>
            <input type="number" min="0" step="1" className="input num-input" value={line.current_stock}
              onChange={e => onChange({ current_stock: e.target.value })} placeholder="0"
              style={{paddingInlineEnd: unit || isFree ? 56 : 12}}/>
            <UnitBadge unit={unit} allowedUnits={allowedUnits} onChangeUnit={(u) => onChange({ unit: u })}/>
          </div>
          {errors[line.key + ':current'] && <ErrorLabel text={errors[line.key + ':current']}/>}
        </div>
        <div>
          <label className="label">מלאי בדרך</label>
          <div style={{position:'relative'}}>
            <input type="number" min="0" step="1" className="input num-input" value={line.incoming_stock}
              onChange={e => onChange({ incoming_stock: e.target.value })} placeholder="0"
              style={{paddingInlineEnd: unit || isFree ? 56 : 12}}/>
            <UnitBadge unit={unit} allowedUnits={allowedUnits} onChangeUnit={(u) => onChange({ unit: u })}/>
          </div>
          {errors[line.key + ':incoming'] && <ErrorLabel text={errors[line.key + ':incoming']}/>}
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        <div>
          <label className="label">סטטוס אספקה</label>
          <select className="select" value={line.incoming_status} onChange={e => onChange({ incoming_status: e.target.value })}>
            {INCOMING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">סטטוס איכות</label>
          <select className="select" value={line.quality_status} onChange={e => onChange({ quality_status: e.target.value })}>
            {QUALITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">תאריך הגעה משוער · אופציונלי</label>
        <input type="date" className="input" value={line.expected_arrival_date} min={new Date().toISOString().split('T')[0]} onChange={e => onChange({ expected_arrival_date: e.target.value })}/>
      </div>
      <div>
        <label className="label">הערות</label>
        <textarea className="input" rows={2} maxLength={200} placeholder="הערות נקודתיות…" value={line.notes}
          onChange={e => onChange({ notes: e.target.value })} style={{resize:'vertical', minHeight:54}}/>
      </div>
    </div>
  );
}

function UnitBadge({ unit, allowedUnits = [], onChangeUnit }) {
  if (!allowedUnits.length && !unit) return null;
  const canChange = allowedUnits.length > 1;
  if (canChange) {
    return (
      <select value={unit || ''} onChange={e => onChangeUnit(e.target.value)}
        style={{position:'absolute', insetInlineEnd:6, top:4, height:34, padding:'0 6px', border:'1px solid var(--line-2)', borderRadius:5, background:'var(--bg-2)', font:'500 12px var(--font-mono)', color:'var(--ink-2)', cursor:'pointer'}}>
        {!unit && <option value="">יחידה</option>}
        {allowedUnits.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
    );
  }
  if (unit) {
    return (
      <span className="mono" style={{position:'absolute', insetInlineEnd:8, top:'50%', transform:'translateY(-50%)', padding:'3px 8px', borderRadius:4, background:'var(--bg-2)', border:'1px solid var(--line)', font:'600 12px var(--font-mono)', color:'var(--ink-2)'}}>{unit}</span>
    );
  }
  return null;
}

function ErrorLabel({ text }) {
  return <div style={{font:'500 12px var(--font-ui)', color:'var(--bad)', marginTop:6, display:'flex', alignItems:'center', gap:5}}><Icon name="alert" size={12}/> {text}</div>;
}

function HistoryTab({ user, history, isPc = false }) {
  return (
    <div style={{padding: isPc ? '28px 32px 80px' : '16px 16px 80px', display:'flex', flexDirection:'column', gap:14, maxWidth: isPc ? 1080 : '100%', margin: isPc ? '0 auto' : 0, width:'100%'}}>
      <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', letterSpacing:'.04em', textTransform:'uppercase'}}>היסטוריית דיווחים · קריאה בלבד</div>
      {history.length === 0 && (
        <div style={{font:'400 14px var(--font-ui)', color:'var(--ink-3)', textAlign:'center', padding:'32px 0'}}>אין דיווחים עדיין — שלח את הדיווח הראשון שלך!</div>
      )}
      {history.map(rep => (
        <div key={rep.id} className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-2)', borderBottom:'1px solid var(--line)'}}>
            <div style={{font:'600 13px var(--font-ui)'}}>{formatDate(rep.reported_at)}</div>
            <div className="chip" style={{fontSize:11}}>{rep.lines.length} {rep.lines.length === 1 ? 'מוצר' : 'מוצרים'}</div>
          </div>
          <div>
            {rep.lines.map((l, i) => {
              const p = PRODUCTS.find(pp => pp.id === l.product_id);
              return (
                <div key={i} style={{padding:'12px 14px', borderBottom: i < rep.lines.length - 1 ? '1px solid var(--line)' : 0, display:'flex', flexDirection:'column', gap:6}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <div style={{font:'500 14px var(--font-ui)'}}>{p?.name || l.free_text_product_name || 'מוצר חופשי'}</div>
                    {l.quality_status !== 'תקין' && <span className="chip chip--warn" style={{fontSize:11}}>{l.quality_status}</span>}
                  </div>
                  <div style={{display:'flex', gap:14, fontSize:13, color:'var(--ink-2)'}}>
                    <span>נוכחי <span className="num" style={{color:'var(--ink)'}}>{l.current_stock}</span> {p?.unit}</span>
                    <span>בדרך <span className="num" style={{color:'var(--ink)'}}>{l.incoming_stock}</span> {p?.unit}</span>
                  </div>
                  {l.notes && <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>{l.notes}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ user, org, onLogout }) {
  const linkedProducts = (org?.linked_products || []).map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  return (
    <div style={{padding:'24px 18px 80px', display:'flex', flexDirection:'column', gap:18, maxWidth:680, margin:'0 auto', width:'100%'}}>
      <div className="card" style={{padding:18, display:'flex', flexDirection:'column', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <div style={{width:48, height:48, borderRadius:10, background:'var(--bg-2)', border:'1px solid var(--line)', display:'grid', placeItems:'center', font:'700 16px var(--font-mono)'}}>
            {user.full_name.split(' ').map(s=>s[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style={{font:'600 16px var(--font-ui)'}}>{user.full_name}</div>
            <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>{user.title}</div>
          </div>
        </div>
        <div className="hr"/>
        <ProfileRow label="ארגון" value={org?.name || '—'}/>
        <ProfileRow label="תעודת זהות" value={<span className="mono">{user.id_number}</span>}/>
        <ProfileRow label="טלפון" value={<span className="mono">{user.phone}</span>}/>
        <ProfileRow label="הרשאה" value={<span className="chip chip--accent" style={{fontSize:11}}>{user.role}</span>}/>
      </div>
      {linkedProducts.length > 0 && (
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)'}}>
            <div style={{font:'600 13px var(--font-ui)'}}>קטלוג המוצרים המקושר לארגון</div>
          </div>
          {linkedProducts.map((p, i) => (
            <div key={p.id} style={{padding:'10px 16px', borderBottom: i < linkedProducts.length - 1 ? '1px solid var(--line)' : 0, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div>
                <div style={{font:'500 14px var(--font-ui)'}}>{p.name}</div>
                <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>{CATEGORIES.find(c => c.id === p.category_id)?.name}</div>
              </div>
              <span className="mono" style={{fontSize:12, color:'var(--ink-2)', padding:'2px 8px', background:'var(--bg-2)', borderRadius:4}}>{p.unit}</span>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn--ghost" onClick={onLogout}><Icon name="logout" size={14}/> יציאה מהמערכת</button>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <span style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)'}}>{label}</span>
      <span style={{font:'500 13px var(--font-ui)', color:'var(--ink)'}}>{value}</span>
    </div>
  );
}

function FieldClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <span style={{font:'500 12px var(--font-mono)', color:'var(--ink-2)', letterSpacing:'.04em'}}>
      {pad(now.getHours())}:{pad(now.getMinutes())} · {pad(now.getDate())}.{pad(now.getMonth()+1)}.{now.getFullYear()}
    </span>
  );
}
