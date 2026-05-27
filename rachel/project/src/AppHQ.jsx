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
    <div style={{minHeight:'100dvh', display:'flex', alignItems:'stretch', background:'var(--paper)'}}>

      {/* ── Brand panel (right in RTL) ── */}
      <div style={{flex:'1 1 0', padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between', borderInlineEnd:'1px solid var(--ink)', position:'relative', overflow:'hidden'}}>
        {/* Subtle grid wash */}
        <div style={{position:'absolute', inset:0, pointerEvents:'none', opacity:.4,
          backgroundImage:'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)',
          backgroundSize:'48px 48px'}}/>

        <div style={{position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Crest subtitle="חמ״ל מרכזי — מרכז שליטה ארצי"/>
          <span style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 8px', border:'1px solid var(--ink)', font:'700 9.5px var(--font-mono)', letterSpacing:'.14em', textTransform:'uppercase', borderRadius:2}}>
            אזור מאובטח
          </span>
        </div>

        <div style={{position:'relative'}}>
          <div className="tag" style={{color:'var(--brand)'}}>00 · CONTROL ROOM</div>
          <h1 style={{margin:'14px 0 14px', font:'800 58px/1 var(--font-ui)', letterSpacing:'-.035em'}}>
            תמונת מצב<br/>
            <span style={{color:'var(--brand)'}}>לאומית</span>, בזמן אמת.
          </h1>
          <p style={{margin:'0 0 28px', font:'400 15px/1.55 var(--font-ui)', color:'var(--ink-2)', maxWidth:460}}>
            ניטור רציף של ארגונים, ארבעה משרדי ממשלה, ושרשרת אספקה לאומית. גישה לאנשי מטה מורשים.
          </p>
          <hr style={{border:0, height:1, background:'var(--ink)', maxWidth:460, marginBottom:24}}/>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 240px))', gap:'14px 24px', maxWidth:500}}>
            {[
              ['ניטור', 'תמונת מצב ארצית עם רענון אוטומטי'],
              ['ניהול', 'תדירות הדיווח ומצב לאומי'],
              ['ייצוא', 'אקסל ל-4 משרדי ממשלה'],
              ['ארגונים', 'ניהול ארגונים ונציגי שטח'],
            ].map(([t,d]) => (
              <div key={t}>
                <div style={{font:'700 13px var(--font-ui)', color:'var(--ink)'}}>{t}</div>
                <div style={{font:'400 12.5px/1.4 var(--font-ui)', color:'var(--ink-3)', marginTop:2}}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{position:'relative', display:'flex', justifyContent:'space-between', alignItems:'baseline', font:'500 11px var(--font-mono)', letterSpacing:'.1em', color:'var(--ink-3)', textTransform:'uppercase'}}>
          <span>מערכת רחל · MVP</span>
          <a href="/" style={{color:'var(--brand)', textDecoration:'none'}}>FIELD_USER → /field</a>
        </div>
      </div>

      {/* ── Form panel (left in RTL) ── */}
      <div style={{flex:'0 0 440px', padding:'48px 44px', display:'flex', flexDirection:'column', justifyContent:'center', background:'var(--surface)', borderInlineStart:'1px solid var(--line)'}}>
        <div className="tag" style={{color:'var(--brand)'}}>SIGN IN</div>
        <h2 style={{margin:'10px 0 28px', font:'700 28px var(--font-ui)', letterSpacing:'-.02em'}}>כניסה לחמ״ל</h2>

        <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:16}}>
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
            <div style={{font:'500 13px var(--font-ui)', color:'var(--bad)', display:'flex', alignItems:'center', gap:7, padding:'10px 13px', background:'var(--bad-bg)', border:'1px solid var(--bad-line)', borderRadius:'var(--r-1)'}}>
              <Icon name="alert" size={13}/> {err}
            </div>
          )}
          <button type="submit" disabled={busy} className="btn btn--brand btn--lg"
            style={{marginTop:6, width:'100%', justifyContent:'space-between', opacity: busy ? .6 : 1}}>
            <span>{busy ? 'מתחבר…' : 'אימות והמשך'}</span>
            {!busy && <Icon name="arrow-l" size={16}/>}
          </button>
        </form>

        <hr style={{border:0, height:1, background:'var(--line)', margin:'24px 0 16px'}}/>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.08em', textTransform:'uppercase'}}>
          <span>SECURE · END-TO-END</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:6}}><Icon name="shield" size={12}/> מוצפן</span>
        </div>
      </div>
    </div>
  );
}
