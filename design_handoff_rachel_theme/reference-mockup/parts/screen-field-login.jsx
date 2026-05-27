// Field login — mobile phone frame
// Themed: paper ground, ink crest, no gradients, green CTA

function ScreenFieldLogin() {
  return (
    <div dir="rtl" style={{
      width:'100%', height:'100%',
      background:'var(--paper-2)',
      display:'grid', placeItems:'center',
      padding:'24px',
      backgroundImage: `
        repeating-linear-gradient(45deg,
          transparent 0 28px,
          oklch(0% 0 0 / .015) 28px 29px)`,
    }}>
      <div className="phone">
        {/* Status bar */}
        <div className="phone-status">
          <span>14:32</span>
          <span style={{display:'flex', gap:6, alignItems:'center'}}>
            <span className="mono" style={{fontSize:11}}>LTE</span>
            <span style={{width:18, height:8, border:'1px solid currentColor', borderRadius:2, position:'relative', display:'inline-block'}}>
              <span style={{position:'absolute', inset:1, background:'currentColor', width:'70%', borderRadius:1}}/>
            </span>
          </span>
        </div>

        <div className="phone-body" style={{padding:'18px 22px 0', overflow:'auto'}}>

          {/* Header crest */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32}}>
            <Crest subtitle="דיווח שטח · MVP"/>
            <ModePill mode="emergency"/>
          </div>

          {/* Hero block */}
          <div style={{marginTop:8, marginBottom:28}}>
            <Tag color="var(--brand)">01 · כניסה</Tag>
            <h1 style={{margin:'10px 0 4px', font:'800 32px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>
              שלום, נציג השטח
            </h1>
            <p style={{margin:0, font:'400 14px/1.4 var(--font-ui)', color:'var(--ink-3)'}}>
              דווח את מלאי הארגון. הנתונים נכנסים מיידית לתמונת המצב הלאומית.
            </p>
          </div>

          {/* Form */}
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <label className="label">תעודת זהות</label>
              <div style={{position:'relative'}}>
                <Icon name="user" size={14} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
                <input className="input num-input" placeholder="9 ספרות" defaultValue="032 481 559"
                       style={{paddingInlineStart:38, fontSize:15}}/>
              </div>
            </div>
            <div>
              <label className="label">סיסמה</label>
              <div style={{position:'relative'}}>
                <Icon name="lock" size={14} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
                <input className="input" type="password" defaultValue="••••••"
                       style={{paddingInlineStart:38, fontSize:15}}/>
              </div>
            </div>

            <button className="btn btn--brand btn--lg" style={{marginTop:6, width:'100%', justifyContent:'space-between'}}>
              <span>כניסה לדיווח</span>
              <Icon name="arrow" size={16} style={{transform:'scaleX(-1)'}}/>
            </button>
          </div>

          {/* Quick org indicator card */}
          <div style={{marginTop:22, padding:'14px 16px', border:'1px solid var(--line)', borderRadius:'var(--r-2)', background:'var(--surface-2)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <Tag>הארגון שלך</Tag>
              <Status tone="ok">פעיל</Status>
            </div>
            <div style={{font:'700 15px var(--font-ui)', marginTop:8, color:'var(--ink)'}}>שופרסל מרכזים — חיפה צפון</div>
            <div style={{font:'500 11.5px var(--font-mono)', color:'var(--ink-3)', marginTop:4, letterSpacing:'.06em'}}>
              ORG-0142 · משרד הכלכלה
            </div>
          </div>

          <div style={{marginTop:20, paddingTop:14, borderTop:'1px solid var(--hairline)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{font:'500 12px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em'}}>HQ_USER?</span>
            <a href="#" style={{font:'600 12px var(--font-ui)', color:'var(--brand)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6}}>
              לחמ״ל המרכזי <Icon name="chevron" size={12} style={{transform:'scaleX(-1)'}}/>
            </a>
          </div>

        </div>

        {/* Bottom indicator */}
        <div style={{display:'flex', justifyContent:'center', padding:'8px 0 10px', flex:'0 0 auto'}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

window.ScreenFieldLogin = ScreenFieldLogin;
