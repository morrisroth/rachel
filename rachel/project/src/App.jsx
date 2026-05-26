import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchHistory, dbInsertReport, dbFetchNotifications,
} from './data.js';
import { Icon, Crest } from './components.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakButton } from './tweaks-panel.jsx';
import { FieldShell } from './field.jsx';

const TWEAK_DEFAULTS = {
  fieldView:  'phone',
  national:   'emergency',
  density:    'regular',
  dark:       false,
  showTweaks: true,
};

export function App() {
  const [t, setTweak]         = useTweaks(TWEAK_DEFAULTS);
  const [session, setSession]  = useState(null);
  const [orgs,    setOrgs]     = useState([]);
  const [users,   setUsers]    = useState([]);
  const [history, setHistory]        = useState([]);
  const [notifications, setNotifications] = useState([]);
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
    const [hist, notifs] = await Promise.all([
      dbFetchHistory(user.organization_id),
      dbFetchNotifications(user.organization_id),
    ]);
    setHistory(hist);
    setNotifications(notifs);
    setSession(user);
  }

  function logout() {
    setSession(null);
    setHistory([]);
    setNotifications([]);
  }

  async function submitReport(payload) {
    await dbInsertReport(payload);
    const hist = await dbFetchHistory(payload.organization_id);
    setHistory(hist);
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--bg)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16}}>
          <div style={{width:36, height:36, border:'3px solid var(--line)', borderTopColor:'var(--ink)', borderRadius:'50%', animation:'spin 0.7s linear infinite'}}/>
          <div style={{font:'500 14px var(--font-ui)', color:'var(--ink-2)'}}>טוען נתונים…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sessionOrg = session ? orgs.find(o => o.id === session.organization_id) : null;

  if (!session) {
    return <FieldLogin users={users} onLogin={login}/>;
  }

  return (
    <>
      <FieldShell user={session} org={sessionOrg} history={history}
                  notifications={notifications}
                  onSubmit={submitReport} onLogout={logout}
                  mode={national} viewport={t.fieldView}/>
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
        <TweakButton onClick={logout}>יציאה ומעבר בין משתמשים</TweakButton>
      </TweaksPanel>
    </>
  );
}

// ── Field user login page ────────────────────────────────────────────────────

function FieldLogin({ users, onLogin }) {
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
    if (user.role !== 'FIELD_USER') { setBusy(false); return setErr('גישה נדחתה — דף זה מיועד לנציגי שטח בלבד. אנשי מטה? עברו לחמ״ל.'); }
    await onLogin(user);
    setBusy(false);
  }

  async function quickPick(u) { setBusy(true); await onLogin(u); setBusy(false); }

  const fieldUsers = users.filter(u => u.role === 'FIELD_USER' && u.id <= 22);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px',
      background: `
        radial-gradient(ellipse 120% 50% at 50% -5%, oklch(92% 0.035 250 / .25), transparent 55%),
        radial-gradient(ellipse 80% 40% at 10% 100%, oklch(94% 0.025 150 / .15), transparent 55%),
        oklch(98% 0.008 80)`,
    }}>
      {/* Brand */}
      <div style={{marginBottom:28, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
        <Crest subtitle="רחל · מערכת דיווח שטח"/>
      </div>

      {/* Card */}
      <div style={{width:'100%', maxWidth:400, borderRadius:22, overflow:'hidden', boxShadow:'0 4px 6px oklch(0% 0 0 / .04), 0 20px 60px oklch(0% 0 0 / .10)', border:'1px solid var(--line)'}}>

        {/* Top strip */}
        <div style={{background:'linear-gradient(135deg, oklch(52% 0.16 250), oklch(44% 0.14 260))', padding:'24px 26px', display:'flex', alignItems:'center', gap:16}}>
          <div style={{width:50, height:50, borderRadius:14, background:'oklch(100% 0 0 / .18)', display:'grid', placeItems:'center', flexShrink:0}}>
            <Icon name="home" size={23} stroke={1.8} style={{color:'white'}}/>
          </div>
          <div>
            <div style={{font:'700 20px var(--font-ui)', color:'white'}}>ברוכים הבאים, נציגי השטח</div>
            <div style={{font:'400 13px var(--font-ui)', color:'oklch(100% 0 0 / .72)', marginTop:2}}>
              מלאו את דיווח המלאי היומי עבור הארגון שלכם
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
              style={{appearance:'none', border:0, cursor:'pointer', background:'linear-gradient(135deg, oklch(52% 0.16 250), oklch(44% 0.14 260))', color:'white', padding:'13px', borderRadius:11, font:'600 15px var(--font-ui)', marginTop:2, transition:'opacity .1s', opacity: busy ? .6 : 1}}>
              {busy ? 'מתחבר…' : 'כניסה לדיווח'}
            </button>
          </form>

          {/* Quick pick */}
          {fieldUsers.length > 0 && (
            <>
              <div style={{margin:'0 26px', height:1, background:'var(--line)'}}/>
              <div style={{padding:'16px 26px 24px', display:'flex', flexDirection:'column', gap:9}}>
                <div style={{font:'600 10px var(--font-ui)', letterSpacing:'.09em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:2}}>
                  כניסה מהירה — דמו
                </div>
                {fieldUsers.map(u => (
                  <button key={u.id} onClick={() => quickPick(u)} disabled={busy}
                    style={{appearance:'none', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:11, padding:'11px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'right', width:'100%', font:'inherit', transition:'all .12s'}}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-bg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.background='var(--bg)'; }}>
                    <div style={{width:36, height:36, borderRadius:9, background:'var(--bg-2)', border:'1px solid var(--line)', display:'grid', placeItems:'center', font:'700 13px var(--font-mono)', color:'var(--ink-2)', flexShrink:0}}>
                      {u.full_name.split(' ').map(s=>s[0]).join('').slice(0,2)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{font:'600 14px var(--font-ui)', color:'var(--ink)'}}>{u.full_name}</div>
                      <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)'}}>{u.title}</div>
                    </div>
                    <Icon name="arrow-l" size={14} style={{color:'var(--ink-3)', flexShrink:0}}/>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{marginTop:22, font:'400 12px var(--font-ui)', color:'var(--ink-3)'}}>
        אנשי מטה?{' '}
        <a href="/hq.html" style={{color:'var(--accent)', textDecoration:'none', fontWeight:500}}>כניסה לחמ״ל ←</a>
      </div>
    </div>
  );
}
