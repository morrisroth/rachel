// Field Mobile — History tab
// Same crest + tag pattern. Read-only list of past reports.

function ScreenFieldHistory() {
  const reports = [
    { date:'27.05.2026', time:'10:14', count:5, ok:true,  items: [
      { name:'קמח חיטה',   stock:42, incoming:18, unit:'טון',     q:'תקין' },
      { name:'אורז לבן',   stock:28, incoming:0,  unit:'טון',     q:'תקין' },
      { name:'שמן חמניות', stock:14, incoming:8,  unit:'ק״ל',    q:'תקין' },
    ]},
    { date:'26.05.2026', time:'09:48', count:5, ok:true, items: [
      { name:'קמח חיטה',   stock:48, incoming:0, unit:'טון', q:'תקין' },
      { name:'אורז לבן',   stock:30, incoming:5, unit:'טון', q:'תקין' },
    ]},
    { date:'25.05.2026', time:'11:02', count:4, ok:true,  items: [] },
    { date:'24.05.2026', time:'09:34', count:5, ok:true,  items: [] },
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

        {/* App header */}
        <div style={{padding:'10px 18px 12px', borderBottom:'1px solid var(--ink)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <Crest subtitle="היסטוריית דיווחים"/>
            <ModePill mode="emergency"/>
          </div>
        </div>

        <div className="phone-body" style={{overflow:'auto'}}>
          <div style={{padding:'16px 18px 12px', borderBottom:'1px solid var(--line)'}}>
            <Tag color="var(--brand)">HISTORY · 02</Tag>
            <div style={{font:'700 22px/1.1 var(--font-ui)', letterSpacing:'-.01em', marginTop:6}}>היסטוריה</div>
            <div style={{font:'500 12px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:5}}>
              <span style={{color:'var(--ink-2)'}}>14</span> דיווחים · 30 ימים אחרונים
            </div>
          </div>

          <div style={{padding:'14px 14px', display:'flex', flexDirection:'column', gap:10}}>
            {reports.map((r, i) => (
              <div key={i} style={{
                border:'1px solid var(--line)',
                borderRadius:'var(--r-2)',
                background:'var(--surface)',
                overflow:'hidden',
              }}>
                <div style={{padding:'10px 13px', borderBottom: r.items.length ? '1px solid var(--hairline)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface-2)'}}>
                  <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                    <span style={{font:'700 13px var(--font-ui)'}}>{r.date}</span>
                    <span className="mono" style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em'}}>{r.time}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <span className="chip">{r.count} פריטים</span>
                    {r.ok && <span className="chip chip--ok"><span className="dot"/>נקלט</span>}
                  </div>
                </div>
                {r.items.map((it, j) => (
                  <div key={j} style={{padding:'10px 13px', borderBottom: j < r.items.length-1 ? '1px solid var(--hairline)' : 'none'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                      <span style={{font:'500 13.5px var(--font-ui)'}}>{it.name}</span>
                      <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em'}}>QUALITY · <span style={{color:'var(--ok)'}}>{it.q}</span></span>
                    </div>
                    <div style={{display:'flex', gap:14, marginTop:4, fontSize:12, color:'var(--ink-2)'}}>
                      <span>נוכחי <span className="num" style={{color:'var(--ink)'}}>{it.stock.toLocaleString('he-IL')}</span> {it.unit}</span>
                      <span>בדרך <span className="num" style={{color: it.incoming ? 'var(--ink)' : 'var(--ink-4)'}}>{it.incoming.toLocaleString('he-IL')}</span> {it.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <BottomNav active="history"/>

        <div style={{display:'flex', justifyContent:'center', padding:'4px 0 8px', flex:'0 0 auto'}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}

// Shared bottom nav for field app
function BottomNav({ active = 'report' }) {
  const tabs = [
    { id:'report',  label:'דיווח',    icon:'home' },
    { id:'history', label:'היסטוריה', icon:'file' },
    { id:'profile', label:'פרופיל',   icon:'user' },
  ];
  return (
    <div style={{flex:'0 0 auto', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid var(--ink)', background:'var(--surface)'}}>
      {tabs.map(t => (
        <div key={t.id} style={{
          padding:'12px 0 10px',
          display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          color: active === t.id ? 'var(--brand)' : 'var(--ink-3)',
          position:'relative',
          borderTop: active === t.id ? '2px solid var(--brand)' : '2px solid transparent',
          marginTop:-1,
        }}>
          <Icon name={t.icon} size={18} stroke={active === t.id ? 2 : 1.6}/>
          <span style={{font: active === t.id ? '700 10.5px var(--font-mono)' : '500 10.5px var(--font-mono)', letterSpacing:'.08em', textTransform:'uppercase'}}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

window.ScreenFieldHistory = ScreenFieldHistory;
window.BottomNav = BottomNav;
