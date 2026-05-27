// Field Mobile — inventory entry, phone frame
// Same crest + mode indicator + tag pattern

function ScreenFieldMobile() {
  const items = [
    { code:'101', name:'קמח חיטה',          cat:'כלכלה', unit:'טון',     stock:42, incoming:18, status:'incoming-ok',  q:'תקין', d:'29.05' },
    { code:'102', name:'אורז לבן',          cat:'כלכלה', unit:'טון',     stock:28, incoming:0,  status:'none',         q:'תקין', d:'—' },
    { code:'103', name:'שמן חמניות',        cat:'כלכלה', unit:'ק״ל',    stock:14, incoming:8,  status:'incoming-ok',  q:'תקין', d:'30.05' },
    { code:'104', name:'סוכר לבן',          cat:'כלכלה', unit:'טון',     stock:9,  incoming:12, status:'delayed',      q:'תקין', d:'31.05' },
    { code:'105', name:'מים מינרליים 1.5L', cat:'כלכלה', unit:'יחידות', stock:8400, incoming:0, status:'none',        q:'בלאי', d:'—' },
  ];

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

        {/* App header */}
        <div style={{padding:'10px 18px 12px', borderBottom:'1px solid var(--ink)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <Crest subtitle="דיווח שטח"/>
            <ModePill mode="emergency"/>
          </div>
        </div>

        <div className="phone-body" style={{overflow:'auto'}}>

          {/* Page title + org */}
          <div style={{padding:'16px 18px 14px', borderBottom:'1px solid var(--line)'}}>
            <Tag color="var(--brand)">DAILY · 01</Tag>
            <div style={{font:'700 22px/1.1 var(--font-ui)', letterSpacing:'-.01em', marginTop:6}}>
              דיווח מלאי
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6, marginTop:5, font:'500 12px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em'}}>
              <span>ORG-0142</span><span style={{color:'var(--ink-4)'}}>·</span>
              <span style={{color:'var(--ink-2)'}}>שופרסל — חיפה צפון</span>
            </div>
          </div>

          {/* Progress / countdown banner */}
          <div style={{padding:'12px 18px', borderBottom:'1px solid var(--hairline)', background:'var(--bad-bg)', display:'flex', alignItems:'center', gap:10}}>
            <Icon name="alert" size={14} style={{color:'var(--bad)'}}/>
            <div style={{flex:1, lineHeight:1.3}}>
              <div style={{font:'600 12.5px var(--font-ui)', color:'var(--bad)'}}>חירום — דיווח חובה כל 4 שעות</div>
              <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:2}}>
                NEXT DUE · 18:00 · in 3h 28m
              </div>
            </div>
          </div>

          {/* Progress strip */}
          <div style={{padding:'14px 18px 0'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <Tag>השלמת דיווח</Tag>
              <span style={{font:'600 11px var(--font-mono)', color:'var(--brand)', letterSpacing:'.08em'}}>3 / 5 · 60%</span>
            </div>
            <div style={{display:'flex', gap:4, height:5}}>
              {[1,1,1,0,0].map((on, i) => (
                <div key={i} style={{flex:1, background: on ? 'var(--brand)' : 'var(--paper-2)', border: on ? 'none' : '1px solid var(--line)'}}/>
              ))}
            </div>
          </div>

          {/* Items list */}
          <div style={{padding:'14px 14px 0', display:'flex', flexDirection:'column', gap:8}}>
            {items.map((it, i) => {
              const isActive = i === 3;
              return (
                <div key={it.code} style={{
                  border:'1px solid ' + (isActive ? 'var(--brand)' : 'var(--line)'),
                  borderRadius:'var(--r-2)',
                  background:'var(--surface)',
                  padding:'12px 14px',
                  position:'relative',
                  boxShadow: isActive ? '0 0 0 3px oklch(38% 0.08 165 / .12)' : 'none',
                }}>
                  <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8}}>
                    <div style={{minWidth:0, flex:1}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                        <span className="mono" style={{fontSize:10.5, color:'var(--ink-4)', letterSpacing:'.08em'}}>SKU-{it.code}</span>
                        <span className="chip" style={{padding:'1px 6px', fontSize:9.5}}>{it.cat}</span>
                      </div>
                      <div style={{font:'600 14.5px var(--font-ui)'}}>{it.name}</div>
                    </div>
                    {it.stock === 0
                      ? <span className="chip chip--bad">חסר</span>
                      : it.status === 'delayed'
                      ? <span className="chip chip--warn">איחור</span>
                      : it.status === 'incoming-ok'
                      ? <span className="chip chip--ok">בדרך</span>
                      : null}
                  </div>

                  {/* Stock row */}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
                    <div>
                      <div className="label">מלאי נוכחי</div>
                      <div style={{
                        display:'flex', alignItems:'baseline', gap:5,
                        padding:'8px 10px',
                        background:'var(--paper-2)',
                        border:'1px solid var(--line)',
                        borderRadius:'var(--r-1)',
                      }}>
                        <span style={{font:'700 17px var(--font-mono)', fontVariantNumeric:'tabular-nums'}}>{it.stock.toLocaleString('he-IL')}</span>
                        <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)'}}>{it.unit}</span>
                      </div>
                    </div>
                    <div>
                      <div className="label">בדרך</div>
                      <div style={{
                        display:'flex', alignItems:'baseline', gap:5,
                        padding:'8px 10px',
                        background:'var(--paper-2)',
                        border:'1px solid var(--line)',
                        borderRadius:'var(--r-1)',
                      }}>
                        <span style={{font:'700 17px var(--font-mono)', fontVariantNumeric:'tabular-nums', color: it.incoming ? 'var(--ink)' : 'var(--ink-4)'}}>{it.incoming.toLocaleString('he-IL')}</span>
                        <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)'}}>{it.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quality row */}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:9, paddingTop:9, borderTop:'1px solid var(--hairline)', font:'500 11.5px var(--font-mono)', letterSpacing:'.04em', color:'var(--ink-3)'}}>
                    <span>QUALITY · <span style={{color: it.q === 'תקין' ? 'var(--ok)' : 'var(--warn)'}}>{it.q}</span></span>
                    <span>ETA · <span style={{color:'var(--ink-2)'}}>{it.d}</span></span>
                  </div>
                </div>
              );
            })}

            {/* Add row */}
            <button className="btn btn--ghost" style={{justifyContent:'flex-start', gap:8, marginBottom:14}}>
              <Icon name="plus" size={14}/> הוספת פריט מחוץ למלאי הקבוע
            </button>
          </div>

        </div>

        {/* Sticky CTA */}
        <div style={{padding:'12px 16px 16px', borderTop:'1px solid var(--ink)', background:'var(--surface)', flex:'0 0 auto', display:'flex', gap:8}}>
          <button className="btn btn--ghost" style={{flex:'0 0 auto'}}>
            <Icon name="camera" size={14}/>
          </button>
          <button className="btn btn--brand" style={{flex:1, justifyContent:'space-between'}}>
            <span>שליחת דיווח</span>
            <span style={{font:'600 11px var(--font-mono)', opacity:.75, letterSpacing:'.08em'}}>5 פריטים</span>
          </button>
        </div>

        {/* Bottom indicator */}
        <div style={{display:'flex', justifyContent:'center', padding:'4px 0 8px', flex:'0 0 auto'}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

window.ScreenFieldMobile = ScreenFieldMobile;
