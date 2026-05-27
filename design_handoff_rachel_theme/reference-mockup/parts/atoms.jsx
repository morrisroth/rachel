// Shared atoms — Icon, Crest, ModePill, etc.
// Used across every screen so the theme reads as ONE.

const Icon = ({ name, size = 16, stroke = 1.6, style }) => {
  const paths = {
    home: 'M3 11.5L12 4l9 7.5M5 10.5V20h14v-9.5',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0',
    lock: 'M6 11V8a6 6 0 1112 0v3M5 11h14v10H5z',
    shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z',
    bell: 'M6 10a6 6 0 1112 0v5l2 3H4l2-3v-5zM10 21a2 2 0 004 0',
    download: 'M12 3v12m-5-5l5 5 5-5M4 21h16',
    chevron: 'M9 6l6 6-6 6',
    chevronDown: 'M6 9l6 6 6-6',
    plus: 'M12 5v14M5 12h14',
    search: 'M11 19a8 8 0 110-16 8 8 0 010 16zm6.5-2l4 4',
    check: 'M5 12l5 5L20 7',
    x: 'M6 6l12 12M18 6L6 18',
    alert: 'M12 3l10 18H2L12 3zm0 6v6m0 3v.5',
    truck: 'M3 7h11v9H3V7zm11 3h5l3 3v3h-8v-6zM6 18a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z',
    box: 'M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7m-9 4v10',
    filter: 'M3 5h18M6 12h12M10 19h4',
    refresh: 'M3 12a9 9 0 0115-6.7L21 8m0 4a9 9 0 01-15 6.7L3 16m0-8v3h3m12 7v-3h3',
    arrow: 'M5 12h14m-6-6l6 6-6 6',
    arrowDown: 'M12 5v14m-6-6l6 6 6-6',
    arrowUp: 'M12 19V5m6 6l-6-6-6 6',
    settings: 'M12 9a3 3 0 100 6 3 3 0 000-6zm0-6v3m0 12v3M5 5l2 2m10 10l2 2M3 12h3m12 0h3M5 19l2-2M17 7l2-2',
    file: 'M6 3h9l4 4v14H6V3zm9 0v4h4',
    camera: 'M4 7h3l2-3h6l2 3h3v13H4V7zm8 11a4 4 0 100-8 4 4 0 000 8z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
    map: 'M9 4l-6 3v13l6-3m0-13l6 3m-6-3v13m6-10l6-3v13l-6 3m0-13v13',
    flag: 'M4 4v17M4 4l11 1-1 5h6l-2 5h-5l-1-4-8 1V4z',
    clipboard: 'M9 4h6v3H9V4zm0 0H6v17h12V4h-3M9 11h6m-6 4h6',
    chart: 'M4 20V8m6 12V4m6 16v-8m6 8V12',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || paths.box}/>
    </svg>
  );
};

const Crest = ({ subtitle = 'מערכת דיווח מלאי ארצי', variant = 'ink' }) => (
  <div className={'crest ' + (variant === 'brand' ? 'crest--brand' : '')}>
    <div className="mark">ר</div>
    <div>
      <div className="name">רחל</div>
      <div className="sub">{subtitle}</div>
    </div>
  </div>
);

const ModePill = ({ mode = 'emergency' }) => (
  <span className={'mode-pill is-' + mode}>
    <span className="dot"></span>
    {mode === 'emergency' ? 'מצב חירום' : 'שגרה'}
  </span>
);

// A clock indicator that updates… visually only (static).
const Clock = ({ time = '14:32', date = '27.05.2026' }) => (
  <div style={{display:'flex', alignItems:'baseline', gap:8, font:'500 12px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em'}}>
    <span>{date}</span>
    <span style={{opacity:.4}}>·</span>
    <span style={{color:'var(--ink-2)'}}>{time}</span>
  </div>
);

// Tag label — small mono uppercase
const Tag = ({ children, color }) => (
  <span className="tag" style={color ? {color} : undefined}>{children}</span>
);

// A KPI tile with a tiny meta line
const KPI = ({ label, value, unit, meta, variant }) => (
  <div className={'kpi ' + (variant ? 'kpi--' + variant : '')}>
    <div className="lbl">{label}</div>
    <div style={{display:'flex', alignItems:'baseline', gap:6}}>
      <span className="val">{value}</span>
      {unit && <span style={{font:'600 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em', textTransform:'uppercase'}}>{unit}</span>}
    </div>
    {meta && <div className="meta">{meta}</div>}
  </div>
);

// Brand stamp — corner mark you can put in a header
const Stamp = ({ children }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'4px 8px',
    border:'1px solid var(--ink)',
    color:'var(--ink)',
    font:'700 9.5px var(--font-mono)',
    letterSpacing:'.14em',
    textTransform:'uppercase',
    borderRadius: '2px',
  }}>{children}</span>
);

// Section header used in panel bodies
const SectionTitle = ({ index, title, meta }) => (
  <div className="sec-title">
    {index && <span className="tag" style={{color:'var(--brand)'}}>{index}</span>}
    <h2>{title}</h2>
    {meta && <div className="meta">{meta}</div>}
  </div>
);

// A double-rule (editorial divider)
const Ruler = ({ soft }) => <hr className={'ruler ' + (soft ? 'ruler--soft' : '')}/>;

// Status dot with text
const Status = ({ tone = 'ok', children }) => (
  <span style={{display:'inline-flex', alignItems:'center', gap:6, font:'600 12px var(--font-ui)',
    color: tone === 'ok' ? 'var(--ok)' : tone === 'bad' ? 'var(--bad)' : tone === 'warn' ? 'var(--warn)' : 'var(--ink-3)'}}>
    <span className="dot"/>{children}
  </span>
);

// Make available to all other JSX scripts
Object.assign(window, { Icon, Crest, ModePill, Clock, Tag, KPI, Stamp, SectionTitle, Ruler, Status });
