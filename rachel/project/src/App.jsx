import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchHistory, dbFetchMonitor,
  dbInsertReport, dbInsertOrganization, dbUpdateOrganization,
} from './data.js';
import { Icon, Crest } from './components.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakButton } from './tweaks-panel.jsx';
import { FieldShell } from './field.jsx';
import { HQShell } from './hq.jsx';

const TWEAK_DEFAULTS = {
  fieldView: 'phone',
  national:  'emergency',
  density:   'regular',
  dark:      false,
  showTweaks: true,
};

export function App() {
  const [t, setTweak]       = useTweaks(TWEAK_DEFAULTS);
  const [session, setSession] = useState(null);
  const [orgs,    setOrgs]    = useState([]);
  const [users,   setUsers]   = useState([]);
  const [history, setHistory] = useState([]);
  const [monitor, setMonitor] = useState([]);
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
    const hist = await dbFetchHistory(user.organization_id);
    setHistory(hist);
    if (user.role === 'HQ_USER') {
      const mon = await dbFetchMonitor();
      setMonitor(mon);
    }
    setSession(user);
  }

  function logout() {
    setSession(null);
    setHistory([]);
    setMonitor([]);
  }

  async function submitReport(payload) {
    await dbInsertReport(payload);
    const [hist, mon] = await Promise.all([
      dbFetchHistory(payload.organization_id),
      dbFetchMonitor(),
    ]);
    setHistory(hist);
    setMonitor(mon);
  }

  async function addOrganization(payload) {
    const { org: newOrg, user: newUser } = await dbInsertOrganization(payload);
    setOrgs(prev => [...prev, newOrg]);
    setUsers(prev => [...prev, newUser]);
    return { org: newOrg, user: newUser };
  }

  async function refreshMonitor() {
    const mon = await dbFetchMonitor();
    setMonitor(mon);
  }

  async function updateOrganization(id, patch) {
    await dbUpdateOrganization(id, patch);
    const orgsData = await dbFetchOrganizations();
    setOrgs(orgsData);
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--bg)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16}}>
          <div style={{
            width:36, height:36,
            border:'3px solid var(--line)',
            borderTopColor:'var(--ink)',
            borderRadius:'50%',
            animation:'spin 0.7s linear infinite',
          }}/>
          <div style={{font:'500 14px var(--font-ui)', color:'var(--ink-2)'}}>טוען נתונים…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sessionOrg = session ? orgs.find(o => o.id === session.organization_id) : null;

  let main;
  if (!session) {
    main = <Login users={users} orgs={orgs} onLogin={login}/>;
  } else if (session.role === 'FIELD_USER') {
    main = <FieldShell user={session} org={sessionOrg} history={history}
                       onSubmit={submitReport} onLogout={logout}
                       mode={national} viewport={t.fieldView}/>;
  } else {
    main = <HQShell user={session} onLogout={logout}
                    mode={national}
                    onSetMode={(m) => { setNational(m); setTweak('national', m); }}
                    orgs={orgs} users={users}
                    monitor={monitor}
                    onRefreshMonitor={refreshMonitor}
                    onAddOrganization={addOrganization}
                    onUpdateOrganization={updateOrganization}/>;
  }

  return (
    <>
      {main}
      <TweaksPanel>
        <TweakSection label="חשבון" />
        <TweakRadio label="מצב לאומי" value={national}
                    options={[{value:'routine',label:'שגרה'},{value:'emergency',label:'חירום'}]}
                    onChange={(v) => { setNational(v); setTweak('national', v); }} />
        <TweakSection label="צד שטח (Field)" />
        <TweakRadio label="תצוגה" value={t.fieldView}
                    options={[{value:'phone',label:'מסגרת טלפון'},{value:'fullscreen',label:'PC / מלא־מסך'}]}
                    onChange={(v) => setTweak('fieldView', v)} />
        <TweakSection label="ערכת נושא" />
        <TweakRadio label="צפיפות" value={t.density}
                    options={[{value:'regular',label:'רגיל'},{value:'compact',label:'דחוס'}]}
                    onChange={(v) => setTweak('density', v)} />
        <TweakToggle label="מצב כהה" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakSection label="דמו" />
        {session && (
          <TweakButton onClick={logout}>יציאה ומעבר בין משתמשים</TweakButton>
        )}
      </TweaksPanel>
    </>
  );
}

function Login({ users, orgs, onLogin }) {
  const [id, setId]   = useState('');
  const [pw, setPw]   = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    setErr('');
    setBusy(true);
    const { user } = await dbLogin(id, pw);
    if (!user) {
      setBusy(false);
      return setErr('פרטי כניסה שגויים — בדוק תעודת זהות וסיסמה');
    }
    await onLogin(user);
    setBusy(false);
  }

  async function quickPick(user) {
    setBusy(true);
    await onLogin(user);
    setBusy(false);
  }

  const seedUsers = users.filter(u => u.id <= 22);

  return (
    <div className="login-stage">
      <div style={{width:'100%', maxWidth:880, display:'grid', gridTemplateColumns:'1.05fr 1fr', gap:32, alignItems:'center'}}>
        {/* Brand side */}
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <Crest subtitle="רשת לניהול חירום · MVP"/>
          <h1 style={{margin:0, font:'700 36px var(--font-ui)', letterSpacing:'-.01em', lineHeight:1.1}}>
            מערכת רחל
            <div style={{font:'400 18px var(--font-ui)', color:'var(--ink-2)', marginTop:6}}>
              דיווח מלאי ארצי · רשת אזרחית
            </div>
          </h1>
          <p style={{margin:0, font:'400 14px var(--font-ui)', color:'var(--ink-2)', maxWidth:420, lineHeight:1.55}}>
            צינור קלט רזה ומאובטח להזרמת נתוני מלאי ורכש מחברות הקצה ורשתות השיווק
            אל בריכת המידע המרכזית של מטה רח״ל.
          </p>

          <div style={{display:'flex', gap:8, marginTop:6}}>
            <span className="chip"><Icon name="shield" size={12}/> מידור הרמטי</span>
            <span className="chip"><Icon name="clock"  size={12}/> דיווח &lt; 60 שניות</span>
            <span className="chip"><Icon name="doc"    size={12}/> ייצוא קשיח ל-Excel</span>
          </div>

          <div className="hr" style={{margin:'18px 0 6px'}}/>
          <div style={{font:'600 11px var(--font-ui)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)'}}>
            כניסה מהירה
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {seedUsers.map(u => (
              <button key={u.id} className="persona" onClick={() => quickPick(u)} disabled={busy}>
                <div className="av">{u.full_name.split(' ').map(s=>s[0]).join('').slice(0,2)}</div>
                <div style={{flex:1}}>
                  <div style={{font:'600 14px var(--font-ui)'}}>{u.full_name}</div>
                  <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>{u.title}</div>
                </div>
                <span className="chip chip--accent" style={{fontSize:11}}>
                  {u.role === 'FIELD_USER' ? 'נציג שטח' : 'מטה רח״ל'}
                </span>
              </button>
            ))}
          </div>
          {users.length > seedUsers.length && (
            <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>
              + {users.length - seedUsers.length} משתמשים נוספים — כניסה רגילה בטופס משמאל.
            </div>
          )}
        </div>

        {/* Login form */}
        <form className="card" onSubmit={submit} style={{padding:28, display:'flex', flexDirection:'column', gap:16}}>
          <div>
            <h2 style={{margin:0, font:'600 20px var(--font-ui)'}}>כניסה למערכת</h2>
            <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)', marginTop:4}}>הזן תעודת זהות וסיסמה</div>
          </div>

          <div>
            <label className="label">מספר תעודת זהות</label>
            <div style={{position:'relative'}}>
              <Icon name="user" size={15} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
              <input className="input num-input" inputMode="numeric" maxLength={9}
                     value={id} onChange={e => setId(e.target.value.replace(/\D/g,''))}
                     placeholder="9 ספרות"
                     style={{paddingInlineStart:38}}/>
            </div>
          </div>

          <div>
            <label className="label">סיסמה</label>
            <div style={{position:'relative'}}>
              <Icon name="lock" size={15} style={{position:'absolute', insetInlineStart:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-3)'}}/>
              <input className="input" type="password"
                     value={pw} onChange={e => setPw(e.target.value)}
                     placeholder="••••"
                     style={{paddingInlineStart:38}}/>
            </div>
          </div>

          {err && <div style={{font:'500 13px var(--font-ui)', color:'var(--bad)', display:'flex', alignItems:'center', gap:6}}>
            <Icon name="alert" size={13}/> {err}
          </div>}

          <button type="submit" className="btn btn--lg" style={{justifyContent:'center'}} disabled={busy}>
            {busy ? 'מתחבר…' : 'כניסה'}
          </button>

          <div className="hr"/>
          <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', lineHeight:1.55}}>
            MVP — אימות פשוט (ת״ז + סיסמה), ללא MFA. המידור נאכף בשרת לפי <span className="mono">organization_id</span>.
          </div>
        </form>
      </div>
    </div>
  );
}
