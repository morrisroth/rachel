// HQ login — desktop layout, paired side-by-side with brand panel
// Same crest + mode pattern. No gradients.

function ScreenHQLogin() {
  return (
    <div dir="rtl" style={{
      width:'100%', height:'100%',
      background:'var(--paper)',
      display:'flex', alignItems:'stretch',
      fontFamily:'var(--font-ui)',
    }}>
      {/* RTL: visually-right brand panel comes first */}
      <div style={{flex:'1 1 0', padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between', borderInlineEnd:'1px solid var(--ink)', background:'var(--paper)', position:'relative'}}>

        {/* Subtle grid wash */}
        <div style={{position:'absolute', inset:0, pointerEvents:'none', opacity:.5, backgroundImage:`linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)`, backgroundSize:'48px 48px'}}/>

        <div style={{position:'relative'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <Crest subtitle="חמ״ל מטה — מרכז שליטה ארצי"/>
            <Stamp>אזור מאובטח</Stamp>
          </div>
        </div>

        <div style={{position:'relative'}}>
          <Tag color="var(--brand)">00 · CONTROL ROOM</Tag>
          <h1 style={{margin:'14px 0 14px', font:'800 64px/1 var(--font-ui)', letterSpacing:'-.035em'}}>
            תמונת מצב<br/>
            <span style={{color:'var(--brand)'}}>לאומית</span>, בזמן אמת.
          </h1>
          <p style={{margin:'0 0 28px', font:'400 16px/1.55 var(--font-ui)', color:'var(--ink-2)', maxWidth:480}}>
            ניטור רציף של 142 ארגונים, ארבעה משרדי ממשלה, ושרשרת אספקה לאומית. גישה לאנשי מטה מורשים.
          </p>

          <hr className="ruler" style={{maxWidth:480, marginBottom:24}}/>

          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 240px))', gap:'16px 28px', maxWidth:520}}>
            {[
              ['ניטור', 'תמונת מצב ארצית עם רענון אוטומטי'],
              ['ניהול', 'תדירות הדיווח ומצב לאומי'],
              ['ייצוא', 'אקסל ל־4 משרדי ממשלה'],
              ['ארגונים', 'ניהול 142 ארגונים ונציגי שטח'],
            ].map(([t,d]) => (
              <div key={t}>
                <div style={{font:'700 13px var(--font-ui)', color:'var(--ink)'}}>{t}</div>
                <div style={{font:'400 12.5px/1.4 var(--font-ui)', color:'var(--ink-3)', marginTop:2}}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{position:'relative', display:'flex', justifyContent:'space-between', alignItems:'baseline', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'.1em', color:'var(--ink-3)', textTransform:'uppercase'}}>
          <span>v 2.4.1 · MVP</span>
          <a href="#" style={{color:'var(--brand)', textDecoration:'none'}}>FIELD_USER → /field</a>
        </div>
      </div>

      {/* Login card column */}
      <div style={{flex:'0 0 460px', padding:'48px 44px', display:'flex', flexDirection:'column', justifyContent:'center', background:'var(--surface)'}}>
        <Tag color="var(--brand)">SIGN IN</Tag>
        <h2 style={{margin:'10px 0 28px', font:'700 30px var(--font-ui)', letterSpacing:'-.02em'}}>כניסה לחמ״ל</h2>

        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div>
            <label className="label">תעודת זהות</label>
            <div style={{position:'relative'}}>
              <Icon name="user" size={14} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
              <input className="input num-input" placeholder="9 ספרות" defaultValue="041 297 833" style={{paddingInlineStart:38, fontSize:15, padding:'13px 12px 13px 38px'}}/>
            </div>
          </div>

          <div>
            <label className="label">סיסמה</label>
            <div style={{position:'relative'}}>
              <Icon name="lock" size={14} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
              <input className="input" type="password" defaultValue="••••••••" style={{paddingInlineStart:38, fontSize:15, padding:'13px 12px 13px 38px'}}/>
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', font:'500 12.5px var(--font-ui)', color:'var(--ink-3)'}}>
            <label style={{display:'inline-flex', alignItems:'center', gap:7, cursor:'pointer'}}>
              <span style={{width:14, height:14, border:'1.5px solid var(--line-2)', borderRadius:3, display:'inline-block'}}/>
              זכור מכשיר זה
            </label>
            <a href="#" style={{color:'var(--brand)', textDecoration:'none', fontWeight:600}}>שכחת סיסמה?</a>
          </div>

          <button className="btn btn--brand btn--lg" style={{marginTop:8, width:'100%', justifyContent:'space-between'}}>
            <span>אימות והמשך</span>
            <Icon name="arrow" size={16} style={{transform:'scaleX(-1)'}}/>
          </button>
        </div>

        <hr className="hr" style={{margin:'28px 0 16px'}}/>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', font:'500 11.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>
          <span>SECURE · END-TO-END</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <Icon name="shield" size={12}/> מוצפן
          </span>
        </div>
      </div>
    </div>
  );
}

window.ScreenHQLogin = ScreenHQLogin;
