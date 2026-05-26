// HQ user screens — desktop. Sidebar nav, monitor table, mode toggle, export, audit log.

const { useState: useStateH, useMemo: useMemoH } = React;

function HQShell({ user, onLogout, mode, onSetMode, orgs, users, onAddOrganization, onUpdateOrganization }) {
  const [tab, setTab] = useStateH('monitor');
  const monitor = useMemoH(() => sampleHqMonitor(), []);
  const [exportLog, setExportLog] = useStateH([
    { id: 1, user_id: user.id, type: 'אקסל ארצי מלא',        at: Date.now() - 6 * 3600 * 1000 },
    { id: 2, user_id: user.id, type: 'אקסל — משרד האנרגיה', at: Date.now() - 28 * 3600 * 1000 },
  ]);

  function doExport(type) {
    setExportLog(prev => [{ id: Date.now(), user_id: user.id, type, at: Date.now() }, ...prev]);
  }

  return (
    <div className="hq-shell" style={{minHeight:'100vh'}}>
      {/* Main */}
      <main className="hq-main" style={{maxWidth:1280}}>
        {tab === 'monitor' && <MonitorView monitor={monitor} mode={mode} orgs={orgs}/>}
        {tab === 'orgs'    && <OrgsView orgs={orgs} users={users}
                                        onAdd={onAddOrganization}
                                        onUpdate={onUpdateOrganization}/>}
        {tab === 'export'  && <ExportView onExport={doExport} mode={mode}/>}
        {tab === 'mode'    && <ModeView mode={mode} onSetMode={onSetMode}/>}
        {tab === 'audit'   && <AuditView log={exportLog} users={users}/>}
      </main>

      {/* Sidebar */}
      <aside className="hq-side">
        <Crest subtitle="חמ״ל מרכזי"/>
        <nav style={{display:'flex', flexDirection:'column', gap:2, marginTop:8}}>
          {[
            { id:'monitor', icon:'home',     label:'ניטור ארגונים' },
            { id:'orgs',    icon:'user',     label:'ניהול ארגונים' },
            { id:'export',  icon:'download', label:'ייצוא נתונים ארצי' },
            { id:'mode',    icon:'bell',     label:'מצב לאומי והתראות' },
            { id:'audit',   icon:'history',  label:'יומן ייצוא ופעולות' },
          ].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{
                appearance:'none', border:0, cursor:'pointer',
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 11px', borderRadius:6,
                background: tab === n.id ? 'var(--bg-2)' : 'transparent',
                color: tab === n.id ? 'var(--ink)' : 'var(--ink-2)',
                font:'500 14px var(--font-ui)',
                textAlign:'right',
              }}>
              <Icon name={n.icon} size={16}/> {n.label}
            </button>
          ))}
        </nav>

        <div className="hr" style={{margin:'4px 0'}}/>
        <div className="card" style={{padding:12, display:'flex', flexDirection:'column', gap:8, background:'var(--bg-2)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{font:'600 11px var(--font-ui)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-3)'}}>מצב לאומי</span>
            <span className="chip" style={{fontSize:10, padding:'1px 7px'}}>
              <span className="dot" style={{background: mode === 'emergency' ? 'var(--bad)' : 'var(--ok)'}}/>
              {mode === 'emergency' ? 'חירום' : 'שגרה'}
            </span>
          </div>
          <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-2)'}}>
            תדירות דיווח: {mode === 'emergency' ? 'יומי (24ש׳)' : 'אחת ל-7 ימים'}
          </div>
          <button className="btn btn--ghost btn--sm" onClick={() => setTab('mode')}>שינוי מצב</button>
        </div>

        <div style={{marginTop:'auto', display:'flex', flexDirection:'column', gap:8}}>
          <div className="hr"/>
          <div style={{display:'flex', alignItems:'center', gap:10, padding:'6px 4px'}}>
            <div style={{width:34, height:34, borderRadius:8, background:'var(--bg-2)', border:'1px solid var(--line)', display:'grid', placeItems:'center', font:'700 12px var(--font-mono)'}}>
              {user.full_name.split(' ').map(s=>s[0]).join('').slice(0,2)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{font:'500 13px var(--font-ui)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{user.full_name}</div>
              <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>{user.title}</div>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={onLogout} title="יציאה"><Icon name="logout" size={13}/></button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Monitor view — dead zones
// ─────────────────────────────────────────────────────────────────────────────

function MonitorView({ monitor, mode, orgs }) {
  const threshold = mode === 'emergency' ? 24 : 7 * 24;
  const enriched = monitor.map(m => {
    const org = orgs.find(o => o.id === m.org_id);
    const cat = CATEGORIES.find(c => c.id === org?.cat_id);
    const hoursAgo = (Date.now() - m.last) / 3600000;
    const dead = hoursAgo > threshold;
    return { ...m, org, cat, hoursAgo, dead };
  }).filter(m => m.org);

  const reported = enriched.filter(m => !m.dead).length;
  const total = enriched.length;
  const dead = total - reported;

  const [filter, setFilter] = useStateH('all'); // all / reported / dead
  const [searchQ, setSearchQ] = useStateH('');

  const filtered = enriched.filter(m =>
    (filter === 'all' || (filter === 'reported' ? !m.dead : m.dead)) &&
    (!searchQ || m.org.name.includes(searchQ))
  );

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader
        title="ניטור ארגונים"
        sub={`תמונת מצב ארצית · ${mode === 'emergency' ? 'תדירות יומית (חירום)' : 'תדירות שבועית (שגרה)'}`}
        right={<PillToggle value={filter} onChange={setFilter}
          options={[
            { value:'all',      label:`הכל · ${total}` },
            { value:'reported', label:`דיווחו · ${reported}` },
            { value:'dead',     label:`שטחים מתים · ${dead}` },
          ]}/>}
      />

      {/* KPIs */}
      <div className="hq-kpis">
        <Kpi label="ארגונים מחויבי דיווח" value={total}/>
        <Kpi label="דיווחו בחלון הנדרש"   value={reported}    accent="ok"/>
        <Kpi label="שטחים מתים"           value={dead}        accent={dead > 0 ? 'bad' : 'ok'}/>
        <Kpi label="חלון דיווח נוכחי"     value={mode === 'emergency' ? '24 ש׳' : '168 ש׳'}/>
      </div>

      {/* Search + Table */}
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
              <th style={{width:120}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.org_id}>
                <td style={{color:'var(--ink-3)'}} className="num">{String(i+1).padStart(2,'0')}</td>
                <td style={{fontWeight:500}}>{m.org.name}</td>
                <td style={{color:'var(--ink-2)'}}>{m.org.type}</td>
                <td>{m.cat ? <span className="chip" style={{fontSize:11}}>{m.cat.short}</span> : '—'}</td>
                <td style={{color:'var(--ink-2)'}}>{m.user}</td>
                <td>
                  <span className="num" style={{color:'var(--ink)'}}>{formatDate(m.last)}</span>
                  <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>{relTime(m.last)}</div>
                </td>
                <td>
                  {m.dead
                    ? <span className="chip chip--bad"><Icon name="alert" size={11}/> שטח מת</span>
                    : <span className="chip chip--ok"><Icon name="check" size={11}/> דיווח תקין</span>}
                </td>
                <td>
                  <button className="btn btn--ghost btn--sm" disabled={!m.dead}>שלח תזכורת</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)', margin:0}}>
        המידור נאכף בשרת — נתוני המוצרים והכמויות של ארגון אינם נחשפים למטה ברשת האזרחית, רק עובדת קיום הדיווח.
        ייצוא נתונים מפורט מבוצע דרך הלשונית הייעודית ומתועד ביומן.
      </p>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  const color = accent === 'ok' ? 'var(--ok)' : accent === 'bad' ? 'var(--bad)' : 'var(--ink)';
  return (
    <div className="card" style={{padding:'16px 18px', display:'flex', flexDirection:'column', gap:6}}>
      <div style={{font:'600 11px var(--font-ui)', color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase'}}>{label}</div>
      <div className="num" style={{font:'600 28px var(--font-mono)', color, lineHeight:1, fontFeatureSettings:'"tnum" 1'}}>{value}</div>
    </div>
  );
}

function PageHeader({ title, sub, right }) {
  return (
    <header style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, paddingBottom:14, borderBottom:'1px solid var(--line)', flexWrap:'wrap'}}>
      <div style={{minWidth:0}}>
        <h1 style={{margin:0, font:'600 22px var(--font-ui)', letterSpacing:'-.005em'}}>{title}</h1>
        {sub && <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)', marginTop:6}}>{sub}</div>}
      </div>
      {right && <div style={{flex:'0 0 auto'}}>{right}</div>}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export view — four government partitions
// ─────────────────────────────────────────────────────────────────────────────

function ExportView({ onExport, mode }) {
  const [busy, setBusy] = useStateH(false);
  const [lastExport, setLastExport] = useStateH(null);

  function run(type) {
    setBusy(true);
    setTimeout(() => {
      onExport(type);
      setLastExport({ type, at: Date.now() });
      setBusy(false);
    }, 900);
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader
        title="ייצוא נתונים ארצי"
        sub="קובץ אקסל מנורמל, מפוצל לארבע מחיצות לפי משרדי הממשלה השותפים"
        right={null}
      />

      {/* Hero export card */}
      <div className="card" style={{padding:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:18}}>
        <div style={{display:'flex', flexDirection:'column', gap:6, maxWidth:560}}>
          <div style={{font:'600 17px var(--font-ui)'}}>ייצוא קובץ ארצי מלא</div>
          <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)'}}>
            הקובץ מכיל את הדיווח האחרון של כל ארגון, מסונן ל-{mode === 'emergency' ? '24 השעות האחרונות' : '7 הימים האחרונים'}.
            מבנה הטבלאות נעול לפי PRD §8 — ארבע מחיצות לפי משרד כלכלה / אנרגיה / חקלאות / בריאות.
            כל הורדה נרשמת אוטומטית ב-EXPORT_LOG.
          </div>
        </div>
        <button className="btn btn--accent btn--lg" disabled={busy} onClick={() => run('אקסל ארצי מלא')} style={{minWidth:230, justifyContent:'center'}}>
          {busy ? 'מייצא…' : <><Icon name="download" size={16}/> ייצוא אקסל ארצי</>}
        </button>
      </div>

      {lastExport && (
        <div className="banner banner--ok anim-in">
          <Icon name="check" size={18} stroke={2.2}/>
          <div>
            <div style={{font:'500 14px var(--font-ui)'}}>הקובץ נוצר בהצלחה: «{lastExport.type}»</div>
            <div style={{font:'400 12px var(--font-ui)', opacity:.85, marginTop:2}}>{formatDate(lastExport.at)} · נרשם ב-EXPORT_LOG · קובץ הורדה מוכן</div>
          </div>
        </div>
      )}

      {/* Per-ministry partitions */}
      <div>
        <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:12}}>
          מבנה הקובץ — ארבע מחיצות (טאבים)
        </div>
        <div className="min-grid">
          <MinistryCard
            num="01" title="משרד הכלכלה — מזון ומוצרי צריכה"
            cols={['PRODUCT_NAME','STRATEGIC_STOCK','OPERATIONAL_STOCK','IN_TRANSIT_STOCK','SUPPLY_STATUS','QUALITY_STATUS']}
            onExport={() => run('אקסל — משרד הכלכלה')} busy={busy}
          />
          <MinistryCard
            num="02" title="משרד האנרגיה — דלקים ופחם"
            cols={['FUEL_TYPE','EMERGENCY_STOCK','TOTAL_MARKET_STOCK','IN_TRANSIT_FORECAST']}
            onExport={() => run('אקסל — משרד האנרגיה')} busy={busy}
          />
          <MinistryCard
            num="03" title="משרד החקלאות — גרעינים ומספוא"
            cols={['PRODUCT_NAME','EMERGENCY_STOCK','OPERATIONAL_STOCK','SHIPPING_FORECAST']}
            onExport={() => run('אקסל — משרד החקלאות')} busy={busy}
          />
          <MinistryCard
            num="04" title="משרד הבריאות — ציוד רפואי קריטי"
            cols={['CATEGORY_FAMILY','PRODUCT_NAME','EXISTING_STOCK']}
            onExport={() => run('אקסל — משרד הבריאות')} busy={busy}
          />
        </div>
      </div>
    </div>
  );
}

function MinistryCard({ num, title, cols, onExport, busy }) {
  return (
    <div className="card" style={{padding:18, display:'flex', flexDirection:'column', gap:12}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div>
          <div className="mono" style={{font:'600 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>טבלה {num}</div>
          <div style={{font:'600 15px var(--font-ui)', marginTop:2}}>{title}</div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={onExport} disabled={busy}>
          <Icon name="download" size={13}/> ייצוא
        </button>
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
        {cols.map(c => (
          <span key={c} className="mono" style={{
            font:'500 11px var(--font-mono)', padding:'3px 8px',
            background:'var(--bg-2)', border:'1px solid var(--line)',
            borderRadius:4, color:'var(--ink-2)',
          }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode view — national status toggle
// ─────────────────────────────────────────────────────────────────────────────

function ModeView({ mode, onSetMode }) {
  const [pending, setPending] = useStateH(mode);
  const [confirming, setConfirming] = useStateH(false);

  function apply() {
    onSetMode(pending);
    setConfirming(false);
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22, maxWidth:780}}>
      <PageHeader title="מצב לאומי והתראות" sub="בורר זה משפיע על תדירות חובת הדיווח של כלל הארגונים במשק וכן על הפעלת מנוע ההתראות."/>

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        {[
          { value:'routine',   label:'שגרה',  hint:'תדירות דיווח: אחת ל-7 ימים. תזכורת ב-12:00 בכל יום שני.', cls:'ok' },
          { value:'emergency', label:'חירום', hint:'תדירות דיווח: יומי (24 שעות). תזכורת אוטומטית פעמיים ביום (08:00 / 17:00).', cls:'bad' },
        ].map((opt, i) => (
          <label key={opt.value} style={{
            display:'flex', alignItems:'center', gap:14,
            padding:'18px 20px',
            borderTop: i === 0 ? 0 : '1px solid var(--line)',
            cursor:'pointer',
            background: pending === opt.value ? 'var(--bg-2)' : 'transparent',
          }}>
            <input type="radio" name="mode" checked={pending === opt.value} onChange={() => setPending(opt.value)}
                   style={{width:18, height:18, accentColor:'var(--ink)'}}/>
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
        <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>
          שינוי המצב מעדכן באופן מיידי את שדה <span className="mono">active</span> בטבלת REPORTING_MODE
          ומפעיל את מנוע ה-ALERT_RULE התואם.
        </div>
        <button className="btn btn--accent" disabled={pending === mode} onClick={() => setConfirming(true)}>החל שינוי</button>
      </div>

      {confirming && (
        <div className="card anim-in" style={{padding:18, borderColor:'var(--warn-line)', background:'var(--warn-bg)'}}>
          <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
            <Icon name="alert" size={18} stroke={2.2} style={{color:'var(--warn)', marginTop:2}}/>
            <div style={{flex:1}}>
              <div style={{font:'600 14px var(--font-ui)', color:'var(--warn)'}}>
                אישור החלפת מצב לאומי ל-«{pending === 'emergency' ? 'חירום' : 'שגרה'}»
              </div>
              <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-2)', marginTop:6}}>
                ההחלפה תשלח באופן מיידי תזכורת לכלל הארגונים שטרם דיווחו בחלון החדש.
              </div>
              <div style={{display:'flex', gap:8, marginTop:14}}>
                <button className="btn btn--accent btn--sm" onClick={apply}>אישור והחלה</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setConfirming(false)}>ביטול</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit — export log
// ─────────────────────────────────────────────────────────────────────────────

function AuditView({ log, users }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader title="יומן ייצוא ופעולות" sub="EXPORT_LOG — נרשם אוטומטית בכל הורדה. רק משתמשי מטה (HQ_USER) צופים."/>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl">
          <thead>
            <tr><th style={{width:60}}>#</th><th>סוג ייצוא</th><th>משתמש מטה</th><th>תאריך ושעה</th></tr>
          </thead>
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

Object.assign(window, { HQShell });