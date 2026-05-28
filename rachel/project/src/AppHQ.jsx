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
    <div style={{minHeight:'100dvh', display:'flex', alignItems:'stretch'}}>

      {/* ── Brand panel ── */}
      <div style={{flex:'1 1 0', background:'#0f0e0c', position:'relative', overflow:'hidden',
                   display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 60px'}}>
        {/* Grid overlay */}
        <div style={{position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize:'48px 48px'}}/>
        {/* Glow */}
        <div style={{position:'absolute', top:'-20%', insetInlineEnd:'-10%', width:500, height:500,
          borderRadius:'50%', background:'radial-gradient(circle, rgba(74,120,80,.18) 0%, transparent 70%)', pointerEvents:'none'}}/>

        {/* Top bar */}
        <div style={{position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <img src="/mod-logo.jpg" alt="" style={{width:48, height:48, borderRadius:'50%', objectFit:'cover',
              border:'1px solid rgba(255,255,255,.15)', flexShrink:0}}/>
            <div>
              <div style={{font:'700 14px var(--font-ui)', color:'#fff', letterSpacing:'-.01em'}}>מערכת רחל</div>
              <div style={{font:'500 10px var(--font-mono)', color:'rgba(255,255,255,.35)', letterSpacing:'.12em', textTransform:'uppercase', marginTop:2}}>חמ״ל מרכזי · מרכז שליטה ארצי</div>
            </div>
          </div>
          <div style={{display:'inline-flex', alignItems:'center', gap:6, padding:'5px 11px',
            border:'1px solid rgba(255,255,255,.12)', borderRadius:3,
            font:'700 9px var(--font-mono)', letterSpacing:'.14em', color:'rgba(255,255,255,.4)', textTransform:'uppercase'}}>
            <div style={{width:5, height:5, borderRadius:'50%', background:'#4a7850'}}/>
            אזור מאובטח
          </div>
        </div>

        {/* Hero text */}
        <div style={{position:'relative'}}>
          <div style={{display:'inline-block', padding:'4px 10px', marginBottom:22,
            background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:3,
            font:'700 10px var(--font-mono)', letterSpacing:'.14em', color:'rgba(255,255,255,.45)', textTransform:'uppercase'}}>
            00 · CONTROL ROOM
          </div>
          <h1 style={{margin:'0 0 20px', font:'800 66px/1 var(--font-ui)', letterSpacing:'-.04em', color:'#fff'}}>
            תמונת מצב<br/>
            <span style={{color:'var(--brand)'}}>לאומית</span>,<br/>
            בזמן אמת.
          </h1>
          <p style={{margin:'0 0 32px', font:'400 15px/1.65 var(--font-ui)', color:'rgba(255,255,255,.45)', maxWidth:440}}>
            ניטור רציף של ארגונים, ארבעה משרדי ממשלה, ושרשרת אספקה לאומית.<br/>גישה לאנשי מטה מורשים בלבד.
          </p>
          <div style={{width:36, height:2, background:'rgba(255,255,255,.15)', borderRadius:1, marginBottom:28}}/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxWidth:480}}>
            {[
              ['ניטור', 'תמונת מצב ארצית, רענון אוטומטי'],
              ['ניהול', 'תדירות דיווח ומצב לאומי'],
              ['ייצוא', 'אקסל ל-4 משרדי ממשלה'],
              ['ארגונים', 'ניהול ארגונים ונציגי שטח'],
            ].map(([title, desc]) => (
              <div key={title} style={{padding:'14px 16px',
                background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:4}}>
                <div style={{font:'700 13px var(--font-ui)', color:'#fff', marginBottom:4}}>{title}</div>
                <div style={{font:'400 12px/1.4 var(--font-ui)', color:'rgba(255,255,255,.38)'}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center',
          font:'500 10px var(--font-mono)', letterSpacing:'.1em', color:'rgba(255,255,255,.22)', textTransform:'uppercase'}}>
          <span>מערכת רחל · MVP</span>
          <a href="/" style={{color:'rgba(255,255,255,.3)', textDecoration:'none', letterSpacing:'.08em'}}>FIELD_USER → /field</a>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div style={{flex:'0 0 420px', display:'flex', flexDirection:'column', justifyContent:'center',
                   padding:'52px 48px', background:'var(--paper)', borderInlineStart:'1px solid var(--line)'}}>

        <div style={{marginBottom:32}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', marginBottom:18,
            border:'1px solid var(--line)', borderRadius:3,
            font:'700 9px var(--font-mono)', letterSpacing:'.14em', color:'var(--ink-3)', textTransform:'uppercase'}}>
            SIGN IN
          </div>
          <h2 style={{margin:'0 0 8px', font:'700 32px/1.1 var(--font-ui)', letterSpacing:'-.025em'}}>כניסה לחמ״ל</h2>
          <p style={{margin:0, font:'400 14px/1.5 var(--font-ui)', color:'var(--ink-3)'}}>הזן פרטי גישה מורשים להמשך</p>
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
            style={{marginTop:6, width:'100%', justifyContent:'space-between', opacity: busy ? .6 : 1}}>
            <span>{busy ? 'מתחבר…' : 'אימות והמשך'}</span>
            {!busy && <Icon name="arrow-l" size={16}/>}
          </button>
        </form>

        <div style={{marginTop:28, paddingTop:20, borderTop:'1px solid var(--line)',
          display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:7}}>
            <div style={{width:6, height:6, borderRadius:'50%', background:'var(--ok)', boxShadow:'0 0 0 2px oklch(88% 0.08 155/.4)'}}/>
            <span style={{font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.1em', textTransform:'uppercase'}}>SECURE</span>
          </div>
          <span style={{display:'inline-flex', alignItems:'center', gap:5, font:'500 10px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em', textTransform:'uppercase'}}>
            <Icon name="shield" size={11}/> END-TO-END
          </span>
        </div>
      </div>
    </div>
  );
}
