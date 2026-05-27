// HQ Add Organization Drawer — overlay over the orgs page
// Shows the drawer interaction; uses the same vocabulary.

function ScreenHQDrawer() {
  return (
    <div dir="rtl" style={{width:'100%', height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column', fontFamily:'var(--font-ui)', position:'relative', overflow:'hidden'}}>

      {/* Faded topbar in background */}
      <div className="topbar" style={{filter:'blur(0.5px) opacity(.6)'}}>
        <div style={{display:'flex', alignItems:'center', gap:24}}>
          <Crest subtitle="חמ״ל מרכזי" variant="brand"/>
          <nav>
            <a>סקירה</a>
            <a className="on">ארגונים</a>
            <a>נציגים</a>
            <a>דיווחים</a>
            <a>הגדרות</a>
          </nav>
        </div>
        <ModePill mode="emergency"/>
      </div>

      <div style={{flex:1, padding:'24px 28px', opacity:.4}}>
        <div style={{height:30, width:280, background:'var(--paper-2)', borderRadius:4, marginBottom:24}}/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:22}}>
          {[1,2,3,4].map(i =><div key={i} style={{height:96, background:'var(--paper-2)', borderRadius:8}}/>)}
        </div>
        <div style={{height:300, background:'var(--paper-2)', borderRadius:8}}/>
      </div>

      {/* SCRIM */}
      <div className="drawer-scrim">

        {/* DRAWER */}
        <div className="drawer">

          {/* Drawer header */}
          <div style={{padding:'18px 24px 16px', borderBottom:'1px solid var(--ink)', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
            <div>
              <Tag color="var(--brand)">NEW · ORG</Tag>
              <h2 style={{margin:'8px 0 2px', font:'700 22px var(--font-ui)', letterSpacing:'-.015em'}}>הוספת ארגון חדש</h2>
              <div style={{font:'400 12.5px var(--font-ui)', color:'var(--ink-3)'}}>שיוך אוטומטי של נציג שטח ומוצרי מלאי</div>
            </div>
            <button className="btn btn--ghost btn--sm" style={{padding:'6px'}}>
              <Icon name="x" size={14}/>
            </button>
          </div>

          {/* Stepper */}
          <div style={{padding:'12px 24px', borderBottom:'1px solid var(--hairline)', display:'flex', alignItems:'center', gap:14}}>
            {[
              {n:'01', label:'פרטי הארגון', state:'done'},
              {n:'02', label:'מוצרי מלאי',  state:'current'},
              {n:'03', label:'נציג שטח',    state:'pending'},
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{
                    width:22, height:22,
                    border:'1px solid ' + (s.state==='pending' ? 'var(--line-2)' : 'var(--ink)'),
                    background: s.state==='current' ? 'var(--brand)' : s.state==='done' ? 'var(--ink)' : 'transparent',
                    color: s.state==='pending' ? 'var(--ink-3)' : 'var(--paper)',
                    borderColor: s.state==='current' ? 'var(--brand)' : s.state==='pending' ? 'var(--line-2)' : 'var(--ink)',
                    display:'grid', placeItems:'center',
                    font:'700 9.5px var(--font-mono)', letterSpacing:'.08em',
                    borderRadius:3,
                  }}>{s.state==='done' ? <Icon name="check" size={10}/> : s.n}</span>
                  <span style={{font:'600 12.5px var(--font-ui)', color: s.state==='pending' ? 'var(--ink-3)' : 'var(--ink)'}}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div style={{flex:1, height:1, background:'var(--line-2)'}}/>}
              </React.Fragment>
            ))}
          </div>

          {/* Drawer body */}
          <div style={{flex:'1 1 auto', overflow:'auto', padding:'18px 24px'}}>

            {/* Filled previous step summary */}
            <div style={{
              padding:'12px 14px',
              background:'var(--surface-2)',
              border:'1px solid var(--line)',
              borderRadius:'var(--r-2)',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              marginBottom:24,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:30, height:30, background:'var(--ink)', color:'var(--paper)', display:'grid', placeItems:'center', borderRadius:3}}>
                  <Icon name="check" size={14}/>
                </div>
                <div>
                  <div style={{font:'600 13px var(--font-ui)'}}>קופיקס דרום — ערד</div>
                  <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', marginTop:2}}>
                    רשת שיווק · משרד הכלכלה
                  </div>
                </div>
              </div>
              <button className="btn btn--ghost btn--sm">עריכה</button>
            </div>

            {/* Step 2 form */}
            <Tag>STEP · 02</Tag>
            <h3 style={{margin:'6px 0 4px', font:'700 18px var(--font-ui)'}}>בחירת מוצרי מלאי</h3>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)', marginBottom:18}}>
              סמן את כל המוצרים שהארגון מחזיק. ניתן להוסיף מוצרים חופשיים בדיווח עצמו.
            </div>

            {/* Category header */}
            <div style={{padding:'10px 12px', background:'var(--paper-2)', border:'1px solid var(--line)', borderTopLeftRadius:'var(--r-2)', borderTopRightRadius:'var(--r-2)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="tag tag--brand">01</span>
                <span style={{font:'600 13.5px var(--font-ui)'}}>משרד הכלכלה — מזון</span>
              </div>
              <span className="chip chip--brand">3 נבחרו · 5</span>
            </div>

            <div style={{border:'1px solid var(--line)', borderTop:'none', borderBottomLeftRadius:'var(--r-2)', borderBottomRightRadius:'var(--r-2)', background:'var(--surface)'}}>
              {[
                {code:'101', name:'קמח חיטה', unit:'טון', checked:true},
                {code:'102', name:'אורז לבן', unit:'טון', checked:true},
                {code:'103', name:'שמן חמניות', unit:'ק״ל', checked:true},
                {code:'104', name:'סוכר לבן', unit:'טון', checked:false},
                {code:'105', name:'מים מינרליים 1.5L', unit:'יחידות', checked:false},
              ].map((p, i, arr) => (
                <label key={p.code} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                  padding:'12px 14px',
                  borderBottom: i < arr.length-1 ? '1px solid var(--hairline)' : 'none',
                  cursor:'pointer',
                  background: p.checked ? 'var(--brand-bg)' : 'transparent',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:11}}>
                    <span style={{
                      width:16, height:16,
                      border:'1.5px solid ' + (p.checked ? 'var(--brand)' : 'var(--line-2)'),
                      background: p.checked ? 'var(--brand)' : 'var(--surface)',
                      color:'white',
                      borderRadius:2,
                      display:'grid', placeItems:'center',
                    }}>{p.checked && <Icon name="check" size={11} stroke={2.4}/>}</span>
                    <div>
                      <div style={{font:'600 13.5px var(--font-ui)'}}>{p.name}</div>
                      <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', marginTop:1}}>
                        SKU-{p.code} · יחידת מידה ברירת מחדל: {p.unit}
                      </div>
                    </div>
                  </div>
                  <Icon name="chevron" size={13} style={{color:'var(--ink-4)', transform:'scaleX(-1)'}}/>
                </label>
              ))}
            </div>

            {/* Collapsed others */}
            <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:8}}>
              {[
                ['02', 'משרד האנרגיה — דלקים', '0 נבחרו · 3'],
                ['03', 'משרד החקלאות — גרעינים ומספוא', '0 נבחרו · 2'],
                ['04', 'משרד הבריאות — ציוד רפואי', '0 נבחרו · 3'],
              ].map(([n, name, status]) => (
                <div key={n} style={{
                  padding:'12px 14px',
                  border:'1px solid var(--line)',
                  borderRadius:'var(--r-2)',
                  background:'var(--surface)',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  cursor:'pointer',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span className="tag">{n}</span>
                    <span style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)'}}>{name}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em'}}>{status}</span>
                    <Icon name="chevronDown" size={14} style={{color:'var(--ink-3)'}}/>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Drawer footer */}
          <div style={{padding:'14px 24px', borderTop:'1px solid var(--ink)', background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{font:'500 11.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>
              STEP 02/03 · 3 מוצרים סומנו
            </div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn btn--ghost btn--sm">חזרה</button>
              <button className="btn btn--brand btn--sm" style={{gap:8}}>
                המשך לנציג שטח
                <Icon name="arrow" size={13} style={{transform:'scaleX(-1)'}}/>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

window.ScreenHQDrawer = ScreenHQDrawer;
