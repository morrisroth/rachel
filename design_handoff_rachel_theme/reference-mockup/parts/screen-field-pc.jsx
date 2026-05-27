// Field PC — desktop / fullscreen variant
// Same data and workflow as the mobile, just laid out for desktop.

function ScreenFieldPC() {
  const items = [
    { code:'101', name:'קמח חיטה',          cat:'כלכלה', unit:'טון',     stock:42, incoming:18, status:'incoming-ok', q:'תקין', d:'29.05' },
    { code:'102', name:'אורז לבן',          cat:'כלכלה', unit:'טון',     stock:28, incoming:0,  status:'none',        q:'תקין', d:'—'    },
    { code:'103', name:'שמן חמניות',        cat:'כלכלה', unit:'ק״ל',    stock:14, incoming:8,  status:'incoming-ok', q:'תקין', d:'30.05' },
    { code:'104', name:'סוכר לבן',          cat:'כלכלה', unit:'טון',     stock:9,  incoming:12, status:'delayed',     q:'תקין', d:'31.05' },
    { code:'105', name:'מים מינרליים 1.5L', cat:'כלכלה', unit:'יחידות', stock:8400, incoming:0, status:'none',       q:'בלאי', d:'—'    },
  ];

  return (
    <div dir="rtl" style={{width:'100%', height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column', fontFamily:'var(--font-ui)'}}>

      {/* TOP BAR — field variant (ink crest, not brand) */}
      <div className="topbar">
        <div style={{display:'flex', alignItems:'center', gap:24}}>
          <Crest subtitle="נציג שטח · שופרסל חיפה צפון"/>
          <nav>
            <a className="on">דיווח</a>
            <a>היסטוריה</a>
            <a>פרופיל</a>
          </nav>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <ModePill mode="emergency"/>
          <Clock/>
          <div style={{width:1, height:24, background:'var(--line-2)'}}/>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:28, height:28, borderRadius:3, background:'var(--ink)', color:'var(--paper)', display:'grid', placeItems:'center', font:'700 11px var(--font-mono)'}}>דכ</div>
            <div style={{lineHeight:1.1}}>
              <div style={{font:'600 12.5px var(--font-ui)'}}>דוד כהן</div>
              <div style={{font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>ORG-0142</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{flex:'1 1 auto', overflow:'auto', padding:'24px 28px 32px'}}>

        {/* Page title */}
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, paddingBottom:14, borderBottom:'1px solid var(--ink)'}}>
          <div>
            <Tag color="var(--brand)">DAILY · 01</Tag>
            <h1 style={{margin:'8px 0 4px', font:'700 30px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>דיווח מלאי יומי</h1>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)'}}>
              <span className="num" style={{color:'var(--ink-2)'}}>5</span> פריטים בקטלוג ·
              דדליין הבא: <span className="mono" style={{color:'var(--bad)'}}>18:00</span> · עוד <span className="mono">3h 28m</span>
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn--ghost btn--sm"><Icon name="file" size={13}/> טען נתוני אמש</button>
            <button className="btn btn--ghost btn--sm"><Icon name="download" size={13}/> ייבוא מאקסל</button>
            <button className="btn btn--ghost btn--sm"><Icon name="plus" size={13}/> מוצר חופשי</button>
          </div>
        </div>

        {/* Banner */}
        <div style={{padding:'12px 16px', background:'var(--bad-bg)', border:'1px solid var(--bad-line)', borderRadius:'var(--r-2)', display:'flex', alignItems:'center', gap:12, marginBottom:18}}>
          <Icon name="alert" size={16} style={{color:'var(--bad)'}}/>
          <div style={{flex:1}}>
            <div style={{font:'600 13px var(--font-ui)', color:'var(--bad)'}}>מצב חירום פעיל · דיווח חובה כל 4 שעות</div>
            <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:2}}>הדיווח הבא יחל ב-18:00. תזכורת אוטומטית תישלח לטלפון ולמייל.</div>
          </div>
        </div>

        {/* Progress strip */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:14}}>
          <Tag>השלמת דיווח</Tag>
          <div style={{flex:1, display:'flex', gap:4, height:6}}>
            {[1,1,1,0,0].map((on, i) => (
              <div key={i} style={{flex:1, background: on ? 'var(--brand)' : 'var(--paper-2)', border: on ? 'none' : '1px solid var(--line)'}}/>
            ))}
          </div>
          <span style={{font:'600 12px var(--font-mono)', color:'var(--brand)', letterSpacing:'.08em'}}>3 / 5 · 60%</span>
        </div>

        {/* Items grid */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12, marginBottom:18}}>
          {items.map((it, i) => {
            const isActive = i === 3;
            return (
              <div key={it.code} style={{
                border:'1px solid ' + (isActive ? 'var(--brand)' : 'var(--line)'),
                borderRadius:'var(--r-2)',
                background:'var(--surface)',
                padding:'14px 16px',
                boxShadow: isActive ? '0 0 0 3px oklch(38% 0.08 165 / .12)' : 'none',
              }}>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:10}}>
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                      <span className="mono" style={{fontSize:10.5, color:'var(--ink-4)', letterSpacing:'.08em'}}>SKU-{it.code}</span>
                      <span className="chip" style={{padding:'1px 6px', fontSize:9.5}}>{it.cat}</span>
                    </div>
                    <div style={{font:'700 15.5px var(--font-ui)'}}>{it.name}</div>
                  </div>
                  {it.status === 'delayed' ? <span className="chip chip--warn">איחור</span>
                    : it.status === 'incoming-ok' ? <span className="chip chip--ok">בדרך</span>
                    : null}
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10}}>
                  <div>
                    <div className="label">נוכחי</div>
                    <div style={{padding:'8px 10px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:'var(--r-1)', display:'flex', alignItems:'baseline', gap:4}}>
                      <span style={{font:'700 16px var(--font-mono)', fontVariantNumeric:'tabular-nums'}}>{it.stock.toLocaleString('he-IL')}</span>
                      <span style={{font:'500 10.5px var(--font-mono)', color:'var(--ink-3)'}}>{it.unit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="label">בדרך</div>
                    <div style={{padding:'8px 10px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:'var(--r-1)', display:'flex', alignItems:'baseline', gap:4}}>
                      <span style={{font:'700 16px var(--font-mono)', fontVariantNumeric:'tabular-nums', color: it.incoming ? 'var(--ink)' : 'var(--ink-4)'}}>{it.incoming.toLocaleString('he-IL')}</span>
                      <span style={{font:'500 10.5px var(--font-mono)', color:'var(--ink-3)'}}>{it.unit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="label">איכות</div>
                    <div style={{padding:'8px 10px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:'var(--r-1)', font:'600 13px var(--font-ui)', color: it.q === 'תקין' ? 'var(--ok)' : 'var(--warn)'}}>{it.q}</div>
                  </div>
                  <div>
                    <div className="label">ETA</div>
                    <div style={{padding:'8px 10px', background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:'var(--r-1)', font:'600 13px var(--font-mono)', letterSpacing:'.04em'}}>{it.d}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky submit row */}
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--surface)', border:'1px solid var(--ink)', borderRadius:'var(--r-2)'}}>
          <div style={{flex:1}}>
            <Tag>READY TO SUBMIT</Tag>
            <div style={{font:'600 14px var(--font-ui)', marginTop:3}}>5 פריטים · 2 דורשים תשומת לב</div>
          </div>
          <button className="btn btn--ghost btn--sm"><Icon name="camera" size={13}/> צירוף תמונה</button>
          <button className="btn btn--brand btn--lg" style={{gap:10}}>
            <span>שליחת דיווח</span>
            <Icon name="arrow" size={15} style={{transform:'scaleX(-1)'}}/>
          </button>
        </div>

      </div>
    </div>
  );
}

window.ScreenFieldPC = ScreenFieldPC;
