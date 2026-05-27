// Field Mobile — Profile tab
// User info + organization details + linked products

function ScreenFieldProfile() {
  const linkedProducts = [
    { code:'101', name:'קמח חיטה',          unit:'טון',     cat:'כלכלה' },
    { code:'102', name:'אורז לבן',          unit:'טון',     cat:'כלכלה' },
    { code:'103', name:'שמן חמניות',        unit:'ק״ל',    cat:'כלכלה' },
    { code:'104', name:'סוכר לבן',          unit:'טון',     cat:'כלכלה' },
    { code:'105', name:'מים מינרליים 1.5L', unit:'יחידות', cat:'כלכלה' },
  ];

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
          <span>14:32</span>
          <span className="mono" style={{fontSize:11}}>LTE</span>
        </div>

        <div style={{padding:'10px 18px 12px', borderBottom:'1px solid var(--ink)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <Crest subtitle="פרופיל ונציג"/>
            <ModePill mode="emergency"/>
          </div>
        </div>

        <div className="phone-body" style={{overflow:'auto'}}>
          <div style={{padding:'16px 18px 12px', borderBottom:'1px solid var(--line)'}}>
            <Tag color="var(--brand)">PROFILE · 03</Tag>
            <div style={{font:'700 22px/1.1 var(--font-ui)', letterSpacing:'-.01em', marginTop:6}}>פרופיל נציג</div>
          </div>

          <div style={{padding:'14px 14px', display:'flex', flexDirection:'column', gap:12}}>

            {/* Profile card */}
            <div style={{padding:'14px 14px', border:'1px solid var(--line)', borderRadius:'var(--r-2)', background:'var(--surface)'}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:44, height:44, background:'var(--ink)', color:'var(--paper)', display:'grid', placeItems:'center', borderRadius:3, font:'800 14px var(--font-mono)'}}>דכ</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{font:'700 15px var(--font-ui)'}}>דוד כהן</div>
                  <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', marginTop:2}}>FIELD · אחראי מלאי</div>
                </div>
                <Stamp>פעיל</Stamp>
              </div>

              <hr className="hr" style={{margin:'14px 0'}}/>

              {[
                ['ארגון',     'שופרסל מרכזים — חיפה צפון'],
                ['תעודת זהות', '032 481 559', true],
                ['טלפון',      '054 218 9047', true],
                ['אימייל',     'd.cohen@shufersal.co.il', true],
              ].map(([k, v, mono]) => (
                <div key={k} style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'5px 0'}}>
                  <span className="tag">{k}</span>
                  <span style={mono ? {font:'600 12.5px var(--font-mono)', letterSpacing:'.04em', color:'var(--ink-2)'} : {font:'600 13px var(--font-ui)', color:'var(--ink)'}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Linked products */}
            <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-2)', background:'var(--surface)', overflow:'hidden'}}>
              <div style={{padding:'10px 13px', borderBottom:'1px solid var(--hairline)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface-2)'}}>
                <div>
                  <Tag>CATALOG · LINKED</Tag>
                  <div style={{font:'600 13px var(--font-ui)', marginTop:3}}>מוצרי הארגון</div>
                </div>
                <span className="chip chip--brand">{linkedProducts.length}</span>
              </div>
              {linkedProducts.map((p, i, arr) => (
                <div key={p.code} style={{padding:'10px 13px', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div>
                    <div style={{font:'600 13.5px var(--font-ui)'}}>{p.name}</div>
                    <div style={{font:'500 10.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', marginTop:1}}>SKU-{p.code} · {p.cat}</div>
                  </div>
                  <span className="chip">{p.unit}</span>
                </div>
              ))}
            </div>

            {/* Settings shortcuts */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              <button className="btn btn--ghost btn--sm" style={{justifyContent:'flex-start'}}>
                <Icon name="bell" size={13}/> התראות
              </button>
              <button className="btn btn--ghost btn--sm" style={{justifyContent:'flex-start'}}>
                <Icon name="settings" size={13}/> הגדרות
              </button>
            </div>

            <button className="btn btn--ghost" style={{justifyContent:'flex-start', color:'var(--bad)', borderColor:'var(--bad-line)'}}>
              <Icon name="arrow" size={14}/> יציאה מהמערכת
            </button>
          </div>
        </div>

        <BottomNav active="profile"/>
        <div style={{display:'flex', justifyContent:'center', padding:'4px 0 8px', flex:'0 0 auto'}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

window.ScreenFieldProfile = ScreenFieldProfile;
