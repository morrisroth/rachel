// Field Mobile — Submit Success State
// After report submitted: confirmation screen with summary

function ScreenFieldSuccess() {
  return (
    <div dir="rtl" style={{
      width:'100%', height:'100%',
      background:'var(--paper-2)',
      display:'grid', placeItems:'center',
      padding:'24px',
      backgroundImage: `repeating-linear-gradient(45deg, transparent 0 28px, oklch(0% 0 0 / .015) 28px 29px)`,
    }}>
      <div className="phone">
        <div className="phone-status">
          <span>14:34</span>
          <span className="mono" style={{fontSize:11}}>LTE</span>
        </div>

        <div style={{padding:'10px 18px 12px', borderBottom:'1px solid var(--ink)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <Crest subtitle="דיווח נקלט"/>
            <ModePill mode="emergency"/>
          </div>
        </div>

        <div className="phone-body" style={{overflow:'auto', display:'flex', flexDirection:'column'}}>

          {/* Success hero */}
          <div style={{padding:'32px 22px 22px', textAlign:'right', borderBottom:'1px solid var(--line)'}}>
            <div style={{width:56, height:56, background:'var(--brand)', color:'white', display:'grid', placeItems:'center', borderRadius:'var(--r-2)', marginBottom:18}}>
              <Icon name="check" size={26} stroke={2.4}/>
            </div>
            <Tag color="var(--brand)">REPORT · SUBMITTED</Tag>
            <h1 style={{margin:'8px 0 4px', font:'800 28px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>
              הדיווח נקלט
            </h1>
            <p style={{margin:'0 0 16px', font:'400 14px/1.45 var(--font-ui)', color:'var(--ink-3)'}}>
              הנתונים נכנסו לתמונת המצב הלאומית. מייל אישור נשלח לחשבון.
            </p>

            {/* Confirmation ID block */}
            <div style={{padding:'12px 14px', background:'var(--surface-2)', border:'1px solid var(--line)', borderRadius:'var(--r-2)', display:'grid', gridTemplateColumns:'auto 1fr', gap:'6px 16px'}}>
              <span className="tag">REF</span>
              <span className="mono" style={{fontSize:13, fontWeight:600, letterSpacing:'.06em', textAlign:'left'}}>RPT-2026-05-27-1432-0142</span>
              <span className="tag">TIME</span>
              <span className="mono" style={{fontSize:13, fontWeight:600, letterSpacing:'.04em', color:'var(--ink-2)', textAlign:'left'}}>27.05.2026 · 14:32:18</span>
              <span className="tag">ITEMS</span>
              <span style={{font:'600 13px var(--font-ui)', textAlign:'left'}}>5 פריטים</span>
            </div>
          </div>

          {/* Summary lines */}
          <div style={{padding:'14px 14px', display:'flex', flexDirection:'column', gap:8}}>
            <Tag>SUBMITTED LINES</Tag>
            {[
              {name:'קמח חיטה',   v:'42 → 60 טון',     d:'+18 בדרך'},
              {name:'אורז לבן',   v:'28 טון',          d:'ללא שינוי'},
              {name:'שמן חמניות', v:'14 → 22 ק״ל',    d:'+8 בדרך'},
              {name:'סוכר לבן',   v:'9 → 21 טון',      d:'+12 איחור'},
              {name:'מים 1.5L',    v:'8,400 יחידות',   d:'בלאי · דווח'},
            ].map((l, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--hairline)', borderRadius:'var(--r-1)'}}>
                <div>
                  <div style={{font:'600 13.5px var(--font-ui)'}}>{l.name}</div>
                  <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:2}}>{l.d}</div>
                </div>
                <div className="num" style={{fontSize:12.5, color:'var(--ink)', letterSpacing:'.02em'}}>{l.v}</div>
              </div>
            ))}
          </div>

          {/* Next due block */}
          <div style={{padding:'0 14px 14px'}}>
            <div style={{padding:'12px 14px', background:'var(--bad-bg)', border:'1px solid var(--bad-line)', borderRadius:'var(--r-2)', display:'flex', alignItems:'center', gap:10}}>
              <Icon name="bell" size={15} style={{color:'var(--bad)'}}/>
              <div style={{flex:1}}>
                <div style={{font:'600 12.5px var(--font-ui)', color:'var(--bad)'}}>הדיווח הבא ב-18:00</div>
                <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:2}}>NEXT DUE · in 3h 26m</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{padding:'12px 16px 16px', borderTop:'1px solid var(--ink)', background:'var(--surface)', flex:'0 0 auto', display:'flex', gap:8}}>
          <button className="btn btn--ghost" style={{flex:1, justifyContent:'center'}}>צפייה בהיסטוריה</button>
          <button className="btn" style={{flex:1, justifyContent:'center'}}>סיום</button>
        </div>

        <div style={{display:'flex', justifyContent:'center', padding:'4px 0 8px', flex:'0 0 auto'}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

window.ScreenFieldSuccess = ScreenFieldSuccess;
