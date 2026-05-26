import { useState } from 'react';
import { PRODUCTS, CATEGORIES, INCOMING_STATUSES, QUALITY_STATUSES } from './data.js';
import { Icon, Crest, StatusBlock, ProductCombobox, formatDate, relTime, reportIsWithin24h } from './components.jsx';

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
  return { ...emptyLine(), product: { kind: 'catalog', product_id }, category_id: p?.category_id || null, unit: p?.unit || '' };
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

export function FieldShell({ user, org, history, onSubmit, onLogout, mode, viewport = 'phone' }) {
  const [tab, setTab] = useState('report');
  const [toast, setToast] = useState(null);
  const showToast = (text, kind='ok') => { setToast({ text, kind }); setTimeout(() => setToast(null), 2600); };

  const lastReport = history[0];
  const dailyOk = lastReport && reportIsWithin24h(lastReport.reported_at);
  const isPc = viewport === 'fullscreen';
  const orgName = org?.name || '';

  const tabContent = (
    <>
      {tab === 'report' && (
        <ReportTab user={user} org={org} history={history} dailyOk={dailyOk} mode={mode} viewport={viewport}
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

  if (isPc) {
    return (
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', position:'relative'}}>
        <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', background:'var(--surface)', borderBottom:'1px solid var(--line)', gap:24}}>
          <div style={{display:'flex', alignItems:'center', gap:18}}>
            <Crest subtitle={`נציג שטח · ${orgName}`}/>
            <div style={{width:1, height:24, background:'var(--line)'}}/>
            <span className="chip" style={{fontSize:11}}>
              <span className="dot" style={{background: mode === 'emergency' ? 'var(--bad)' : 'var(--ok)'}}/>
              {mode === 'emergency' ? 'מצב חירום ארצי · דיווח יומי' : 'שגרה · דיווח שבועי'}
            </span>
          </div>
          <nav style={{display:'flex', gap:2}}>
            {navItems.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{appearance:'none', border:0, cursor:'pointer', display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:6, background: tab === t.id ? 'var(--bg-2)' : 'transparent', color: tab === t.id ? 'var(--ink)' : 'var(--ink-2)', font:'500 14px var(--font-ui)', position:'relative'}}>
                <Icon name={t.icon} size={15} stroke={tab === t.id ? 2 : 1.7}/>{t.label}
                {t.badge && tab !== t.id && <span style={{width:7, height:7, borderRadius:'50%', background:'var(--bad)'}}/>}
              </button>
            ))}
          </nav>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{textAlign:'left'}}>
              <div style={{font:'500 13px var(--font-ui)'}}>{user.full_name}</div>
              <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>ת״ז <span className="mono">{user.id_number}</span></div>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={onLogout}><Icon name="logout" size={14}/></button>
          </div>
        </header>
        {tabContent}
        {toast && (
          <div className="anim-in" style={{position:'fixed', left:'50%', bottom:24, transform:'translateX(-50%)', padding:'12px 18px', background: toast.kind === 'ok' ? 'var(--ok)' : 'var(--bad)', color:'white', borderRadius:8, font:'500 14px var(--font-ui)', display:'flex', alignItems:'center', gap:10, boxShadow:'0 12px 32px oklch(0% 0 0 / .18)', zIndex:50}}>
            <Icon name={toast.kind === 'ok' ? 'check' : 'alert'} size={16} stroke={2.4}/>{toast.text}
          </div>
        )}
      </div>
    );
  }

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
        <div className="phone-body" style={{display:'flex', flexDirection:'column', position:'relative'}}>
          <div className="sec-h" style={{position:'sticky', top:0, zIndex:5}}>
            <div><h2>{orgName}</h2><div className="sub">{user.title}</div></div>
            <div style={{display:'flex', gap:6, alignItems:'center'}}>
              <span className="chip" style={{fontSize:11}}>
                <span className="dot" style={{background: mode === 'emergency' ? 'var(--bad)' : 'var(--ok)'}}/>
                {mode === 'emergency' ? 'חירום' : 'שגרה'}
              </span>
              <button className="btn btn--ghost btn--sm" onClick={onLogout}><Icon name="logout" size={14}/></button>
            </div>
          </div>
          {tabContent}
          <div style={{position:'sticky', bottom:0, marginTop:'auto', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid var(--line)', background:'var(--surface)'}}>
            {navItems.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{appearance:'none', border:0, background:'transparent', padding:'10px 0 14px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)', fontFamily:'var(--font-ui)', fontSize:11, fontWeight:500, position:'relative'}}>
                <Icon name={t.icon} size={20} stroke={tab === t.id ? 2 : 1.6}/>{t.label}
                {t.badge && <span style={{position:'absolute', top:8, insetInlineStart:'calc(50% + 8px)', width:7, height:7, borderRadius:'50%', background:'var(--bad)', boxShadow:'0 0 0 2px var(--surface)'}}/>}
              </button>
            ))}
          </div>
          {toast && (
            <div className="anim-in" style={{position:'absolute', left:16, right:16, bottom:84, padding:'12px 14px', background: toast.kind === 'ok' ? 'var(--ok)' : 'var(--bad)', color:'white', borderRadius:8, font:'500 14px var(--font-ui)', display:'flex', alignItems:'center', gap:10, boxShadow:'0 12px 32px oklch(0% 0 0 / .18)'}}>
              <Icon name={toast.kind === 'ok' ? 'check' : 'alert'} size={16} stroke={2.4}/>{toast.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportTab({ user, org, history, dailyOk, mode, onSubmit, viewport = 'phone' }) {
  const [lines, setLines] = useState(() => {
    const linked = org?.linked_products || [];
    if (linked.length === 0) return [emptyLine()];
    return linked.map(pid => lineFromLinkedProduct(pid));
  });
  const [activeKey, setActiveKey] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const lastReport = history[0];
  const isPc = viewport === 'fullscreen';

  const updateLine = (key, patch) => setLines(prev => prev.map(l => l.key === key ? { ...l, ...patch } : l));
  const removeLine = (key) => setLines(prev => prev.length === 1 ? prev : prev.filter(l => l.key !== key));
  const addLine = () => setLines(prev => [...prev, emptyLine()]);

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
    });
    return errs;
  }

  async function submit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    await onSubmit({ user_id: user.id, organization_id: user.organization_id, lines, reported_at: Date.now() });
    setSubmitting(false);
  }

  return (
    <div style={{padding: isPc ? '28px 32px 80px' : '16px 16px 80px', display:'flex', flexDirection:'column', gap: isPc ? 18 : 14, maxWidth: isPc ? 1080 : '100%', margin: isPc ? '0 auto' : 0, width:'100%'}}>
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
        <button className="btn btn--ghost" onClick={addLine} style={{flex:'0 0 auto'}}>
          <Icon name="plus" size={15}/> הוסף מוצר חופשי
        </button>
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
        {lines.map((l, idx) => (
          <LineCard key={l.key} line={l} index={idx} errors={errors} active={activeKey === l.key}
            onFocus={() => setActiveKey(l.key)}
            onChange={(patch) => updateLine(l.key, patch)}
            onPickCatalog={(pid) => setProductCatalog(l.key, pid)}
            onPickFree={(name) => setProductFree(l.key, name)}
            onRemove={lines.length > 1 ? () => removeLine(l.key) : null}/>
        ))}
      </div>
      <div style={{position: isPc ? 'sticky' : 'static', bottom: isPc ? 16 : 'auto', display:'flex', flexDirection: isPc ? 'row' : 'column', gap:10, alignItems: isPc ? 'center' : 'stretch', background: isPc ? 'var(--bg)' : 'transparent', padding: isPc ? '12px 0' : 0, zIndex:4}}>
        <button className="btn btn--accent btn--lg" onClick={submit} disabled={submitting} style={{justifyContent:'center', flex: isPc ? '0 0 auto' : 1, minWidth: isPc ? 220 : 0}}>
          {submitting ? 'שולח…' : 'שלח דיווח מלאי'}
        </button>
        <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', textAlign:'center', flex:1}}>
          הנתונים נשמרים ישירות לבריכת המידע של מטה רח״ל · מוצפנים בזמן השליחה
        </div>
      </div>
    </div>
  );
}

function LineCard({ line, index, errors, active, onFocus, onChange, onPickCatalog, onPickFree, onRemove }) {
  const isFree = line.product?.kind === 'free';
  const unit = line.unit;
  return (
    <div className={`card ${active ? 'row-hl' : ''}`} style={{padding:14, display:'flex', flexDirection:'column', gap:12}} onFocus={onFocus} onClick={onFocus}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
        <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
          <span className="mono" style={{color:'var(--ink-3)', fontSize:11, padding:'2px 7px', background:'var(--bg-2)', borderRadius:4, whiteSpace:'nowrap'}}>#{String(index+1).padStart(2,'0')}</span>
          <span style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', whiteSpace:'nowrap'}}>שורת מוצר</span>
        </div>
        {onRemove && <button className="btn btn--ghost btn--sm" onClick={onRemove} style={{padding:'6px 8px'}}><Icon name="trash" size={13}/></button>}
      </div>
      <div>
        <label className="label">מוצר</label>
        <ProductCombobox value={line.product} products={PRODUCTS} categories={CATEGORIES}
          onChange={(v) => onPickCatalog(v.product_id)} onFreeText={(name) => onPickFree(name)}/>
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
            <input type="number" min="0" step="0.01" className="input num-input" value={line.current_stock}
              onChange={e => onChange({ current_stock: e.target.value })} placeholder="0.00"
              style={{paddingInlineEnd: unit || isFree ? 56 : 12}}/>
            <UnitBadge unit={unit} isFree={isFree} onChangeUnit={(u) => onChange({ unit: u })}/>
          </div>
          {errors[line.key + ':current'] && <ErrorLabel text={errors[line.key + ':current']}/>}
        </div>
        <div>
          <label className="label">מלאי בדרך</label>
          <div style={{position:'relative'}}>
            <input type="number" min="0" step="0.01" className="input num-input" value={line.incoming_stock}
              onChange={e => onChange({ incoming_stock: e.target.value })} placeholder="0.00"
              style={{paddingInlineEnd: unit || isFree ? 56 : 12}}/>
            <UnitBadge unit={unit} isFree={isFree} onChangeUnit={(u) => onChange({ unit: u })}/>
          </div>
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
        <input type="date" className="input" value={line.expected_arrival_date} onChange={e => onChange({ expected_arrival_date: e.target.value })}/>
      </div>
      <div>
        <label className="label">הערות</label>
        <textarea className="input" rows={2} maxLength={200} placeholder="הערות נקודתיות…" value={line.notes}
          onChange={e => onChange({ notes: e.target.value })} style={{resize:'vertical', minHeight:54}}/>
      </div>
    </div>
  );
}

function UnitBadge({ unit, isFree, onChangeUnit }) {
  if (!unit && !isFree) return null;
  if (isFree && !unit) {
    return (
      <select onChange={e => onChangeUnit(e.target.value)} value={unit}
        style={{position:'absolute', insetInlineEnd:6, top:4, height:34, padding:'0 6px', border:'1px solid var(--line-2)', borderRadius:5, background:'var(--bg-2)', font:'500 12px var(--font-mono)', color:'var(--ink-2)'}}>
        <option value="">יחידה</option>
        <option value="טון">טון</option>
        <option value='ק"ל'>ק"ל</option>
        <option value="יחידות">יחידות</option>
        <option value="מנות">מנות</option>
      </select>
    );
  }
  return (
    <span className="mono" style={{position:'absolute', insetInlineEnd:8, top:'50%', transform:'translateY(-50%)', padding:'3px 8px', borderRadius:4, background:'var(--bg-2)', border:'1px solid var(--line)', font:'600 12px var(--font-mono)', color:'var(--ink-2)'}}>{unit}</span>
  );
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
