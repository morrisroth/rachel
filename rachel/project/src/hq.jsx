import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, PRODUCTS, dbFetchLatestReportLines, dbFetchReportsForExport, dbSendNotification, dbFetchNotifications, dbInsertReport, dbFetchAppSettings, dbSaveAppSetting, dbSendEmail, dbUpdateUser } from './data.js';
import { Icon, Crest, ModePill, PillToggle, Kpi, PageHeader, formatDate, relTime } from './components.jsx';
import { OrgsView } from './orgs.jsx';

export function HQShell({ user, onLogout, mode, onSetMode, orgs, users, monitor, onRefreshMonitor, onAddOrganization, onUpdateOrganization }) {
  const [tab, setTab] = useState('monitor');
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { dbFetchNotifications().then(setNotifications); }, []);
  const [exportLog, setExportLog] = useState([
    { id: 1, user_id: user.id, type: 'אקסל ארצי מלא',        at: Date.now() - 6 * 3600 * 1000 },
    { id: 2, user_id: user.id, type: 'אקסל — משרד האנרגיה', at: Date.now() - 28 * 3600 * 1000 },
  ]);

  function doExport(type) {
    setExportLog(prev => [{ id: Date.now(), user_id: user.id, type, at: Date.now() }, ...prev]);
  }

  const initials = user.full_name.split(' ').map(s => s[0]).join('').slice(0, 2);
  const navItems = [
    { id:'monitor', icon:'home',     label:'ניטור' },
    { id:'orgs',    icon:'user',     label:'ארגונים' },
    { id:'export',  icon:'download', label:'ייצוא' },
    { id:'notify',  icon:'bell',     label:'התראות' },
    { id:'email',   icon:'mail',     label:'מיילים' },
    { id:'mode',    icon:'shield',   label:'מצב לאומי' },
    { id:'audit',   icon:'history',  label:'יומן' },
  ];

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--paper)'}}>
      {/* Top bar */}
      <div className="topbar">
        <div style={{display:'flex', alignItems:'center', gap:20}}>
          <Crest subtitle="חמ״ל מרכזי" variant="brand"/>
          <div style={{width:1, height:22, background:'var(--line-2)'}}/>
          <nav className="topbar" style={{height:'auto', border:0, padding:0, background:'transparent', gap:0}}>
            {navItems.map(n => (
              <a key={n.id} className={tab === n.id ? 'on' : ''} onClick={() => setTab(n.id)}
                style={{display:'flex', alignItems:'center', gap:7}}>
                <Icon name={n.icon} size={14}/> {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <ModePill mode={mode}/>
          <div style={{width:1, height:22, background:'var(--line-2)'}}/>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:28, height:28, borderRadius:4, background:'var(--ink)', color:'var(--paper)', display:'grid', placeItems:'center', font:'700 11px var(--font-mono)', flexShrink:0}}>
              {initials}
            </div>
            <div style={{lineHeight:1.2}}>
              <div style={{font:'600 12.5px var(--font-ui)'}}>{user.full_name}</div>
              <div style={{font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em', textTransform:'uppercase'}}>{user.title}</div>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={onLogout}><Icon name="logout" size={13}/></button>
        </div>
      </div>

      {/* Content */}
      <main style={{flex:'1 1 auto', padding:'28px 32px 64px', maxWidth:1320, width:'100%', margin:'0 auto', boxSizing:'border-box'}}>
        {tab === 'monitor' && <MonitorView monitor={monitor} mode={mode} orgs={orgs} onRefresh={onRefreshMonitor}/>}
        {tab === 'orgs'    && <OrgsView orgs={orgs} users={users} onAdd={onAddOrganization} onUpdate={onUpdateOrganization}/>}
        {tab === 'export'  && <ExportView onExport={doExport} mode={mode} orgs={orgs} user={user}/>}
        {tab === 'mode'    && <ModeView mode={mode} onSetMode={onSetMode} users={users}/>}
        {tab === 'notify'  && <NotifyView user={user} orgs={orgs} notifications={notifications}
                               onSend={async (n) => { await dbSendNotification(n); const all = await dbFetchNotifications(); setNotifications(all); }}/>}
        {tab === 'email'   && <EmailView user={user} orgs={orgs} users={users}/>}
        {tab === 'audit'   && <AuditView log={exportLog} users={users}/>}
      </main>
    </div>
  );
}

function MonitorView({ monitor, mode, orgs, onRefresh }) {
  const threshold = mode === 'emergency' ? 24 : 7 * 24;

  // Auto-refresh every 30 seconds
  const refreshRef = useRef(onRefresh);
  useEffect(() => { refreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => {
    const id = setInterval(() => refreshRef.current?.(), 30000);
    return () => clearInterval(id);
  }, []);

  const [filter, setFilter]   = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);

  async function toggleExpand(org_id) {
    if (expanded === org_id) { setExpanded(null); return; }
    setExpanded(org_id);
    if (!detailCache[org_id]) {
      setDetailLoading(true);
      const result = await dbFetchLatestReportLines(org_id);
      setDetailCache(prev => ({ ...prev, [org_id]: result || 'empty' }));
      setDetailLoading(false);
    }
  }

  // Build enriched list from ALL active orgs, not just those with reports
  const enriched = orgs
    .filter(o => o.active && o.cat_id !== null)
    .map(o => {
      const m   = monitor.find(r => r.org_id === o.id);
      const cat = CATEGORIES.find(c => c.id === o.cat_id);
      const hoursAgo = m ? (Date.now() - m.last) / 3600000 : Infinity;
      const dead = hoursAgo > threshold;
      return { org_id: o.id, org: o, cat, hoursAgo, dead, last: m?.last || null, user: m?.user || '—' };
    });

  const reported = enriched.filter(m => !m.dead).length;
  const total    = enriched.length;
  const deadCount = total - reported;

  const filtered = enriched.filter(m =>
    (filter === 'all' || (filter === 'reported' ? !m.dead : m.dead)) &&
    (!searchQ || m.org.name.includes(searchQ))
  );

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader
        tag="01 · MONITOR"
        title="ניטור ארגונים"
        sub={`תמונת מצב ארצית · ${mode === 'emergency' ? 'תדירות יומית (חירום)' : 'תדירות שבועית (שגרה)'} · מתרענן כל 30 שניות`}
        right={<PillToggle value={filter} onChange={setFilter}
          options={[{value:'all',label:`הכל · ${total}`},{value:'reported',label:`דיווחו · ${reported}`},{value:'dead',label:`שטחים מתים · ${deadCount}`}]}/>}
      />
      <div className="hq-kpis">
        <Kpi label="ארגונים מחויבי דיווח" value={total}/>
        <Kpi label="דיווחו בחלון הנדרש"  value={reported} accent="ok"/>
        <Kpi label="שטחים מתים"           value={deadCount} accent={deadCount > 0 ? 'bad' : 'ok'}/>
        <Kpi label="חלון דיווח נוכחי"     value={mode === 'emergency' ? '24 ש׳' : '168 ש׳'}/>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid var(--line)'}}>
          <Icon name="search" size={14}/>
          <input className="input" placeholder="חיפוש לפי שם ארגון…" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                 style={{border:0, padding:'4px 0', boxShadow:'none', fontSize:14, background:'transparent'}}/>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:40}}>#</th>
              <th>ארגון</th>
              <th>סוג</th>
              <th>משרד</th>
              <th>איש קשר</th>
              <th>דיווח אחרון</th>
              <th>סטטוס</th>
              <th style={{width:100}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{textAlign:'center', padding:'30px 0', color:'var(--ink-3)'}}>אין ארגונים תואמים.</td></tr>
            )}
            {filtered.map((m, i) => [
              <tr key={m.org_id}>
                <td style={{color:'var(--ink-3)'}} className="num">{String(i+1).padStart(2,'0')}</td>
                <td style={{fontWeight:500}}>{m.org.name}</td>
                <td style={{color:'var(--ink-2)'}}>{m.org.type}</td>
                <td>{m.cat ? <span className="chip" style={{fontSize:11}}>{m.cat.short}</span> : '—'}</td>
                <td style={{color:'var(--ink-2)'}}>{m.user}</td>
                <td>
                  {m.last
                    ? <><span className="num" style={{color:'var(--ink)'}}>{formatDate(m.last)}</span>
                        <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>{relTime(m.last)}</div></>
                    : <span style={{color:'var(--ink-3)', font:'400 13px var(--font-ui)'}}>לא דיווח מעולם</span>
                  }
                </td>
                  <td>
                    {m.dead
                      ? <span className="chip chip--bad"><Icon name="alert" size={11}/> שטח מת</span>
                      : <span className="chip chip--ok"><Icon name="check" size={11}/> דיווח תקין</span>}
                  </td>
                  <td>
                    <button className="btn btn--ghost btn--sm"
                      onClick={() => toggleExpand(m.org_id)}
                      style={{gap:5}}>
                      <Icon name={expanded === m.org_id ? 'chevron-d' : 'chevron-r'} size={13}/>
                      {expanded === m.org_id ? 'סגור' : 'פרטים'}
                    </button>
                  </td>
                </tr>,

                expanded === m.org_id && (
                  <tr key={`${m.org_id}-detail`}>
                    <td colSpan={8} style={{padding:0, background:'var(--bg-2)', borderBottom:'2px solid var(--line-2)'}}>
                      <ReportDetail
                        cache={detailCache[m.org_id]}
                        loading={detailLoading}
                        orgName={m.org.name}
                      />
                    </td>
                  </tr>
                ),
              ])}
            </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportDetail({ cache, loading, orgName }) {
  if (loading && !cache) {
    return (
      <div style={{padding:'20px 24px', color:'var(--ink-3)', font:'400 13px var(--font-ui)', display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:16, height:16, border:'2px solid var(--line)', borderTopColor:'var(--ink)', borderRadius:'50%', animation:'spin 0.7s linear infinite'}}/>
        טוען פרטי דיווח…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!cache || cache === 'empty') {
    return <div style={{padding:'20px 24px', color:'var(--ink-3)', font:'400 13px var(--font-ui)'}}>אין נתוני דיווח זמינים.</div>;
  }

  const { reported_at, lines } = cache;

  return (
    <div style={{padding:'14px 20px 18px'}}>
      <div style={{font:'600 12px var(--font-ui)', color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:10}}>
        דיווח אחרון: {formatDate(reported_at)} · {lines.length} שורות
      </div>
      {lines.length === 0 && (
        <div style={{color:'var(--ink-3)', font:'400 13px var(--font-ui)'}}>הדיווח לא כלל שורות.</div>
      )}
      {lines.length > 0 && (
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th>מוצר</th>
              <th>קטגוריה</th>
              <th>מלאי קיים</th>
              <th>מלאי נכנס</th>
              <th>סטטוס כניסה</th>
              <th>איכות</th>
              <th>הגעה צפויה</th>
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const prod = PRODUCTS.find(p => p.id === l.product_id);
              const cat  = CATEGORIES.find(c => c.id === l.category_id);
              const productName = prod?.name || l.free_text_product_name || '—';
              const unit = l.unit || prod?.unit || '';
              return (
                <tr key={i}>
                  <td style={{fontWeight:500}}>
                    {productName}
                    {!prod && l.free_text_product_name && (
                      <span className="chip chip--accent" style={{fontSize:10, padding:'1px 5px', marginInlineStart:6}}>חופשי</span>
                    )}
                  </td>
                  <td>{cat ? <span className="chip" style={{fontSize:11}}>{cat.short}</span> : '—'}</td>
                  <td className="num">{l.current_stock.toLocaleString()} <span style={{color:'var(--ink-3)', fontSize:11}}>{unit}</span></td>
                  <td className="num">{l.incoming_stock > 0 ? `${l.incoming_stock.toLocaleString()} ${unit}` : '—'}</td>
                  <td>
                    {l.incoming_status
                      ? <span className={`chip ${l.incoming_status === 'תקין ובדרך' ? 'chip--ok' : l.incoming_status === 'מעוכב בנמל' ? 'chip--warn' : 'chip--bad'}`} style={{fontSize:11}}>
                          {l.incoming_status}
                        </span>
                      : '—'}
                  </td>
                  <td>
                    {l.quality_status
                      ? <span className={`chip ${l.quality_status === 'תקין' ? 'chip--ok' : l.quality_status === 'בלאי' ? 'chip--warn' : 'chip--bad'}`} style={{fontSize:11}}>
                          {l.quality_status}
                        </span>
                      : '—'}
                  </td>
                  <td style={{color:'var(--ink-2)'}}>{l.expected_arrival_date || '—'}</td>
                  <td style={{color:'var(--ink-2)', maxWidth:200}}>{l.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ExportView({ onExport, mode, orgs, user }) {
  const [busy, setBusy]         = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [exportErr, setExportErr]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // Report import state
  const importRef    = useRef(null);
  const [importRows,    setImportRows]    = useState(null);
  const [importing,     setImporting]     = useState(false);
  const [importBusy,    setImportBusy]    = useState(false);
  const [importDone,    setImportDone]    = useState(0);
  const [importFailed,  setImportFailed]  = useState(0);
  const [importErr,     setImportErr]     = useState('');

  async function onImportReportsFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportErr('');
    try {
      const XLSX = await import('xlsx');
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf);
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (rows.length === 0) { setImportErr('הקובץ ריק או לא ניתן לקריאה.'); return; }
      setImportRows(rows);
      setImporting(true);
    } catch(e) { setImportErr('שגיאה בקריאת הקובץ: ' + (e.message || e)); }
    if (importRef.current) importRef.current.value = '';
  }

  async function doImportReports() {
    if (!importRows) return;
    setImportBusy(true);
    // Group rows by org+date key → one report per group
    const groups = new Map();
    for (const row of importRows) {
      const orgName = String(row['שם ארגון'] || row['org'] || '').trim();
      const dateRaw = String(row['תאריך דיווח'] || row['date'] || '').trim();
      const key = `${orgName}|${dateRaw}`;
      if (!groups.has(key)) groups.set(key, { orgName, dateRaw, rows: [] });
      groups.get(key).rows.push(row);
    }
    let done = 0, failed = 0;
    for (const { orgName, dateRaw, rows } of groups.values()) {
      const org = orgs.find(o => o.name === orgName || o.name.includes(orgName));
      if (!org) { failed += rows.length; continue; }
      let reportedAt;
      try {
        // Handle Excel serial dates and string dates
        const parsed = isNaN(dateRaw) ? new Date(dateRaw) : new Date(Math.round((Number(dateRaw) - 25569) * 86400000));
        reportedAt = isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
      } catch { reportedAt = Date.now(); }
      const lines = rows.map(row => {
        const productName = String(row['שם מוצר'] || row['product'] || '').trim();
        const prod = PRODUCTS.find(p => p.name === productName);
        return {
          product: prod
            ? { kind: 'catalog', product_id: prod.id }
            : { kind: 'free', name: productName },
          category_id: prod?.category_id || (CATEGORIES.find(c => c.name.includes(String(row['משרד'] || '')))?.id) || null,
          current_stock:  Number(String(row['מלאי נוכחי']  || row['current']  || '').replace(/[^\d.]/g,'')) || 0,
          incoming_stock: Number(String(row['מלאי בדרך']   || row['incoming'] || '').replace(/[^\d.]/g,'')) || 0,
          unit:                   String(row['יחידה']         || row['unit']     || '').trim() || (prod?.unit || ''),
          incoming_status:        String(row['סטטוס אספקה']  || '').trim() || null,
          quality_status:         String(row['סטטוס איכות']  || '').trim() || null,
          expected_arrival_date:  String(row['תאריך הגעה']   || '').trim() || null,
          notes:                  String(row['הערות']         || row['notes'] || '').trim() || null,
        };
      });
      try {
        await dbInsertReport({ user_id: user.id, organization_id: org.id, lines, reported_at: reportedAt });
        done++;
      } catch(e) { console.warn('Import report failed:', e); failed++; }
    }
    setImportDone(done);
    setImportFailed(failed);
    setImportBusy(false);
    setImporting(false);
    setImportRows(null);
  }

  async function run(label, catId = null) {
    setExportErr('');
    setBusy(true);
    try {
      const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
      const toMs   = dateTo   ? new Date(dateTo).getTime()   : null;
      const reports = await dbFetchReportsForExport(fromMs, toMs);

      const rows = [];
      for (const rep of reports) {
        const org = orgs.find(o => o.id === rep.organization_id);
        if (!org) continue;
        for (const line of rep.lines) {
          const prod = PRODUCTS.find(p => p.id === line.product_id);
          const lineCatId = line.category_id || prod?.category_id;
          if (catId && lineCatId !== catId) continue;
          const cat  = CATEGORIES.find(c => c.id === lineCatId);
          rows.push({
            'ארגון':          org.name,
            'סוג ארגון':      org.type || '—',
            'משרד':           cat?.name || '—',
            'מוצר':           prod?.name || line.free_text_product_name || '—',
            'יחידה':          line.unit || prod?.unit || '—',
            'מלאי נוכחי':     line.current_stock,
            'מלאי בדרך':      line.incoming_stock,
            'סטטוס אספקה':    line.incoming_status  || '—',
            'סטטוס איכות':    line.quality_status   || '—',
            'תאריך הגעה צפוי': line.expected_arrival_date || '—',
            'הערות':           line.notes || '',
            'תאריך דיווח':    new Date(rep.reported_at).toLocaleDateString('he-IL'),
          });
        }
      }

      if (rows.length === 0) {
        setExportErr('לא נמצאו נתונים לייצוא בטווח שנבחר.');
        setBusy(false);
        return;
      }

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
      const filename = `rachel-${label.replace(/[^א-תa-z0-9]/gi, '-')}-${new Date().toISOString().slice(0,10)}.xlsx`;
      XLSX.writeFile(wb, filename);

      onExport(label);
      setLastExport({ type: label, at: Date.now() });
    } catch(e) {
      setExportErr('שגיאה בייצוא: ' + (e.message || e));
    }
    setBusy(false);
  }

  const today = new Date().toISOString().slice(0,10);

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader tag="03 · EXPORT" title="ייצוא נתונים ארצי" sub="קובץ אקסל מנורמל, מפוצל לארבע מחיצות לפי משרדי הממשלה השותפים"/>

      {/* Date range filter */}
      <div className="card" style={{padding:18, display:'flex', alignItems:'center', gap:18, flexWrap:'wrap'}}>
        <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', whiteSpace:'nowrap'}}>
          <Icon name="history" size={14} style={{marginInlineEnd:6}}/>
          טווח זמן לייצוא
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <label style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)', whiteSpace:'nowrap'}}>מתאריך</label>
            <input type="date" className="input" value={dateFrom} max={dateTo || today}
              onChange={e => setDateFrom(e.target.value)} style={{width:160}}/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <label style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)', whiteSpace:'nowrap'}}>עד תאריך</label>
            <input type="date" className="input" value={dateTo} min={dateFrom} max={today}
              onChange={e => setDateTo(e.target.value)} style={{width:160}}/>
          </div>
          {(dateFrom || dateTo) && (
            <button className="btn btn--ghost btn--sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>נקה</button>
          )}
        </div>
        <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>
          {(!dateFrom && !dateTo) ? 'ללא טווח — יוצא הדיווח האחרון לכל ארגון' : 'יוצאים כל הדיווחים בטווח שנבחר'}
        </div>
      </div>

      {/* Full export */}
      <div className="card" style={{padding:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:18, flexWrap:'wrap'}}>
        <div style={{display:'flex', flexDirection:'column', gap:6, maxWidth:560}}>
          <div style={{font:'600 17px var(--font-ui)'}}>ייצוא קובץ ארצי מלא</div>
          <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)'}}>
            כולל את כל הארגונים וכל המשרדים.
            {!dateFrom && !dateTo && ` מוגדר לדיווח האחרון לכל ארגון.`}
          </div>
        </div>
        <button className="btn btn--accent btn--lg" disabled={busy} onClick={() => run('ייצוא ארצי מלא')} style={{minWidth:230, justifyContent:'center'}}>
          {busy ? 'מייצא…' : <><Icon name="download" size={16}/> ייצוא אקסל ארצי</>}
        </button>
      </div>

      {lastExport && (
        <div className="banner banner--ok anim-in">
          <Icon name="check" size={18} stroke={2.2}/>
          <div>
            <div style={{font:'500 14px var(--font-ui)'}}>הקובץ הורד בהצלחה: «{lastExport.type}»</div>
            <div style={{font:'400 12px var(--font-ui)', opacity:.85, marginTop:2}}>{formatDate(lastExport.at)} · נרשם ב-EXPORT_LOG</div>
          </div>
        </div>
      )}
      {exportErr && (
        <div className="banner banner--bad anim-in">
          <Icon name="alert" size={18} stroke={2.2}/>
          <div style={{font:'500 14px var(--font-ui)'}}>{exportErr}</div>
        </div>
      )}

      {/* Per-ministry exports */}
      <div className="min-grid">
        {[
          { num:'01', catId:1, title:'משרד הכלכלה — מזון ומוצרי צריכה',   label:'משרד הכלכלה' },
          { num:'02', catId:2, title:'משרד האנרגיה — דלקים ופחם',          label:'משרד האנרגיה' },
          { num:'03', catId:3, title:'משרד החקלאות — גרעינים ומספוא',      label:'משרד החקלאות' },
          { num:'04', catId:4, title:'משרד הבריאות — ציוד רפואי קריטי',    label:'משרד הבריאות' },
        ].map(({ num, catId, title, label }) => (
          <div key={num} className="card" style={{padding:18, display:'flex', flexDirection:'column', gap:12}}>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
              <div>
                <div className="mono" style={{font:'600 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>טבלה {num}</div>
                <div style={{font:'600 15px var(--font-ui)', marginTop:2}}>{title}</div>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => run(label, catId)} disabled={busy}>
                <Icon name="download" size={13}/> ייצוא
              </button>
            </div>
            <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>
              {PRODUCTS.filter(p => p.category_id === catId).map(p => p.name).join(' · ')}
            </div>
          </div>
        ))}
      </div>

      {/* Report import section */}
      <div className="card" style={{padding:24, display:'flex', flexDirection:'column', gap:14}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12}}>
          <div>
            <div style={{font:'600 16px var(--font-ui)'}}>ייבוא דיווחים מאקסל</div>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)', marginTop:4}}>
              עמודות: <span className="mono" style={{fontSize:12}}>שם ארגון, שם מוצר, מלאי נוכחי, מלאי בדרך, יחידה, סטטוס אספקה, סטטוס איכות, תאריך הגעה, הערות, תאריך דיווח</span>
            </div>
          </div>
          <label className="btn btn--ghost" style={{cursor:'pointer'}}>
            <Icon name="download" size={15}/> בחר קובץ אקסל לייבוא
            <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={onImportReportsFile}/>
          </label>
        </div>
        {importDone > 0 && (
          <div className="banner banner--ok anim-in">
            <Icon name="check" size={18} stroke={2.2}/>
            <div>
              <div style={{font:'500 14px var(--font-ui)'}}>יובאו {importDone} דיווחים בהצלחה.</div>
              {importFailed > 0 && <div style={{font:'400 12px var(--font-ui)', opacity:.85, marginTop:2}}>{importFailed} שורות נכשלו (ארגון לא נמצא).</div>}
            </div>
          </div>
        )}
        {importErr && (
          <div className="banner banner--bad anim-in">
            <Icon name="alert" size={18} stroke={2.2}/>
            <div style={{font:'500 14px var(--font-ui)'}}>{importErr}</div>
          </div>
        )}
      </div>

      {/* Report import preview drawer */}
      {importing && importRows && (
        <div className="drawer-scrim" onClick={() => !importBusy && setImporting(false)}>
          <div className="drawer anim-in" role="dialog" style={{maxWidth:720}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--line)'}}>
              <div>
                <div style={{font:'600 11px var(--font-ui)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)'}}>ייבוא דיווחים מאקסל</div>
                <h2 style={{margin:'4px 0 0', font:'600 20px var(--font-ui)'}}>נמצאו {importRows.length} שורות לייבוא</h2>
              </div>
              <button className="btn btn--ghost btn--sm" disabled={importBusy} onClick={() => setImporting(false)}><Icon name="x" size={14}/></button>
            </div>
            <div className="drawer-body">
              <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)', marginBottom:12}}>
                שורות מאותה ארגון + תאריך יאוגדו לדיווח אחד.
              </div>
              <div className="card" style={{overflow:'hidden'}}>
                <table className="tbl" style={{fontSize:13}}>
                  <thead><tr><th>ארגון</th><th>שם מוצר</th><th>מלאי נוכחי</th><th>מלאי בדרך</th><th>תאריך דיווח</th></tr></thead>
                  <tbody>
                    {importRows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td style={{fontWeight:500}}>{r['שם ארגון'] || r['org'] || '—'}</td>
                        <td>{r['שם מוצר'] || r['product'] || '—'}</td>
                        <td className="num">{r['מלאי נוכחי'] || r['current'] || '—'}</td>
                        <td className="num">{r['מלאי בדרך'] || r['incoming'] || '—'}</td>
                        <td style={{color:'var(--ink-2)'}}>{r['תאריך דיווח'] || r['date'] || '—'}</td>
                      </tr>
                    ))}
                    {importRows.length > 10 && (
                      <tr><td colSpan={5} style={{color:'var(--ink-3)', textAlign:'center', padding:'10px 0'}}>...ו-{importRows.length - 10} שורות נוספות</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end', padding:'14px 24px', borderTop:'1px solid var(--line)', background:'var(--surface)'}}>
              <button className="btn btn--ghost" disabled={importBusy} onClick={() => setImporting(false)}>ביטול</button>
              <button className="btn btn--accent" disabled={importBusy} onClick={doImportReports}>
                {importBusy ? 'מייבא…' : `ייבא ${importRows.length} שורות`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifyView({ user, orgs, notifications, onSend }) {
  const [msg, setMsg]       = useState('');
  const [target, setTarget] = useState('all');
  const [orgId, setOrgId]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [sent, setSent]     = useState(false);
  const [err, setErr]       = useState('');

  // Schedule settings
  const [scheduleHour, setScheduleHour]   = useState(8);
  const [scheduleDays, setScheduleDays]   = useState([]);
  const [scheduleBusy, setScheduleBusy]   = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  useEffect(() => {
    dbFetchAppSettings().then(s => {
      if (s.notify_hour !== undefined) setScheduleHour(Number(s.notify_hour));
      if (s.notify_skip_days) {
        try { setScheduleDays(JSON.parse(s.notify_skip_days)); } catch {}
      }
    }).catch(() => {});
  }, []);

  function toggleDay(d) {
    setScheduleDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  async function saveSchedule() {
    setScheduleBusy(true); setScheduleSaved(false);
    try {
      await dbSaveAppSetting('notify_hour', String(scheduleHour));
      await dbSaveAppSetting('notify_skip_days', JSON.stringify(scheduleDays));
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 3000);
    } catch(e) { console.warn('saveSchedule error:', e); }
    setScheduleBusy(false);
  }

  async function send() {
    if (!msg.trim()) return;
    setErr(''); setBusy(true); setSent(false);
    try {
      await onSend({
        message: msg.trim(),
        org_id: target === 'org' ? Number(orgId) : null,
        sent_by: user.id,
      });
      setMsg(''); setSent(true); setTimeout(() => setSent(false), 3000);
    } catch(e) { setErr(e.message || 'שגיאה בשליחה'); }
    setBusy(false);
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22, maxWidth:780}}>
      <PageHeader tag="04 · NOTIFY" title="שליחת התראות לשטח" sub="הודעות יוצגו לנציגי השטח בעת כניסה לדיווח"/>

      <div className="card" style={{padding:24, display:'flex', flexDirection:'column', gap:16}}>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <label style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>יעד ההתראה</label>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            {[
              { value:'all', label:'כל הארגונים' },
              { value:'org', label:'ארגון ספציפי' },
            ].map(o => (
              <label key={o.value} style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', font:'500 14px var(--font-ui)'}}>
                <input type="radio" name="target" value={o.value} checked={target===o.value} onChange={() => setTarget(o.value)} style={{accentColor:'var(--ink)'}}/>
                {o.label}
              </label>
            ))}
          </div>
          {target === 'org' && (
            <select className="select" value={orgId} onChange={e => setOrgId(e.target.value)} style={{maxWidth:340}}>
              <option value="">— בחר ארגון —</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          )}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <label style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>תוכן ההתראה</label>
          <textarea className="input" rows={4} maxLength={500} placeholder="הקלד את ההודעה לנציגי השטח…"
            value={msg} onChange={e => setMsg(e.target.value)} style={{resize:'vertical'}}/>
          <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', textAlign:'left'}}>{msg.length}/500</div>
        </div>

        {err && <div className="banner banner--bad"><Icon name="alert" size={16}/> {err}</div>}
        {sent && <div className="banner banner--ok anim-in"><Icon name="check" size={16}/> ההתראה נשלחה בהצלחה.</div>}

        <button className="btn btn--accent" disabled={busy || !msg.trim() || (target==='org' && !orgId)} onClick={send} style={{alignSelf:'flex-start', minWidth:200}}>
          {busy ? 'שולח…' : <><Icon name="bell" size={15}/> {target==='all' ? 'שלח לכולם' : 'שלח לארגון'}</>}
        </button>
      </div>

      {notifications.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', letterSpacing:'.04em', textTransform:'uppercase'}}>התראות שנשלחו</div>
          <div className="card" style={{overflow:'hidden'}}>
            <table className="tbl">
              <thead><tr><th>הודעה</th><th>יעד</th><th>נשלח</th></tr></thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td style={{maxWidth:400}}>{n.message}</td>
                    <td>{n.org_id ? (orgs.find(o=>o.id===n.org_id)?.name || `org ${n.org_id}`) : <span className="chip chip--accent" style={{fontSize:11}}>כולם</span>}</td>
                    <td style={{color:'var(--ink-3)'}}>{formatDate(new Date(n.sent_at).getTime())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule editor */}
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', letterSpacing:'.04em', textTransform:'uppercase'}}>תזמון שליחה אוטומטי</div>
        <div className="card" style={{padding:20, display:'flex', flexDirection:'column', gap:16}}>
          <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)', display:'flex', alignItems:'flex-start', gap:10}}>
            <Icon name="alert" size={15} style={{marginTop:2, color:'var(--warn)'}}/>
            <span>הגדרות אלו נשמרות במערכת, אך שליחה אוטומטית מחייבת הפעלת תהליך שרת-צד (cron / scheduler). ניתן להוסיף זאת בנפרד.</span>
          </div>
          <div style={{display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-start'}}>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              <label style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>שעת שליחה</label>
              <select className="select" value={scheduleHour} onChange={e => setScheduleHour(Number(e.target.value))} style={{width:130}}>
                {Array.from({length:24}, (_,h) => (
                  <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>
                ))}
              </select>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              <label style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>ימי דילוג (לא תישלח התראה)</label>
              <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:2}}>
                {['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'].map((d, i) => (
                  <label key={i} style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer', padding:'5px 10px', borderRadius:6, border:'1px solid var(--line)', background: scheduleDays.includes(i) ? 'var(--accent-bg)' : 'var(--bg)', font:'500 13px var(--font-ui)', userSelect:'none'}}>
                    <input type="checkbox" checked={scheduleDays.includes(i)} onChange={() => toggleDay(i)} style={{accentColor:'var(--accent)', width:14, height:14}}/>
                    {d}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {scheduleSaved && <div className="banner banner--ok anim-in"><Icon name="check" size={16}/> הגדרות התזמון נשמרו.</div>}
          <button className="btn btn--accent" style={{alignSelf:'flex-start', minWidth:180}} disabled={scheduleBusy} onClick={saveSchedule}>
            {scheduleBusy ? 'שומר…' : <><Icon name="history" size={14}/> שמור הגדרות תזמון</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SUBJECT = 'תזכורת דיווח מלאי — מערכת רחל';
const DEFAULT_BODY = `שלום {שם_ארגון},

זוהי תזכורת לדיווח המלאי התקופתי במסגרת מערכת רחל.

אנא היכנסו למערכת ומלאו את הדיווח בהקדם.

בברכה,
מטה החירום הלאומי`;

function EmailView({ user, orgs, users }) {
  const [subject,     setSubject]     = useState(DEFAULT_SUBJECT);
  const [body,        setBody]        = useState(DEFAULT_BODY);
  const [target,      setTarget]      = useState('all');
  const [orgId,       setOrgId]       = useState('');
  const [catId,       setCatId]       = useState('');
  const [localEmails, setLocalEmails] = useState({});
  const [editEmail,   setEditEmail]   = useState(null);
  const [busy,        setBusy]        = useState(false);
  const [results,     setResults]     = useState(null);
  const [err,         setErr]         = useState('');

  useEffect(() => {
    // Build email map from rachel_users.email (same source as cron reminders)
    const map = {};
    for (const u of users) {
      if (u.role === 'FIELD_USER' && u.email && !map[u.organization_id]) {
        map[u.organization_id] = u.email;
      }
    }
    setLocalEmails(map);
    dbFetchAppSettings().then(s => {
      if (s.email_subject) setSubject(s.email_subject);
      if (s.email_body)    setBody(s.email_body);
    }).catch(() => {});
  }, [users]);

  async function saveTemplate() {
    await dbSaveAppSetting('email_subject', subject);
    await dbSaveAppSetting('email_body', body);
  }

  async function saveOrgEmail(oId, email) {
    const u = users.find(x => x.organization_id === oId && x.role === 'FIELD_USER');
    if (!u) return;
    await dbUpdateUser(u.id, { email: email.trim() || null });
    setLocalEmails(prev => ({ ...prev, [oId]: email.trim() }));
    setEditEmail(null);
  }

  function buildHtml(orgName) {
    const text = body.replace(/\{שם_ארגון\}/g, orgName);
    return `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.7;max-width:600px">
      ${text.split('\n').map(l => l ? `<p style="margin:0 0 10px">${l}</p>` : '<br/>').join('')}
    </div>`;
  }

  async function send() {
    setErr(''); setBusy(true); setResults(null);
    try {
      await saveTemplate().catch(() => {});

      let targets = [];
      if (target === 'all')       targets = orgs.filter(o => o.active);
      else if (target === 'cat')  targets = orgs.filter(o => o.active && o.cat_id === Number(catId));
      else if (target === 'org')  targets = orgs.filter(o => o.id === Number(orgId));

      const ok = [], failed = [];
      for (const org of targets) {
        const email = localEmails[org.id];
        if (!email) { failed.push({ org: org.name, reason: 'אין כתובת מייל' }); continue; }
        try {
          await dbSendEmail({ to: email, subject, html: buildHtml(org.name) });
          ok.push(org.name);
        } catch(e) { failed.push({ org: org.name, reason: e.message }); }
      }
      setResults({ ok, failed });
    } catch(e) {
      setErr(e.message || 'שגיאה בשליחה');
    } finally {
      setBusy(false);
    }
  }

  const targetOrgs = target === 'all' ? orgs.filter(o => o.active)
    : target === 'cat' ? orgs.filter(o => o.active && o.cat_id === Number(catId))
    : orgs.filter(o => o.id === Number(orgId));

  const missingEmails = targetOrgs.filter(o => !localEmails[o.id]).length;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22, maxWidth:900}}>
      <PageHeader tag="05 · EMAIL" title="שליחת מיילים לארגונים" sub={`נשלח מ־morisiusmoris@gmail.com · ניתן לערוך תבנית ולשלוח לכלל הארגונים או לחלקם`}/>

      {/* Recipients */}
      <div className="card" style={{padding:20, display:'flex', flexDirection:'column', gap:14}}>
        <div style={{font:'600 14px var(--font-ui)'}}>נמענים</div>
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          {[{v:'all',l:'כל הארגונים'},{v:'cat',l:'לפי משרד'},{v:'org',l:'ארגון ספציפי'}].map(o => (
            <label key={o.v} style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',font:'500 14px var(--font-ui)'}}>
              <input type="radio" name="etarget" value={o.v} checked={target===o.v} onChange={()=>setTarget(o.v)} style={{accentColor:'var(--ink)'}}/>
              {o.l}
            </label>
          ))}
        </div>
        {target === 'cat' && (
          <select className="select" value={catId} onChange={e=>setCatId(e.target.value)} style={{maxWidth:340}}>
            <option value="">— בחר משרד —</option>
            {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {target === 'org' && (
          <select className="select" value={orgId} onChange={e=>setOrgId(e.target.value)} style={{maxWidth:340}}>
            <option value="">— בחר ארגון —</option>
            {orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}
        {targetOrgs.length > 0 && (
          <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>
            {targetOrgs.length} ארגונים נבחרו ·{' '}
            <span style={{color: missingEmails === targetOrgs.length ? 'var(--bad)' : missingEmails > 0 ? 'var(--warn)' : 'var(--ok)', fontWeight:500}}>
              {targetOrgs.length - missingEmails} עם מייל
            </span>
            {missingEmails > 0 && <span style={{color:'var(--ink-3)'}}>, {missingEmails} ללא מייל</span>}
          </div>
        )}
      </div>

      {/* Email addresses per org */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'12px 16px', borderBottom:'1px solid var(--line)', font:'600 13px var(--font-ui)'}}>כתובות מייל לארגונים</div>
        <table className="tbl" style={{fontSize:13}}>
          <thead><tr><th>ארגון</th><th>כתובת מייל</th><th style={{width:80}}></th></tr></thead>
          <tbody>
            {orgs.filter(o=>o.active).map(o => (
              <tr key={o.id}>
                <td style={{fontWeight:500}}>{o.name}</td>
                <td>
                  {editEmail === o.id ? (
                    <form onSubmit={e=>{e.preventDefault(); saveOrgEmail(o.id, e.target.email.value);}} style={{display:'flex',gap:6}}>
                      <input name="email" type="email" className="input" defaultValue={localEmails[o.id]||''} placeholder="example@company.com" style={{flex:1}} autoFocus/>
                      <button type="submit" className="btn btn--accent btn--sm">שמור</button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={()=>setEditEmail(null)}>ביטול</button>
                    </form>
                  ) : (
                    <span style={{color: localEmails[o.id] ? 'var(--ink)' : 'var(--ink-3)'}}>
                      {localEmails[o.id] || <em>לא הוגדר</em>}
                    </span>
                  )}
                </td>
                <td>
                  {editEmail !== o.id && (
                    <button className="btn btn--ghost btn--sm" onClick={()=>setEditEmail(o.id)}>
                      <Icon name="plus" size={12}/> {localEmails[o.id] ? 'ערוך' : 'הוסף'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Template editor */}
      <div className="card" style={{padding:20, display:'flex', flexDirection:'column', gap:14}}>
        <div style={{font:'600 14px var(--font-ui)'}}>תבנית המייל <span style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>· השתמש ב-{'{שם_ארגון}'} לשם הארגון</span></div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <label style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>נושא</label>
          <input className="input" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="נושא המייל"/>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <label style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>גוף ההודעה</label>
          <textarea className="input" rows={10} value={body} onChange={e=>setBody(e.target.value)} style={{resize:'vertical', fontFamily:'var(--font-ui)', lineHeight:1.7}}/>
        </div>
        <button className="btn btn--ghost btn--sm" style={{alignSelf:'flex-start'}} onClick={saveTemplate}>
          <Icon name="check" size={13}/> שמור תבנית
        </button>
      </div>

      {/* Send button */}
      {err && (
        <div className="banner banner--bad anim-in">
          <Icon name="alert" size={18} stroke={2.2}/>
          <div style={{font:'500 14px var(--font-ui)'}}>{err}</div>
        </div>
      )}
      {results && results.ok.length === 0 && results.failed.length === 0 && (
        <div className="banner banner--bad anim-in">
          <Icon name="alert" size={18} stroke={2.2}/>
          <div style={{font:'500 14px var(--font-ui)'}}>לא נבחרו ארגונים לשליחה.</div>
        </div>
      )}
      {results && results.ok.length === 0 && results.failed.length > 0 && (
        <div className="banner banner--bad anim-in">
          <Icon name="alert" size={18} stroke={2.2}/>
          <div>
            <div style={{font:'600 14px var(--font-ui)'}}>לא נשלח אף מייל</div>
            <div style={{font:'400 12px var(--font-ui)', marginTop:4, opacity:.9}}>
              {results.failed.every(f => f.reason === 'אין כתובת מייל')
                ? 'לאף ארגון בנבחרים אין כתובת מייל. הוסיפו כתובות בטבלה למעלה.'
                : results.failed.map(f=>`${f.org}: ${f.reason}`).join(' · ')}
            </div>
          </div>
        </div>
      )}
      {results && results.ok.length > 0 && (
        <div className={`banner ${results.failed.length===0?'banner--ok':'banner--warn'} anim-in`}>
          <Icon name="check" size={18} stroke={2.2}/>
          <div>
            <div style={{font:'600 15px var(--font-ui)'}}>
              ✓ נשלח בהצלחה ל-{results.ok.length} ארגונים!
            </div>
            {results.failed.length > 0 && (
              <div style={{font:'400 12px var(--font-ui)', marginTop:4, opacity:.9}}>
                {results.failed.length} נכשלו: {results.failed.map(f=>`${f.org} (${f.reason})`).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
      <button className="btn btn--accent btn--lg" style={{alignSelf:'flex-start', minWidth:220}}
        disabled={busy || (target==='org' && !orgId) || (target==='cat' && !catId)}
        onClick={send}>
        {busy ? 'שולח…' : <><Icon name="mail" size={16}/> שלח מייל ל{target==='all'?'כל הארגונים':target==='cat'?'משרד נבחר':'ארגון נבחר'}</>}
      </button>
    </div>
  );
}

function ModeView({ mode, onSetMode, users }) {
  const [pending, setPending] = useState(mode);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saved, setSaved] = useState(false);
  const [emailsSent, setEmailsSent] = useState(0);

  useEffect(() => { setPending(mode); }, [mode]);

  function buildModeEmail(newMode) {
    const isEmergency = newMode === 'emergency';
    const headerBg = isEmergency
      ? 'linear-gradient(135deg,#b91c1c,#7f1d1d)'
      : 'linear-gradient(135deg,#1a4fa0,#143d7a)';
    const title = isEmergency ? '⚠️ שינוי מצב לאומי — חירום' : '✓ שינוי מצב לאומי — שגרה';
    const bodyText = isEmergency
      ? 'המצב הלאומי שונה ל<strong>חירום</strong>. החל מעכשיו נדרש <strong>דיווח מלאי יומי</strong>. אנא היכנסו למערכת ועדכנו את נתוני המלאי בכל יום.'
      : 'המצב הלאומי שונה ל<strong>שגרה</strong>. החל מעכשיו נדרש <strong>דיווח מלאי שבועי</strong> (אחת לשבוע, בכל יום ראשון).';
    const urgencyBox = isEmergency
      ? `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 18px;margin:16px 0">
          <strong style="color:#b91c1c;font-size:14px">⚠️ מצב חירום לאומי</strong>
          <p style="margin:6px 0 0;font-size:13px;color:#7f1d1d">דיווח יומי הוא חובה. אי-דיווח עלול לפגוע בתיאום הלאומי.</p>
        </div>`
      : `<div style="background:#f0f7f0;border:1px solid #c3e6c3;border-radius:8px;padding:14px 18px;margin:16px 0">
          <strong style="color:#1a6b3a;font-size:14px">✓ חזרה לשגרה</strong>
          <p style="margin:6px 0 0;font-size:13px;color:#145530">דיווח שבועי, כל יום ראשון.</p>
        </div>`;
    return `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)">
  <div style="background:${headerBg};padding:28px 32px">
    <div style="color:rgba(255,255,255,.7);font-size:13px;margin-bottom:6px">מערכת רחל — דיווח מלאי לאומי</div>
    <h1 style="color:white;margin:0;font-size:22px">${title}</h1>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:15px;color:#555;line-height:1.7">${bodyText}</p>
    ${urgencyBox}
    <div style="text-align:center">
      <a href="http://213.199.53.73:4001" style="display:inline-block;background:#1a4fa0;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:15px;font-weight:bold;margin:20px 0">כניסה למערכת הדיווח ←</a>
    </div>
  </div>
  <div style="padding:16px 32px;text-align:center;color:#aaa;font-size:12px;border-top:1px solid #eee">מערכת רחל — מטה החירום הלאומי | הודעה אוטומטית, אין להשיב למייל זה</div>
</div></body></html>`;
  }

  async function doApply() {
    setSaving(true);
    setSaveErr('');
    setSaved(false);
    setEmailsSent(0);
    try {
      await onSetMode(pending);
      setConfirming(false);

      // Send state-change email to all field users with email addresses
      const subject = pending === 'emergency'
        ? '⚠️ שינוי מצב לאומי לחירום — נדרש דיווח יומי — מערכת רחל'
        : '✓ שינוי מצב לאומי לשגרה — דיווח שבועי — מערכת רחל';
      const html = buildModeEmail(pending);
      const recipients = (users || []).filter(u => u.role === 'FIELD_USER' && u.email);
      let sent = 0;
      for (const u of recipients) {
        await dbSendEmail({ to: u.email, subject, html }).catch(() => {});
        sent++;
      }
      setEmailsSent(sent);
      setSaved(true);
      setTimeout(() => setSaved(false), 6000);
    } catch(e) {
      setSaveErr('שגיאה בשמירה: ' + (e?.message || e));
    }
    setSaving(false);
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22, maxWidth:780}}>
      <PageHeader tag="06 · MODE" title="מצב לאומי והתראות" sub="בורר זה משפיע על תדירות חובת הדיווח של כלל הארגונים במשק."/>
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {[
          { value:'routine',   label:'שגרה',  hint:'תדירות דיווח: אחת ל-7 ימים.', cls:'ok' },
          { value:'emergency', label:'חירום', hint:'תדירות דיווח: יומי (24 שעות).', cls:'bad' },
        ].map((opt, i) => (
          <label key={opt.value} style={{display:'flex', alignItems:'center', gap:14, padding:'18px 20px', borderTop: i === 0 ? 0 : '1px solid var(--line)', cursor:'pointer', background: pending === opt.value ? 'var(--bg-2)' : 'transparent'}}>
            <input type="radio" name="mode" checked={pending === opt.value} onChange={() => setPending(opt.value)} style={{width:18, height:18, accentColor:'var(--ink)'}}/>
            <div style={{flex:1}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{font:'600 16px var(--font-ui)'}}>{opt.label}</span>
                {mode === opt.value && <span className={`chip chip--${opt.cls}`} style={{fontSize:11}}>פעיל כעת</span>}
              </div>
              <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)', marginTop:4}}>{opt.hint}</div>
            </div>
          </label>
        ))}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>שינוי המצב מעדכן באופן מיידי את תדירות הדיווח.</div>
        <button className="btn btn--accent" disabled={pending === mode || saving} onClick={() => setConfirming(true)}>החל שינוי</button>
      </div>
      {saved && (
        <div className="banner banner--ok anim-in">
          <Icon name="check" size={18} stroke={2.2}/>
          <div>
            <div style={{font:'600 14px var(--font-ui)'}}>המצב הלאומי עודכן ונשמר בהצלחה.</div>
            <div style={{font:'400 12px var(--font-ui)', marginTop:3, opacity:.85}}>
              {emailsSent > 0
                ? `מייל עדכון נשלח ל-${emailsSent} נציגי שטח.`
                : 'לא נשלחו מיילים — אין נציגי שטח עם כתובת מייל מוגדרת.'}
            </div>
          </div>
        </div>
      )}
      {saveErr && (
        <div className="banner banner--bad anim-in">
          <Icon name="alert" size={18} stroke={2.2}/>
          <div style={{font:'500 14px var(--font-ui)'}}>{saveErr}</div>
        </div>
      )}
      {confirming && (
        <div className="card anim-in" style={{padding:18, borderColor:'var(--warn-line)', background:'var(--warn-bg)'}}>
          <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
            <Icon name="alert" size={18} stroke={2.2} style={{color:'var(--warn)', marginTop:2}}/>
            <div style={{flex:1}}>
              <div style={{font:'600 14px var(--font-ui)', color:'var(--warn)'}}>אישור החלפת מצב לאומי ל-«{pending === 'emergency' ? 'חירום' : 'שגרה'}»</div>
              <div style={{display:'flex', gap:8, marginTop:14}}>
                <button className="btn btn--accent btn--sm" disabled={saving} onClick={doApply}>
                  {saving ? 'שומר…' : 'אישור והחלה'}
                </button>
                <button className="btn btn--ghost btn--sm" disabled={saving} onClick={() => setConfirming(false)}>ביטול</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditView({ log, users }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader tag="07 · AUDIT" title="יומן ייצוא ופעולות" sub="EXPORT_LOG — נרשם אוטומטית בכל הורדה."/>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead><tr><th style={{width:60}}>#</th><th>סוג ייצוא</th><th>משתמש מטה</th><th>תאריך ושעה</th></tr></thead>
          <tbody>
            {log.map((e, i) => {
              const u = users.find(x => x.id === e.user_id);
              return (
                <tr key={e.id}>
                  <td className="num" style={{color:'var(--ink-3)'}}>{String(log.length - i).padStart(3,'0')}</td>
                  <td style={{fontWeight:500}}>{e.type}</td>
                  <td>{u?.full_name || '—'} <span className="mono" style={{color:'var(--ink-3)', fontSize:12, marginInlineStart:6}}>{u?.id_number}</span></td>
                  <td><span className="num">{formatDate(e.at)}</span> <span style={{color:'var(--ink-3)'}}>· {relTime(e.at)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
