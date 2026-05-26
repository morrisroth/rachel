import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchMonitor,
  dbInsertOrganization, dbUpdateOrganization,
} from './data.js';
import { Icon, Crest } from './components.jsx';
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
    if (user.role !== 'HQ_USER') { setBusy(false); return setErr('גישה נדחתה — דף זה מיועד לאנשי מטה בלבד. נציגי שטח? עברו לדיווח שטח.'); }
    await onLogin(user);
    setBusy(false);
  }

  async function quickPick(u) { setBusy(true); await onLogin(u); setBusy(false); }

  const hqUsers = users.filter(u => u.role === 'HQ_USER' && u.id <= 22);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 28px',
      background: `
        radial-gradient(ellipse 120% 50% at 50% -5%, oklch(88% 0.04 250 / .18), transparent 55%),
        radial-gradient(ellipse 80% 40% at 10% 100%, oklch(92% 0.025 200 / .12), transparent 55%),
        var(--bg)`,
    }}>
      <div style={{width:'100%', maxWidth:960, display:'grid', gridTemplateColumns:'1.15fr 1fr', gap:52, alignItems:'start'}}>

        {/* ── Left: branding + features + quick pick ── */}
        <div style={{display:'flex', flexDirection:'column', gap:32}}>

          {/* Logo */}
          <Crest subtitle="חמ״ל מרכזי · מטה"/>

          {/* Headline */}
          <div>
            <h1 style={{margin:0, font:'700 44px var(--font-ui)', color:'var(--ink)', letterSpacing:'-.03em', lineHeight:1.05}}>שלום, אנשי המטה</h1>
            <div style={{font:'400 17px var(--font-ui)', color:'var(--ink-3)', marginTop:10, lineHeight:1.5}}>
              חמ״ל מרכזי רח״ל — גישה מורשית לאנשי מטה בלבד
            </div>
          </div>

          {/* Features */}
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {[
              { icon:'home',     text:'תמונת מצב ארצית בזמן אמת — עם רענון אוטומטי' },
              { icon:'bell',     text:'ניהול מצב לאומי ותדירות חובת הדיווח' },
              { icon:'download', text:'ייצוא אקסל לארבעה משרדי ממשלה' },
              { icon:'user',     text:'ניהול ארגונים ונציגי השטח' },
            ].map(({ icon, text }) => (
              <div key={text} style={{display:'flex', alignItems:'center', gap:13}}>
                <div style={{width:34, height:34, borderRadius:9, background:'var(--bg-2)', border:'1px solid var(--line)', display:'grid', placeItems:'center', flexShrink:0}}>
                  <Icon name={icon} size={15} style={{color:'var(--ink-3)'}}/>
                </div>
                <span style={{font:'400 14px var(--font-ui)', color:'var(--ink-2)'}}>{text}</span>
              </div>
            ))}
          </div>

          {/* Quick pick */}
          {hqUsers.length > 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:9}}>
              <div style={{height:1, background:'var(--line)'}}/>
              <div style={{font:'600 10px var(--font-ui)', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:2, marginTop:4}}>
                כניסה מהירה — דמו
              </div>
              {hqUsers.map(u => (
                <button key={u.id} onClick={() => quickPick(u)} disabled={busy}
                  style={{appearance:'none', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:11, padding:'11px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'right', width:'100%', font:'inherit', transition:'all .12s'}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.background='var(--bg)'; }}>
                  <div style={{width:36, height:36, borderRadius:9, background:'var(--bg-2)', border:'1px solid var(--line)', display:'grid', placeItems:'center', font:'700 13px var(--font-mono)', color:'var(--ink-2)', flexShrink:0}}>
                    {u.full_name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{font:'600 14px var(--font-ui)', color:'var(--ink)'}}>{u.full_name}</div>
                    <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', marginTop:1}}>{u.title}</div>
                  </div>
                  <Icon name="arrow-l" size={14} style={{color:'var(--ink-3)', flexShrink:0}}/>
                </button>
              ))}
            </div>
          )}

          <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>
            נציגי שטח?{' '}
            <a href="/" style={{color:'var(--accent)', textDecoration:'none', fontWeight:500}}>כניסה לדיווח שטח ←</a>
          </div>
        </div>

        {/* ── Right: login card ── */}
        <div style={{borderRadius:22, overflow:'hidden', border:'1px solid var(--line)', boxShadow:'0 4px 6px oklch(0% 0 0 / .04), 0 20px 60px oklch(0% 0 0 / .10)'}}>

          {/* Card header — deep navy (distinct from field's bright blue) */}
          <div style={{background:'linear-gradient(135deg, oklch(28% 0.12 260), oklch(22% 0.08 250))', padding:'24px 26px', display:'flex', alignItems:'center', gap:16}}>
            <div style={{width:50, height:50, borderRadius:14, background:'oklch(100% 0 0 / .14)', display:'grid', placeItems:'center', flexShrink:0}}>
              <Icon name="shield" size={23} stroke={1.8} style={{color:'white'}}/>
            </div>
            <div>
              <div style={{font:'700 20px var(--font-ui)', color:'white'}}>כניסה מאובטחת</div>
              <div style={{font:'400 13px var(--font-ui)', color:'oklch(100% 0 0 / .65)', marginTop:2}}>
                גישה מורשית לאנשי מטה בלבד
              </div>
            </div>
          </div>

          {/* Form body */}
          <div style={{background:'var(--surface)'}}>
            <form onSubmit={submit} style={{padding:'24px 26px', display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label className="label">מספר תעודת זהות</label>
                <div style={{position:'relative'}}>
                  <Icon name="user" size={15} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
                  <input className="input num-input" inputMode="numeric" maxLength={9}
                    value={id} onChange={e => setId(e.target.value.replace(/\D/g,''))}
                    placeholder="9 ספרות" style={{paddingInlineStart:38}}/>
                </div>
              </div>
              <div>
                <label className="label">סיסמה</label>
                <div style={{position:'relative'}}>
                  <Icon name="lock" size={15} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
                  <input className="input" type="password"
                    value={pw} onChange={e => setPw(e.target.value)}
                    placeholder="••••" style={{paddingInlineStart:38}}/>
                </div>
              </div>
              {err && (
                <div style={{font:'500 13px var(--font-ui)', color:'var(--bad)', display:'flex', alignItems:'center', gap:7, padding:'10px 13px', background:'var(--bad-bg)', border:'1px solid var(--bad-line)', borderRadius:9}}>
                  <Icon name="alert" size={13}/> {err}
                </div>
              )}
              <button type="submit" disabled={busy}
                style={{appearance:'none', border:0, cursor:'pointer', background:'linear-gradient(135deg, oklch(28% 0.12 260), oklch(22% 0.08 250))', color:'white', padding:'13px', borderRadius:11, font:'600 15px var(--font-ui)', marginTop:2, transition:'opacity .1s', opacity: busy ? .6 : 1}}>
                {busy ? 'מתחבר…' : 'כניסה למטה'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
