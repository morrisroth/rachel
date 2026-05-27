// HQ Export Modal — centered modal popup for Excel export
// Shown over HQ dashboard. Same theme vocabulary.

function ScreenHQExport() {
  return (
    <div dir="rtl" style={{width:'100%', height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column', fontFamily:'var(--font-ui)', position:'relative', overflow:'hidden'}}>

      {/* Faded backdrop topbar */}
      <div className="topbar" style={{opacity:.55}}>
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
        <ModePill mode="emergency"/>
      </div>

      <div style={{flex:1, padding:'24px 28px', opacity:.35}}>
        <div style={{height:30, width:280, background:'var(--paper-2)', borderRadius:4, marginBottom:24}}/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:22}}>
          {[1,2,3,4].map(i => <div key={i} style={{height:96, background:'var(--paper-2)', borderRadius:8}}/>)}
        </div>
        <div style={{height:300, background:'var(--paper-2)', borderRadius:8}}/>
      </div>

      {/* MODAL */}
      <div style={{position:'absolute', inset:0, background:'oklch(20% 0.012 80 / .4)', display:'grid', placeItems:'center', zIndex:50}}>

        <div style={{width:560, background:'var(--paper)', border:'1px solid var(--ink)', borderRadius:'var(--r-3)', boxShadow:'var(--shadow-modal)', overflow:'hidden'}}>

          {/* Modal header */}
          <div style={{padding:'18px 22px 16px', borderBottom:'1px solid var(--ink)', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
            <div>
              <Tag color="var(--brand)">EXPORT · XLSX</Tag>
              <h2 style={{margin:'8px 0 2px', font:'700 22px var(--font-ui)', letterSpacing:'-.015em'}}>ייצוא אקסל לארגונים</h2>
              <div style={{font:'400 12.5px var(--font-ui)', color:'var(--ink-3)'}}>ייצוא דיווחי מלאי לשליחה לארבעת המשרדים</div>
            </div>
            <button className="btn btn--ghost btn--sm" style={{padding:'6px'}}>
              <Icon name="x" size={14}/>
            </button>
          </div>

          {/* Modal body */}
          <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:18}}>

            {/* Range picker */}
            <div>
              <label className="label">טווח תאריכים</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4}}>
                <div>
                  <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', marginBottom:4}}>FROM</div>
                  <div className="input num-input" style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14}}>
                    <span>20.05.2026</span>
                    <Icon name="chevronDown" size={13} style={{color:'var(--ink-3)'}}/>
                  </div>
                </div>
                <div>
                  <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', marginBottom:4}}>TO</div>
                  <div className="input num-input" style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14}}>
                    <span>27.05.2026</span>
                    <Icon name="chevronDown" size={13} style={{color:'var(--ink-3)'}}/>
                  </div>
                </div>
              </div>
              <div style={{display:'flex', gap:6, marginTop:8}}>
                <button className="chip" style={{cursor:'pointer'}}>היום</button>
                <button className="chip" style={{cursor:'pointer'}}>שבוע</button>
                <button className="chip chip--solid-brand" style={{cursor:'pointer'}}>7 ימים</button>
                <button className="chip" style={{cursor:'pointer'}}>30 ימים</button>
                <button className="chip" style={{cursor:'pointer'}}>טווח מותאם</button>
              </div>
            </div>

            <hr className="hr"/>

            {/* Ministry selection */}
            <div>
              <label className="label">משרדים לייצוא</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6}}>
                {[
                  ['משרד הכלכלה',    'מזון',     'food@economy.gov.il',  48, true],
                  ['משרד האנרגיה',  'דלקים',    'fuel@energy.gov.il',   36, true],
                  ['משרד החקלאות',   'גרעינים',  'grain@agri.gov.il',    28, true],
                  ['משרד הבריאות',   'ציוד',      'health@moh.gov.il',    30, false],
                ].map(([name, kind, email, n, on]) => (
                  <label key={name} style={{
                    padding:'12px 12px',
                    border:'1px solid ' + (on ? 'var(--brand)' : 'var(--line)'),
                    background: on ? 'var(--brand-bg)' : 'var(--surface)',
                    borderRadius:'var(--r-2)',
                    cursor:'pointer',
                    display:'flex', flexDirection:'column', gap:4,
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{
                        width:14, height:14,
                        border:'1.5px solid ' + (on ? 'var(--brand)' : 'var(--line-2)'),
                        background: on ? 'var(--brand)' : 'var(--surface)',
                        color:'white',
                        borderRadius:2,
                        display:'grid', placeItems:'center',
                      }}>{on && <Icon name="check" size={10} stroke={2.6}/>}</span>
                      <span style={{font:'600 13px var(--font-ui)'}}>{name}</span>
                      <span style={{marginInlineStart:'auto', font:'600 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em'}}>{n} ארגונים</span>
                    </div>
                    <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', paddingInlineStart:22}}>
                      {kind} · {email}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="label">אפשרויות</label>
              <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:6}}>
                {[
                  ['כלול דיווחים חופשיים', true],
                  ['פצל לפי משרד (4 גיליונות)', true],
                  ['שלח אוטומטית לכתובות במייל', false],
                ].map(([label, on]) => (
                  <label key={label} style={{display:'flex', alignItems:'center', gap:9, cursor:'pointer'}}>
                    <span style={{
                      width:14, height:14,
                      border:'1.5px solid ' + (on ? 'var(--brand)' : 'var(--line-2)'),
                      background: on ? 'var(--brand)' : 'var(--surface)',
                      color:'white',
                      borderRadius:2,
                      display:'grid', placeItems:'center',
                    }}>{on && <Icon name="check" size={10} stroke={2.6}/>}</span>
                    <span style={{font:'500 13.5px var(--font-ui)', color:'var(--ink-2)'}}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{padding:'12px 14px', background:'var(--surface-2)', border:'1px solid var(--line)', borderRadius:'var(--r-2)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <Tag>PREVIEW</Tag>
                <div style={{font:'600 13.5px var(--font-ui)', marginTop:3}}>
                  3 משרדים · 112 ארגונים · ~840 שורות
                </div>
              </div>
              <span className="num" style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em'}}>~ 280 KB</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{padding:'14px 22px', borderTop:'1px solid var(--ink)', background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{font:'500 11.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>XLSX · UTF-8 · RTL</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn btn--ghost btn--sm">ביטול</button>
              <button className="btn btn--brand btn--sm" style={{gap:8}}>
                <Icon name="download" size={13}/> ייצוא והורדה
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ScreenHQExport = ScreenHQExport;
