import { useState, useEffect, useRef, useMemo } from 'react';

export const Icon = ({ name, size = 16, stroke = 1.7, ...rest }) => {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
                   stroke: 'currentColor', strokeWidth: stroke,
                   strokeLinecap: 'round', strokeLinejoin: 'round', ...rest };
  switch (name) {
    case 'check':     return <svg {...common}><path d="M5 12l4 4L19 6"/></svg>;
    case 'x':         return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'alert':     return <svg {...common}><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.7L2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/></svg>;
    case 'clock':     return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'download':  return <svg {...common}><path d="M12 4v12m0 0l-4-4m4 4l4-4"/><path d="M4 20h16"/></svg>;
    case 'history':   return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>;
    case 'home':      return <svg {...common}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case 'logout':    return <svg {...common}><path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
    case 'plus':      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'trash':     return <svg {...common}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case 'search':    return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'copy':      return <svg {...common}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>;
    case 'spark':     return <svg {...common}><path d="M12 3v6m0 6v6M3 12h6m6 0h6"/></svg>;
    case 'shield':    return <svg {...common}><path d="M12 3l8 4v6c0 5-3.5 8-8 8s-8-3-8-8V7l8-4z"/></svg>;
    case 'chevron-l': return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-r': return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-d': return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case 'arrow-l':   return <svg {...common}><path d="M19 12H5m6-7l-7 7 7 7"/></svg>;
    case 'arrow-r':   return <svg {...common}><path d="M5 12h14m-7-7l7 7-7 7"/></svg>;
    case 'menu':      return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'doc':       return <svg {...common}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>;
    case 'bell':      return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'mail':      return <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>;
    case 'user':      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    case 'lock':      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    default: return null;
  }
};

export function Crest({ subtitle }) {
  return (
    <div className="crest">
      <div className="mark">ר</div>
      <div style={{display:'flex', flexDirection:'column', lineHeight:1.1, gap:2}}>
        <div>רחל</div>
        {subtitle && <div style={{font:'500 11px var(--font-ui)', color:'var(--ink-3)', letterSpacing:'.04em'}}>{subtitle}</div>}
      </div>
    </div>
  );
}

export function formatDate(ms, { withTime = true } = {}) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  if (!withTime) return date;
  return `${date} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function relTime(ms) {
  const diff = Date.now() - ms;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.round(m / 60);
  if (h < 24) return `לפני ${h} שע׳`;
  const d = Math.round(h / 24);
  return `לפני ${d} ימים`;
}

export function reportIsWithin24h(ms) {
  return Date.now() - ms < 24 * 3600 * 1000;
}

export function StatusBlock({ status, lastReportMs }) {
  const map = {
    ok:      { cls: 'banner--ok',   icon: 'check', title: 'הדיווח היומי שלך נקלט בהצלחה', sub: lastReportMs ? `דווח אחרון: ${formatDate(lastReportMs)} (${relTime(lastReportMs)})` : '' },
    missing: { cls: 'banner--bad',  icon: 'alert', title: 'חסר דיווח להיום', sub: 'נא לעדכן מלאים בהקדם — מצב חירום פעיל' },
    soon:    { cls: 'banner--warn', icon: 'clock', title: 'הדיווח נשלח אך הצטברו שינויים', sub: 'הוסף עדכון נקודתי לפני סוף היום' },
  };
  const m = map[status] || map.missing;
  return (
    <div className={`banner ${m.cls}`} style={{borderRadius:'10px', padding:'16px 18px'}}>
      <div style={{flex:'0 0 auto', marginTop:2}}><Icon name={m.icon} size={20} stroke={2}/></div>
      <div style={{flex:'1 1 auto'}}>
        <div style={{font:'600 16px var(--font-ui)', lineHeight:1.25}}>{m.title}</div>
        {m.sub && <div style={{font:'400 13px var(--font-ui)', marginTop:4, opacity:.86}}>{m.sub}</div>}
      </div>
    </div>
  );
}

export function ProductCombobox({ value, onChange, onFreeText, products, categories, placeholder = 'בחר מוצר או הקלד שם מוצר חדש…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [query, products]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.some(p => p.name.toLowerCase() === q);
  }, [query, products]);

  const displayLabel = value?.kind === 'catalog'
    ? products.find(p => p.id === value.product_id)?.name
    : value?.kind === 'free' ? value.name : '';

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button type="button" className="input"
        onClick={() => { setOpen(o => !o); setTimeout(() => ref.current?.querySelector('input')?.focus(), 30); }}
        style={{display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', textAlign:'right', minHeight:42, color: displayLabel ? 'var(--ink)' : 'var(--ink-3)'}}>
        <span style={{display:'flex', alignItems:'center', gap:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {displayLabel || placeholder}
          {value?.kind === 'free' && <span className="chip chip--accent" style={{fontSize:11, padding:'1px 7px'}}>טקסט חופשי</span>}
        </span>
        <Icon name="chevron-d" size={16}/>
      </button>

      {open && (
        <div className="card anim-in" style={{position:'absolute', insetInlineStart:0, insetInlineEnd:0, top:'calc(100% + 6px)', maxHeight:320, overflow:'auto', zIndex:30, padding:6, boxShadow:'var(--shadow-2)'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderBottom:'1px solid var(--line)'}}>
            <Icon name="search" size={14}/>
            <input className="input" style={{border:'0', padding:'4px 0', boxShadow:'none', fontSize:14}}
              placeholder="חפש בקטלוג או הקלד מוצר חדש"
              value={query} onChange={e => setQuery(e.target.value)} maxLength={100} autoFocus/>
          </div>
          {matches.length > 0 ? (
            <div style={{maxHeight:240, overflow:'auto'}}>
              {matches.map(p => {
                const cat = categories.find(c => c.id === p.category_id);
                return (
                  <button key={p.id} type="button"
                    onClick={() => { onChange({ kind:'catalog', product_id: p.id }); setOpen(false); setQuery(''); }}
                    style={{width:'100%', textAlign:'right', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 10px', border:'0', background:'transparent', cursor:'pointer', borderRadius:6, font:'500 14px var(--font-ui)'}}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{p.name}</span>
                    <span style={{display:'flex', gap:6, alignItems:'center'}}>
                      <span className="chip" style={{fontSize:11, padding:'1px 6px'}}>{cat?.short}</span>
                      <span className="mono" style={{color:'var(--ink-3)', fontSize:12}}>{p.unit}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{padding:'18px 14px', color:'var(--ink-3)', fontSize:13}}>לא נמצא מוצר תואם בקטלוג.</div>
          )}
          {query.trim() && !exactMatch && (
            <>
              <div className="hr" style={{margin:'4px 0'}}/>
              <button type="button"
                onClick={() => { onFreeText(query.trim()); setOpen(false); setQuery(''); }}
                style={{width:'100%', textAlign:'right', display:'flex', alignItems:'center', gap:10, padding:'10px 10px', border:'0', background:'transparent', cursor:'pointer', borderRadius:6, color:'var(--accent)', font:'500 14px var(--font-ui)'}}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon name="plus" size={14} stroke={2.2}/>
                הוסף כטקסט חופשי: «{query.trim()}»
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PillToggle({ value, options, onChange }) {
  return (
    <div className="pill-toggle">
      {options.map(o => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Kpi({ label, value, accent }) {
  const color = accent === 'ok' ? 'var(--ok)' : accent === 'bad' ? 'var(--bad)' : 'var(--ink)';
  return (
    <div className="card" style={{padding:'16px 18px', display:'flex', flexDirection:'column', gap:6}}>
      <div style={{font:'600 11px var(--font-ui)', color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase'}}>{label}</div>
      <div className="num" style={{font:'600 28px var(--font-mono)', color, lineHeight:1, fontFeatureSettings:'"tnum" 1'}}>{value}</div>
    </div>
  );
}

export function PageHeader({ title, sub, right }) {
  return (
    <header style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, paddingBottom:14, borderBottom:'1px solid var(--line)', flexWrap:'wrap'}}>
      <div style={{minWidth:0}}>
        <h1 style={{margin:0, font:'600 22px var(--font-ui)', letterSpacing:'-.005em'}}>{title}</h1>
        {sub && <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)', marginTop:6}}>{sub}</div>}
      </div>
      {right && <div style={{flex:'0 0 auto'}}>{right}</div>}
    </header>
  );
}
