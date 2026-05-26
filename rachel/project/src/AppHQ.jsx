import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchMonitor,
  dbInsertOrganization, dbUpdateOrganization,
} from './data.js';
import { Icon } from './components.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakButton } from './tweaks-panel.jsx';
import { HQShell } from './hq.jsx';

const TWEAK_DEFAULTS = {
  national:   'emergency',
  density:    'regular',
  dark:       false,
  showTweaks: true,
};

export function AppHQ() {
  const [t, setTweak]         = useTweaks(TWEAK_DEFAULTS);
  const [session, setSession]  = useState(null);
  const [orgs,    setOrgs]     = useState([]);
  const [users,   setUsers]    = useState([]);
  const [monitor, setMonitor]  = useState([]);
  const [national, setNational] = useState(t.national);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([dbFetchOrganizations(), dbFetchUsers()])
      .then(([orgsData, usersData]) => {
        setOrgs(orgsData);
        setUsers(usersData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => setNational(t.national), [t.national]);
  useEffect(() => {
    document.body.classList.toggle('density-compact', t.density === 'compact');
    document.body.classList.toggle('dark', !!t.dark);
  }, [t.density, t.dark]);

  async function login(user) {
    const mon = await dbFetchMonitor();
    setMonitor(mon);
    setSession(user);
  }

  function logout() { setSession(null); setMonitor([]); }

  async function refreshMonitor() {
    const mon = await dbFetchMonitor();
    setMonitor(mon);
  }

  async function addOrganization(payload) {
    const { org: newOrg, user: newUser } = await dbInsertOrganization(payload);
    setOrgs(prev => [...prev, newOrg]);
    setUsers(prev => [...prev, newUser]);
    return { org: newOrg, user: newUser };
  }

  async function updateOrganization(id, patch) {
    await dbUpdateOrganization(id, patch);
    const orgsData = await dbFetchOrganizations();
    setOrgs(orgsData);
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'oklch(14% 0.010 80)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16}}>
          <div style={{width:36, height:36, border:'3px solid oklch(32% 0.010 80)', borderTopColor:'oklch(80% 0.008 80)', borderRadius:'50%', animation:'spin 0.7s linear infinite'}}/>
          <div style={{font:'500 14px var(--font-ui)', color:'oklch(55% 0.010 80)'}}>טוען נתונים…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return <HQLogin users={users} onLogin={login}/>;
  }

  return (
    <>
      <HQShell user={session} onLogout={logout}
               mode={national}
               onSetMode={(m) => { setNational(m); setTweak('national', m); }}
               orgs={orgs} users={users}
               monitor={monitor}
               onRefreshMonitor={refreshMonitor}
               onAddOrganization={addOrganization}
               onUpdateOrganization={updateOrganization}/>
      <TweaksPanel>
        <TweakSection label="חשבון" />
        <TweakRadio label="מצב לאומי" value={national}
                    options={[{value:'routine',label:'שגרה'},{value:'emergency',label:'חירום'}]}
                    onChange={(v) => { setNational(v); setTweak('national', v); }} />
        <TweakSection label="ערכת נושא" />
        <TweakRadio label="צפיפות" value={t.density}
                    options={[{value:'regular',label:'רגיל'},{value:'compact',label:'דחוס'}]}
                    onChange={(v) => setTweak('density', v)} />
        <TweakToggle label="מצב כהה" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakSection label="דמו" />
        <TweakButton onClick={logout}>יציאה ומעבר בין משתמשים</TweakButton>
      </TweaksPanel>
    </>
  );
}

// ── HQ login page — dark command-center design ───────────────────────────────

const D = {
  bg:       'oklch(13% 0.010 80)',
  bg2:      'oklch(18% 0.012 80)',
  bg3:      'oklch(22% 0.012 80)',
  surface:  'oklch(20% 0.012 80)',
  line:     'oklch(28% 0.012 80)',
  line2:    'oklch(35% 0.012 80)',
  ink:      'oklch(95% 0.005 80)',
  ink2:     'oklch(72% 0.008 80)',
  ink3:     'oklch(50% 0.008 80)',
  ink4:     'oklch(38% 0.008 80)',
};

function HQLogin({ users, onLogin }) {
  const [id, setId]     = useState('');
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    setErr('');
    setBusy(true);
    const { user } = await dbLogin(id, pw);
    if (!user) { setBusy(false); return setErr('פרטי כניסה שגויים — בדוק ת״ז וסיסמה'); }
    if (user.role !== 'HQ_USER') { setBusy(false); return setErr('דף זה מיועד לאנשי מטה רח״ל בלבד'); }
    await onLogin(user);
    setBusy(false);
  }

  async function quickPick(u) { setBusy(true); await onLogin(u); setBusy(false); }

  const hqUsers = users.filter(u => u.role === 'HQ_USER' && u.id <= 22);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 28px',
      background: `
        radial-gradient(ellipse 900px 500px at 70% -10%, oklch(30% 0.08 250 / .45), transparent 55%),
        radial-gradient(ellipse 600px 400px at 0% 100%,  oklch(22% 0.05 200 / .3),  transparent 55%),
        ${D.bg}`,
    }}>
      <div style={{width:'100%', maxWidth:980, display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:52, alignItems:'start'}}>

        {/* ── Left: branding + features + quick pick ── */}
        <div style={{display:'flex', flexDirection:'column', gap:32}}>

          {/* Logo */}
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:36, height:36, border:`1.5px solid ${D.line2}`, borderRadius:9, display:'grid', placeItems:'center', font:'800 14px var(--font-mono)', color:D.ink, letterSpacing:'-.02em'}}>ר</div>
            <div>
              <div style={{font:'700 15px var(--font-ui)', color:D.ink}}>רחל</div>
              <div style={{font:'500 11px var(--font-ui)', color:D.ink3, letterSpacing:'.04em'}}>חמ״ל מרכזי · מטה</div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{margin:0, font:'700 44px var(--font-ui)', color:D.ink, letterSpacing:'-.03em', lineHeight:1.05}}>מטה רח״ל</h1>
            <div style={{font:'400 17px var(--font-ui)', color:D.ink3, marginTop:10, lineHeight:1.5}}>
              ניטור ארצי · ניהול ארגונים · ייצוא נתונים
            </div>
          </div>

          {/* Features */}
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {[
              { icon:'home',     text:'תמונת מצב ארצית בזמן אמת — עם רענון אוטומטי' },
              { icon:'bell',     text:'ניהול מצב לאומי ותדירות חובת הדיווח' },
              { icon:'download', text:'ייצוא אקסל לארבעה משרדי ממשלה' },
              { icon:'user',     text:'ניהול ארגונים ונציגי השטח' },
            ].map(({ icon, text }) => (
              <div key={text} style={{display:'flex', alignItems:'center', gap:13}}>
                <div style={{width:34, height:34, borderRadius:9, background:D.bg3, border:`1px solid ${D.line}`, display:'grid', placeItems:'center', flexShrink:0}}>
                  <Icon name={icon} size={15} style={{color:D.ink3}}/>
                </div>
                <span style={{font:'400 14px var(--font-ui)', color:D.ink2}}>{text}</span>
              </div>
            ))}
          </div>

          {/* Quick pick */}
          {hqUsers.length > 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <div style={{height:1, background:D.line}}/>
              <div style={{font:'600 10px var(--font-ui)', letterSpacing:'.09em', textTransform:'uppercase', color:D.ink4, marginBottom:2}}>
                כניסה מהירה — דמו
              </div>
              {hqUsers.map(u => (
                <button key={u.id} onClick={() => quickPick(u)} disabled={busy}
                  style={{appearance:'none', background:D.bg3, border:`1px solid ${D.line}`, borderRadius:13, padding:'13px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:13, textAlign:'right', width:'100%', font:'inherit', transition:'all .12s'}}
                  onMouseEnter={e => { e.currentTarget.style.background='oklch(26% 0.012 80)'; e.currentTarget.style.borderColor=D.line2; }}
                  onMouseLeave={e => { e.currentTarget.style.background=D.bg3; e.currentTarget.style.borderColor=D.line; }}>
                  <div style={{width:40, height:40, borderRadius:11, background:D.bg2, border:`1px solid ${D.line}`, display:'grid', placeItems:'center', font:'700 14px var(--font-mono)', color:D.ink2, flexShrink:0}}>
                    {u.full_name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{font:'600 14px var(--font-ui)', color:D.ink}}>{u.full_name}</div>
                    <div style={{font:'400 11px var(--font-ui)', color:D.ink3, marginTop:1}}>{u.title}</div>
                  </div>
                  <Icon name="arrow-l" size={14} style={{color:D.ink4, flexShrink:0}}/>
                </button>
              ))}
            </div>
          )}

          <div style={{font:'400 12px var(--font-ui)', color:D.ink4}}>
            נציגי שטח?{' '}
            <a href="/" style={{color:'oklch(68% 0.14 250)', textDecoration:'none', fontWeight:500}}>כניסה לדיווח שטח ←</a>
          </div>
        </div>

        {/* ── Right: login form ── */}
        <div style={{borderRadius:22, overflow:'hidden', border:`1px solid ${D.line}`, boxShadow:'0 32px 80px oklch(0% 0 0 / .45)'}}>

          {/* Form header */}
          <div style={{background:`linear-gradient(135deg, oklch(19% 0.012 80), oklch(22% 0.015 250))`, borderBottom:`1px solid ${D.line}`, padding:'24px 28px', display:'flex', alignItems:'center', gap:16}}>
            <div style={{width:48, height:48, borderRadius:13, background:D.bg3, border:`1px solid ${D.line2}`, display:'grid', placeItems:'center', flexShrink:0}}>
              <Icon name="shield" size={22} style={{color:D.ink2}}/>
            </div>
            <div>
              <div style={{font:'700 19px var(--font-ui)', color:D.ink}}>כניסה מאובטחת</div>
              <div style={{font:'400 12px var(--font-ui)', color:D.ink3, marginTop:3}}>גישה מורשית לאנשי מטה בלבד</div>
            </div>
          </div>

          {/* Fields */}
          <form onSubmit={submit} style={{background:D.surface, padding:'26px 28px', display:'flex', flexDirection:'column', gap:16}}>
            <div>
              <label style={{display:'block', marginBottom:7, font:'500 12px/1 var(--font-ui)', color:D.ink3, letterSpacing:'.04em'}}>
                מספר תעודת זהות
              </label>
              <div style={{position:'relative'}}>
                <Icon name="user" size={15} style={{position:'absolute', insetInlineStart:13, top:'50%', transform:'translateY(-50%)', color:D.ink4}}/>
                <input
                  style={{width:'100%', padding:'12px 13px', paddingInlineStart:40, font:'400 15px var(--font-mono)', color:D.ink, background:D.bg2, border:`1px solid ${D.line}`, borderRadius:9, outline:'none', boxSizing:'border-box', transition:'border-color .12s'}}
                  inputMode="numeric" maxLength={9}
                  value={id} onChange={e => setId(e.target.value.replace(/\D/g,''))}
                  placeholder="9 ספרות"
                  onFocus={e => e.target.style.borderColor=D.line2}
                  onBlur={e => e.target.style.borderColor=D.line}
                />
              </div>
            </div>
            <div>
              <label style={{display:'block', marginBottom:7, font:'500 12px/1 var(--font-ui)', color:D.ink3, letterSpacing:'.04em'}}>
                סיסמה
              </label>
              <div style={{position:'relative'}}>
                <Icon name="lock" size={15} style={{position:'absolute', insetInlineStart:13, top:'50%', transform:'translateY(-50%)', color:D.ink4}}/>
                <input
                  style={{width:'100%', padding:'12px 13px', paddingInlineStart:40, font:'400 15px var(--font-ui)', color:D.ink, background:D.bg2, border:`1px solid ${D.line}`, borderRadius:9, outline:'none', boxSizing:'border-box', transition:'border-color .12s'}}
                  type="password"
                  value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••"
                  onFocus={e => e.target.style.borderColor=D.line2}
                  onBlur={e => e.target.style.borderColor=D.line}
                />
              </div>
            </div>
            {err && (
              <div style={{font:'500 12px var(--font-ui)', color:'oklch(72% 0.18 28)', display:'flex', alignItems:'center', gap:7, padding:'10px 13px', background:'oklch(19% 0.06 28)', border:'1px solid oklch(30% 0.12 28)', borderRadius:9}}>
                <Icon name="alert" size={13}/> {err}
              </div>
            )}
            <button type="submit" disabled={busy}
              style={{appearance:'none', border:0, cursor:'pointer', marginTop:4, padding:'14px', borderRadius:11, font:'600 15px var(--font-ui)', background:D.ink, color:D.bg, transition:'opacity .1s', opacity: busy ? .6 : 1}}>
              {busy ? 'מתחבר…' : 'כניסה למטה'}
            </button>

            <div style={{font:'400 11px var(--font-ui)', color:D.ink4, textAlign:'center', marginTop:2}}>
              גישה מוגבלת לאנשי מטה רח״ל בלבד
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
