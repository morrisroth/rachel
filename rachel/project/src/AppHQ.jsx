import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchMonitor,
  dbInsertOrganization, dbUpdateOrganization,
  dbFetchAppSettings, dbSaveAppSetting,
} from './data.js';
import { Icon, Crest, ModePill } from './components.jsx';
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
    Promise.all([dbFetchOrganizations(), dbFetchUsers(), dbFetchAppSettings()])
      .then(([orgsData, usersData, settings]) => {
        setOrgs(orgsData);
        setUsers(usersData);
        if (settings.national) { setNational(settings.national); setTweak('national', settings.national); }
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
      <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--paper)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16}}>
          <div style={{width:36, height:36, border:'3px solid var(--line)', borderTopColor:'var(--ink)', borderRadius:'50%', animation:'spin 0.7s linear infinite'}}/>
          <div style={{font:'500 14px var(--font-ui)', color:'var(--ink-2)'}}>טוען נתונים…</div>
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
               onSetMode={async (m) => { setNational(m); setTweak('national', m); await dbSaveAppSetting('national', m); }}
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
    <div style={{minHeight:'100dvh', display:'flex', flexDirection:'column', background:'var(--paper)',
      backgroundImage:'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)',
      backgroundSize:'48px 48px'}}>

      {/* Header */}
      <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:56,
        borderBottom:'1px solid var(--ink)', background:'var(--paper)', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <img src="/mod-logo.jpg" alt="MOD Logo" style={{width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'1px solid var(--line)', flexShrink:0}}/>
          <Crest subtitle="חמ״ל מרכזי — מרכז שליטה ארצי"/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px',
            border:'1px solid var(--ink)', font:'700 9.5px var(--font-mono)', letterSpacing:'.14em', textTransform:'uppercase', borderRadius:2}}>
            אזור מאובטח
          </span>
          <a href="/" style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', textDecoration:'none', letterSpacing:'.08em', textTransform:'uppercase'}}>FIELD →</a>
        </div>
      </header>

      {/* Centered form */}
      <div style={{flex:1, display:'grid', placeItems:'center', padding:'48px 24px'}}>
        <div style={{width:'100%', maxWidth:440}}>
          <div style={{marginBottom:28}}>
            <div className="tag" style={{color:'var(--brand)', marginBottom:8}}>00 · CONTROL ROOM</div>
            <h1 style={{margin:'0 0 6px', font:'800 38px/1.05 var(--font-ui)', letterSpacing:'-.025em'}}>כניסה לחמ״ל</h1>
            <p style={{margin:0, font:'400 14px/1.5 var(--font-ui)', color:'var(--ink-3)'}}>
              ניטור ארצי, ייצוא נתונים וניהול ארגונים. גישה לאנשי מטה מורשים בלבד.
            </p>
          </div>
          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <label className="label">מספר תעודת זהות</label>
              <div style={{position:'relative'}}>
                <Icon name="user" size={14} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
                <input className="input num-input" inputMode="numeric" maxLength={9}
                  value={id} onChange={e => setId(e.target.value.replace(/\D/g,''))}
                  placeholder="9 ספרות" style={{paddingInlineStart:38}}/>
              </div>
            </div>
            <div>
              <label className="label">סיסמה</label>
              <div style={{position:'relative'}}>
                <Icon name="lock" size={14} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
                <input className="input" type="password"
                  value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••" style={{paddingInlineStart:38}}/>
              </div>
            </div>
            {err && (
              <div style={{font:'500 13px var(--font-ui)', color:'var(--bad)', display:'flex', alignItems:'center', gap:7,
                padding:'10px 13px', background:'var(--bad-bg)', border:'1px solid var(--bad-line)', borderRadius:'var(--r-1)'}}>
                <Icon name="alert" size={13}/> {err}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn btn--brand btn--lg"
              style={{width:'100%', justifyContent:'space-between', marginTop:4, opacity: busy ? .6 : 1}}>
              <span>{busy ? 'מתחבר…' : 'כניסה לחמ״ל'}</span>
              {!busy && <Icon name="arrow-l" size={16}/>}
            </button>
          </form>
          <div style={{marginTop:20, paddingTop:14, borderTop:'1px solid var(--hairline)',
            display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', alignItems:'center', gap:7}}>
              <div style={{width:6, height:6, borderRadius:'50%', background:'var(--ok)', boxShadow:'0 0 0 2px oklch(88% 0.08 155/.4)'}}/>
              <span style={{font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.1em', textTransform:'uppercase'}}>SECURE · END-TO-END</span>
            </div>
            <Icon name="shield" size={13} style={{color:'var(--ink-3)'}}/>
          </div>
        </div>
      </div>
    </div>
  );
}
