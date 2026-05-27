import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchHistory, dbInsertReport, dbFetchNotifications,
  dbFetchAppSettings, dbSendEmail,
} from './data.js';
import { Icon, Crest, ModePill } from './components.jsx';
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
    Promise.all([dbFetchOrganizations(), dbFetchUsers(), dbFetchAppSettings()])
      .then(([orgsData, usersData, settings]) => {
        setOrgs(orgsData);
        setUsers(usersData);
        if (settings.national) setNational(settings.national);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      const settings = await dbFetchAppSettings();
      if (settings.national) setNational(settings.national);
    }, 30000);
    return () => clearInterval(id);
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
    if (session?.email) {
      const org = orgs.find(o => o.id === session.organization_id);
      const now = new Date().toLocaleString('he-IL', { dateStyle:'short', timeStyle:'short' });
      dbSendEmail({
        to: session.email,
        subject: '✓ הדיווח התקבל — מערכת רחל',
        html: `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"></head><body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#1a6b3a,#145530);padding:28px 32px">
    <div style="color:rgba(255,255,255,.7);font-size:13px;margin-bottom:6px">מערכת רחל — דיווח מלאי לאומי</div>
    <h1 style="color:white;margin:0;font-size:22px">✓ הדיווח התקבל בהצלחה</h1>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:16px;color:#333">שלום ${session.full_name},</p>
    <p style="font-size:15px;color:#555">הדיווח עבור <strong>${org?.name || ''}</strong> התקבל ונרשם במערכת.</p>
    <div style="background:#f0f7f0;border:1px solid #c3e6c3;border-radius:8px;padding:16px 20px;margin:20px 0">
      <table width="100%" style="border-collapse:collapse;font-size:14px">
        <tr><td style="color:#666;padding:4px 0">ארגון:</td><td style="font-weight:bold;text-align:left">${org?.name || ''}</td></tr>
        <tr><td style="color:#666;padding:4px 0">תאריך ושעה:</td><td style="font-weight:bold;text-align:left">${now}</td></tr>
        <tr><td style="color:#666;padding:4px 0">מספר פריטים:</td><td style="font-weight:bold;text-align:left">${payload.lines?.length || 0}</td></tr>
      </table>
    </div>
    <p style="font-size:14px;color:#777">תודה על הדיווח בזמן. הנתונים שלך מסייעים לתמונת המצב הלאומית.</p>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#aaa;font-size:12px">מערכת רחל — מטה החירום הלאומי</div>
  </div>
</div></body></html>`,
      }).catch(() => {});
    }
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
    <div className="phone-stage">
      <div className="phone">
        {/* Status bar */}
        <div className="phone-status">
          <span className="mono" style={{fontWeight:600}}>9:41</span>
          <span style={{display:'flex', gap:6, alignItems:'center', fontSize:12, color:'var(--ink-3)'}}>
            <span className="mono" style={{fontSize:11}}>LTE</span>
            <span style={{display:'inline-block', width:18, height:9, border:'1px solid currentColor', borderRadius:2, position:'relative'}}>
              <span style={{position:'absolute', inset:1, background:'currentColor', borderRadius:1, width:'72%'}}/>
            </span>
          </span>
        </div>

        <div className="phone-body" style={{display:'flex', flexDirection:'column', overflow:'auto', padding:'14px 22px 0'}}>
          {/* Header */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, paddingBottom:12, borderBottom:'1px solid var(--ink)'}}>
            <Crest subtitle="דיווח שטח"/>
            <ModePill mode="emergency"/>
          </div>

          {/* Hero */}
          <div style={{marginBottom:24}}>
            <div className="tag" style={{color:'var(--brand)'}}>01 · כניסה</div>
            <h1 style={{margin:'10px 0 4px', font:'800 30px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>שלום, נציג השטח</h1>
            <p style={{margin:0, font:'400 14px/1.4 var(--font-ui)', color:'var(--ink-3)'}}>
              דווח את מלאי הארגון. הנתונים נכנסים מיידית לתמונת המצב הלאומית.
            </p>
          </div>

          {/* Form */}
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
              <div style={{font:'500 13px var(--font-ui)', color:'var(--bad)', display:'flex', alignItems:'center', gap:7, padding:'10px 13px', background:'var(--bad-bg)', border:'1px solid var(--bad-line)', borderRadius:'var(--r-1)'}}>
                <Icon name="alert" size={13}/> {err}
              </div>
            )}
            <button type="submit" disabled={busy} className="btn btn--brand btn--lg"
              style={{width:'100%', justifyContent:'space-between', marginTop:4, opacity: busy ? .6 : 1}}>
              <span>{busy ? 'מתחבר…' : 'כניסה לדיווח'}</span>
              {!busy && <Icon name="arrow-l" size={16}/>}
            </button>
          </form>

          <div style={{marginTop:20, paddingTop:14, borderTop:'1px solid var(--hairline)', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase'}}>HQ_USER?</span>
            <a href="/hq.html" style={{font:'600 12px var(--font-ui)', color:'var(--brand)', textDecoration:'none'}}>לחמ״ל המרכזי ←</a>
          </div>
        </div>

        {/* Home indicator */}
        <div style={{display:'flex', justifyContent:'center', padding:'8px 0 10px', flexShrink:0}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}
