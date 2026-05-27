// HQ Dashboard — desktop control room view
// KPIs + monitor list + criticality overview

function ScreenHQDashboard() {
  const kpis = [
    { label: 'ארגונים פעילים', value: '142', meta: 'מתוך 156 רשומים' },
    { label: 'דיווחים היום', value: '128', meta: '90% covered', variant: 'brand' },
    { label: 'מתעכבים מעל 6 שעות', value: '14', meta: 'דורש מעקב', variant: 'warn' },
    { label: 'קריטיים', value: '03', meta: 'תקוע / פסול', variant: 'bad' },
  ];

  const monitor = [
    { id:'042', org:'שופרסל מרכזים — חיפה', cat:'כלכלה', user:'ד. אבני', t:'14:18', delta:'14m', status:'ok' },
    { id:'088', org:'פז דרום — באר שבע', cat:'אנרגיה', user:'נ. בכר', t:'14:04', delta:'28m', status:'ok' },
    { id:'017', org:'אגן גרעינים — לוד', cat:'חקלאות', user:'מ. צור', t:'12:51', delta:'1h 41m', status:'warn' },
    { id:'061', org:'איכילוב — תל אביב', cat:'בריאות', user:'ר. שגיא', t:'11:32', delta:'3h', status:'warn' },
    { id:'104', org:'יינות ביתן — נתניה', cat:'כלכלה', user:'—', t:'08:14', delta:'6h 18m', status:'bad' },
    { id:'029', org:'דלק — אשדוד', cat:'אנרגיה', user:'—', t:'07:02', delta:'7h 30m', status:'bad' },
  ];

  return (
    <div dir="rtl" style={{width:'100%', height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column', fontFamily:'var(--font-ui)'}}>

      {/* TOP BAR */}
      <div className="topbar">
        <div style={{display:'flex', alignItems:'center', gap:24}}>
          <Crest subtitle="חמ״ל מרכזי" variant="brand"/>
          <nav>
            <a className="on">סקירה</a>
            <a>ארגונים</a>
            <a>נציגים</a>
            <a>דיווחים</a>
            <a>הגדרות</a>
          </nav>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <ModePill mode="emergency"/>
          <Clock/>
          <button className="btn btn--ghost btn--sm" style={{gap:6}}>
            <Icon name="refresh" size={13}/> רענון
          </button>
          <div style={{width:1, height:24, background:'var(--line-2)'}}/>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:28, height:28, borderRadius:4, background:'var(--ink)', color:'var(--paper)', display:'grid', placeItems:'center', font:'700 11px var(--font-mono)'}}>NS</div>
            <div style={{lineHeight:1.1}}>
              <div style={{font:'600 12.5px var(--font-ui)'}}>נ. שלו</div>
              <div style={{font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>HQ · MOD</div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{flex:'1 1 auto', overflow:'auto', padding:'24px 28px 32px'}}>

        {/* Page title */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, paddingBottom:14, borderBottom:'1px solid var(--ink)'}}>
          <div>
            <Tag color="var(--brand)">01 · DASHBOARD</Tag>
            <h1 style={{margin:'8px 0 4px', font:'700 30px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>סקירה ארצית</h1>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)'}}>
              עודכן לאחרונה <span className="mono" style={{color:'var(--ink-2)'}}>14:32:18</span> · רענון אוטומטי כל 30 שניות
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn--ghost btn--sm">
              <Icon name="filter" size={13}/> סינון
            </button>
            <button className="btn btn--sm">
              <Icon name="download" size={13}/> ייצוא אקסל
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24}}>
          {kpis.map((k, i) => (
            <div key={i} className={'kpi ' + (k.variant ? 'kpi--' + k.variant : '')}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div className="lbl">{k.label}</div>
                <span className="mono" style={{font:'600 9.5px var(--font-mono)', color:'var(--ink-4)', letterSpacing:'.12em'}}>{String(i+1).padStart(2,'0')}/04</span>
              </div>
              <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:6}}>
                <span className="val">{k.value}</span>
              </div>
              <div className="meta">{k.meta}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18, alignItems:'start'}}>

          {/* Monitor table */}
          <div className="card">
            <div className="panel-h">
              <div>
                <Tag>MONITOR · LIVE</Tag>
                <h3 style={{marginTop:4}}>סטטוס דיווח לפי ארגון</h3>
              </div>
              <div style={{display:'flex', gap:6}}>
                <button className="btn btn--ghost btn--sm">הכל</button>
                <button className="btn btn--ghost btn--sm" style={{background:'var(--paper-2)'}}>מתעכבים</button>
                <button className="btn btn--ghost btn--sm">קריטיים</button>
              </div>
            </div>

            <div style={{overflow:'hidden'}}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{width:60}}>ID</th>
                    <th>ארגון</th>
                    <th style={{width:90}}>קטגוריה</th>
                    <th style={{width:110}}>נציג</th>
                    <th style={{width:90}}>דיווח אחרון</th>
                    <th style={{width:90, textAlign:'left'}}>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {monitor.map((r) => (
                    <tr key={r.id}>
                      <td><span className="mono" style={{fontSize:11.5, color:'var(--ink-3)'}}>ORG-{r.id}</span></td>
                      <td style={{fontWeight:500}}>{r.org}</td>
                      <td><span className="chip">{r.cat}</span></td>
                      <td style={{font:'500 12.5px var(--font-ui)', color:'var(--ink-2)'}}>{r.user}</td>
                      <td><span className="mono" style={{fontSize:12, color:'var(--ink-2)'}}>{r.t}<span style={{color:'var(--ink-4)', marginInlineStart:6, fontSize:11}}>· {r.delta}</span></span></td>
                      <td style={{textAlign:'left'}}>
                        {r.status === 'ok' && <span className="chip chip--ok"><span className="dot"/>בזמן</span>}
                        {r.status === 'warn' && <span className="chip chip--warn"><span className="dot"/>איחור</span>}
                        {r.status === 'bad' && <span className="chip chip--bad"><span className="dot"/>חסר</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{padding:'10px 18px', borderTop:'1px solid var(--hairline)', display:'flex', justifyContent:'space-between', alignItems:'center', font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>
              <span>SHOWING 6 OF 142</span>
              <a href="#" style={{color:'var(--brand)', textDecoration:'none'}}>VIEW ALL →</a>
            </div>
          </div>

          {/* Right column */}
          <div style={{display:'flex', flexDirection:'column', gap:18}}>

            {/* Category breakdown */}
            <div className="card">
              <div className="panel-h">
                <div>
                  <Tag>BY MINISTRY</Tag>
                  <h3 style={{marginTop:4}}>לפי קטגוריה</h3>
                </div>
                <span className="mono" style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.08em'}}>04</span>
              </div>
              <div style={{padding:'8px 18px 16px', display:'flex', flexDirection:'column', gap:14}}>
                {[
                  ['כלכלה — מזון', 48, 52, 92, 'ok'],
                  ['אנרגיה — דלקים', 32, 36, 89, 'ok'],
                  ['חקלאות — גרעינים', 24, 28, 86, 'warn'],
                  ['בריאות — ציוד', 28, 40, 70, 'bad'],
                ].map(([name, done, total, pct, tone]) => (
                  <div key={name}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
                      <div style={{font:'600 13px var(--font-ui)'}}>{name}</div>
                      <div style={{font:'600 11.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em'}}>
                        <span style={{color:'var(--ink)'}}>{done}</span>/{total} · {pct}%
                      </div>
                    </div>
                    <div style={{height:6, background:'var(--paper-2)', borderRadius:1, overflow:'hidden', position:'relative'}}>
                      <div style={{
                        height:'100%',
                        width: pct + '%',
                        background: tone === 'bad' ? 'var(--bad)' : tone === 'warn' ? 'var(--warn)' : 'var(--brand)',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* National status */}
            <div className="card" style={{borderColor: 'var(--bad-line)'}}>
              <div className="panel-h" style={{borderBottomColor:'var(--bad-line)'}}>
                <div>
                  <Tag color="var(--bad)">NATIONAL STATE</Tag>
                  <h3 style={{marginTop:4}}>מצב חירום פעיל</h3>
                </div>
                <Icon name="alert" size={16} style={{color:'var(--bad)'}}/>
              </div>
              <div style={{padding:'14px 18px 18px'}}>
                <div style={{font:'400 13px/1.5 var(--font-ui)', color:'var(--ink-2)', marginBottom:12}}>
                  כל הארגונים מחויבים בדיווח כל 4 שעות. תדירות זו תישמר עד להחלפת המצב.
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn--ghost btn--sm" style={{flex:1}}>החזרה לשגרה</button>
                  <button className="btn btn--sm" style={{flex:1}}>
                    <Icon name="bell" size={12}/> התראה לכל הארגונים
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

window.ScreenHQDashboard = ScreenHQDashboard;
