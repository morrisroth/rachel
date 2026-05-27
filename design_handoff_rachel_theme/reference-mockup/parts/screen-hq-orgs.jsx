// HQ Organizations — list/management view
// Same topbar pattern, same section header pattern

function ScreenHQOrgs() {
  const orgs = [
    { id:'001', name:'שופרסל מרכזים — חיפה צפון',  type:'רשת שיווק', cat:'כלכלה', rep:'ד. אבני', n:7, last:'14:18', state:'active' },
    { id:'002', name:'רמי לוי — באר שבע',        type:'רשת שיווק', cat:'כלכלה', rep:'ע. כהן',   n:5, last:'13:55', state:'active' },
    { id:'003', name:'פז דרום — באר שבע',        type:'חברת אנרגיה', cat:'אנרגיה', rep:'נ. בכר',  n:8, last:'14:04', state:'active' },
    { id:'004', name:'דלק — אשדוד',               type:'חברת אנרגיה', cat:'אנרגיה', rep:'—',        n:6, last:'07:02', state:'active' },
    { id:'005', name:'אגן גרעינים — לוד',         type:'אחסון גרעינים', cat:'חקלאות', rep:'מ. צור',  n:4, last:'12:51', state:'active' },
    { id:'006', name:'איכילוב — תל אביב',         type:'מרכז רפואי', cat:'בריאות', rep:'ר. שגיא', n:11, last:'11:32', state:'active' },
    { id:'007', name:'תל השומר — רמת גן',         type:'מרכז רפואי', cat:'בריאות', rep:'ל. גרא',  n:9, last:'10:48', state:'paused' },
    { id:'008', name:'מחסן ערכי חירום — נצרים',   type:'מחסן ערכי חירום', cat:'בריאות', rep:'א. שריר', n:14, last:'09:22', state:'active' },
  ];

  return (
    <div dir="rtl" style={{width:'100%', height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column', fontFamily:'var(--font-ui)'}}>

      {/* TOP BAR — same as dashboard */}
      <div className="topbar">
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
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <ModePill mode="emergency"/>
          <Clock/>
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
            <Tag color="var(--brand)">02 · ORGANIZATIONS</Tag>
            <h1 style={{margin:'8px 0 4px', font:'700 30px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>ניהול ארגונים</h1>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)'}}>
              <span className="mono" style={{color:'var(--ink-2)'}}>142</span> פעילים · <span className="mono" style={{color:'var(--ink-2)'}}>14</span> מושהים · 4 משרדים
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <div style={{position:'relative'}}>
              <Icon name="search" size={13} style={{position:'absolute', insetInlineStart:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
              <input className="input" placeholder="חיפוש ארגון, נציג, מזהה…" style={{paddingInlineStart:34, width:280, fontSize:13, padding:'8px 12px 8px 34px'}}/>
            </div>
            <button className="btn btn--ghost btn--sm">
              <Icon name="filter" size={13}/> סינון
            </button>
            <button className="btn btn--brand btn--sm">
              <Icon name="plus" size={13}/> הוספת ארגון
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:22}}>
          {[
            ['כלכלה — מזון', 48, 4],
            ['אנרגיה — דלקים', 36, 3],
            ['חקלאות — גרעינים', 28, 2],
            ['בריאות — ציוד רפואי', 30, 5],
          ].map(([name, n, lat], i) => (
            <div key={i} style={{padding:'14px 16px', border:'1px solid var(--line)', background:'var(--surface)', borderRadius:'var(--r-2)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <span className="tag">{String(i+1).padStart(2,'0')}</span>
                <span className="chip">{lat} מתעכבים</span>
              </div>
              <div style={{font:'600 13px var(--font-ui)', color:'var(--ink-2)', marginTop:6}}>{name}</div>
              <div style={{display:'flex', alignItems:'baseline', gap:4, marginTop:4}}>
                <span style={{font:'800 28px/1 var(--font-ui)', fontVariantNumeric:'tabular-nums'}}>{n}</span>
                <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em'}}>ארגונים</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter chips row */}
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:14}}>
          <Tag>FILTER</Tag>
          <span className="chip chip--solid">הכל · 142</span>
          <span className="chip">כלכלה · 48</span>
          <span className="chip">אנרגיה · 36</span>
          <span className="chip">חקלאות · 28</span>
          <span className="chip">בריאות · 30</span>
          <div style={{flex:1}}/>
          <span style={{font:'500 11.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>SORT: עדכון אחרון ↓</span>
        </div>

        {/* Orgs table */}
        <div className="card" style={{overflow:'hidden'}}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:80}}>ID</th>
                <th>ארגון</th>
                <th style={{width:130}}>סוג</th>
                <th style={{width:90}}>קטגוריה</th>
                <th style={{width:130}}>נציג</th>
                <th style={{width:120}}>מוצרים</th>
                <th style={{width:110}}>דיווח אחרון</th>
                <th style={{width:100}}>סטטוס</th>
                <th style={{width:40}}></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(o => (
                <tr key={o.id}>
                  <td><span className="mono" style={{fontSize:11.5, color:'var(--ink-3)'}}>ORG-0{o.id}</span></td>
                  <td style={{fontWeight:500}}>{o.name}</td>
                  <td style={{color:'var(--ink-2)', fontSize:13}}>{o.type}</td>
                  <td><span className="chip">{o.cat}</span></td>
                  <td>
                    {o.rep === '—' ? <span style={{color:'var(--ink-4)'}}>לא משויך</span>
                      : <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                          <span style={{width:20, height:20, borderRadius:3, background:'var(--paper-2)', color:'var(--ink-2)', display:'grid', placeItems:'center', font:'700 9px var(--font-mono)'}}>{o.rep.split(' ')[0].slice(0,1)}{o.rep.split(' ')[1]?.slice(0,1) || ''}</span>
                          <span>{o.rep}</span>
                        </span>
                    }
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <span className="num" style={{fontSize:13, color:'var(--ink)'}}>{o.n}</span>
                      <span style={{display:'flex', gap:2, height:10}}>
                        {[...Array(Math.min(o.n, 8))].map((_,i)=>
                          <span key={i} style={{width:2, height:10, background:'var(--brand)', opacity: 1 - i*0.08}}/>
                        )}
                      </span>
                    </div>
                  </td>
                  <td><span className="mono" style={{fontSize:12, color:'var(--ink-2)'}}>{o.last}</span></td>
                  <td>
                    {o.state === 'active'
                      ? <span className="chip chip--ok"><span className="dot"/>פעיל</span>
                      : <span className="chip"><span className="dot" style={{background:'var(--ink-4)'}}/>מושהה</span>}
                  </td>
                  <td><Icon name="chevron" size={14} style={{color:'var(--ink-3)', transform:'scaleX(-1)'}}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding:'10px 18px', borderTop:'1px solid var(--hairline)', display:'flex', justifyContent:'space-between', alignItems:'center', font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em'}}>
            <span>8 / 142</span>
            <div style={{display:'flex', gap:6, alignItems:'center'}}>
              <button className="btn btn--ghost btn--sm" style={{padding:'4px 8px'}}><Icon name="chevron" size={11}/></button>
              <span style={{padding:'0 4px'}}>1 · 2 · 3 · … · 18</span>
              <button className="btn btn--ghost btn--sm" style={{padding:'4px 8px'}}><Icon name="chevron" size={11} style={{transform:'scaleX(-1)'}}/></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

window.ScreenHQOrgs = ScreenHQOrgs;
