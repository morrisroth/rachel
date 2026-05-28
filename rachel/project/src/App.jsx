import { useState, useEffect } from 'react';
import {
  dbFetchOrganizations, dbFetchUsers, dbLogin,
  dbFetchHistory, dbInsertReport, dbFetchNotifications,
  dbFetchAppSettings, dbSendEmail, PRODUCTS, CATEGORIES,
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

      const lineRows = (payload.lines || []).map((line, i) => {
        const prodName = line.product?.kind === 'free'
          ? line.product.name
          : PRODUCTS.find(p => p.id === line.product?.product_id)?.name || '—';
        const cat = CATEGORIES.find(c => c.id === (line.category_id || PRODUCTS.find(p => p.id === line.product?.product_id)?.category_id));
        const unit = line.unit || '';
        const qColor = line.quality_status === 'תקין' ? '#1a6b3a' : line.quality_status === 'בלאי' ? '#b45309' : '#b91c1c';
        return `
          <tr style="background:${i % 2 === 0 ? '#fafaf9' : '#ffffff'}">
            <td style="padding:10px 14px;font-weight:600;color:#1a1a1a">${prodName}</td>
            <td style="padding:10px 14px;color:#555;font-size:12px">${cat?.name || '—'}</td>
            <td style="padding:10px 14px;font-weight:700;font-family:monospace;color:#1a1a1a;text-align:center">${line.current_stock} ${unit}</td>
            <td style="padding:10px 14px;font-family:monospace;color:#555;text-align:center">${line.incoming_stock || '0'} ${unit}</td>
            <td style="padding:10px 14px;font-size:12px;color:#555">${line.incoming_status || '—'}</td>
            <td style="padding:10px 14px;font-size:12px;font-weight:600;color:${qColor}">${line.quality_status || '—'}</td>
            ${line.notes ? `<td style="padding:10px 14px;font-size:12px;color:#777;font-style:italic">${line.notes}</td>` : '<td style="padding:10px 14px;color:#ccc;font-size:12px">—</td>'}
          </tr>`;
      }).join('');

      dbSendEmail({
        to: session.email,
        subject: `✓ דיווח מלאי התקבל — ${org?.name || ''} — ${now}`,
        html: `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px 16px;background:#f0ede8;font-family:Arial,sans-serif;direction:rtl">
<div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d4cfc8;border-radius:4px;overflow:hidden">

  <div style="background:#1a1a16;padding:24px 28px;display:flex;align-items:center;justify-content:space-between">
    <div>
      <div style="color:rgba(255,255,255,.45);font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;font-family:monospace">מערכת רחל · דיווח מלאי לאומי</div>
      <div style="color:#ffffff;font-size:20px;font-weight:700">✓ הדיווח התקבל בהצלחה</div>
    </div>
    <div style="background:#1a6b3a;color:#ffffff;padding:6px 14px;border-radius:3px;font-size:11px;font-weight:700;font-family:monospace;letter-spacing:.08em;white-space:nowrap">אושר</div>
  </div>

  <div style="padding:24px 28px;border-bottom:1px solid #e8e4de">
    <p style="margin:0 0 4px;font-size:15px;color:#1a1a1a">שלום <strong>${session.full_name}</strong>,</p>
    <p style="margin:0;font-size:14px;color:#666">דיווח המלאי שלך עבור <strong>${org?.name || ''}</strong> נרשם בהצלחה במערכת.</p>
  </div>

  <div style="padding:16px 28px;background:#f9f7f4;border-bottom:1px solid #e8e4de;display:flex;gap:32px;flex-wrap:wrap">
    <div><div style="font-size:10px;color:#999;letter-spacing:.1em;text-transform:uppercase;font-family:monospace;margin-bottom:3px">תאריך ושעה</div><div style="font-size:14px;font-weight:600;color:#1a1a1a">${now}</div></div>
    <div><div style="font-size:10px;color:#999;letter-spacing:.1em;text-transform:uppercase;font-family:monospace;margin-bottom:3px">ארגון</div><div style="font-size:14px;font-weight:600;color:#1a1a1a">${org?.name || '—'}</div></div>
    <div><div style="font-size:10px;color:#999;letter-spacing:.1em;text-transform:uppercase;font-family:monospace;margin-bottom:3px">פריטים</div><div style="font-size:14px;font-weight:600;color:#1a1a1a">${payload.lines?.length || 0}</div></div>
  </div>

  <div style="padding:20px 28px">
    <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#999;font-family:monospace;margin-bottom:12px">פירוט מלאי שדווח</div>
    <table width="100%" style="border-collapse:collapse;font-size:13px;border:1px solid #e8e4de;border-radius:4px;overflow:hidden">
      <thead>
        <tr style="background:#f0ede8">
          <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">מוצר</th>
          <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">משרד</th>
          <th style="padding:9px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">מלאי נוכחי</th>
          <th style="padding:9px 14px;text-align:center;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">בדרך</th>
          <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">סטטוס אספקה</th>
          <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">איכות</th>
          <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.1em;color:#888;font-family:monospace;border-bottom:1px solid #e8e4de">הערות</th>
        </tr>
      </thead>
      <tbody>${lineRows}</tbody>
    </table>
  </div>

  <div style="padding:16px 28px;border-top:1px solid #e8e4de;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:11px;color:#aaa;font-family:monospace;letter-spacing:.06em">מערכת רחל · מטה החירום הלאומי</span>
    <span style="font-size:11px;color:#aaa">אין להשיב למייל זה</span>
  </div>
</div>
</body></html>`,
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
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 640);

  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

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

  const formBody = (
    <>
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
    </>
  );

  if (isDesktop) {
    return (
      <div style={{minHeight:'100dvh', display:'flex', flexDirection:'column', background:'var(--paper)', backgroundImage:'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)', backgroundSize:'48px 48px'}}>
        <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:56, borderBottom:'1px solid var(--ink)', background:'var(--paper)', flexShrink:0}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <img src="/mod-logo.jpg" alt="MOD Logo" style={{width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'1px solid var(--line)', flexShrink:0}}/>
            <Crest subtitle="דיווח שטח"/>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <ModePill mode="emergency"/>
            <a href="/hq.html" style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', textDecoration:'none', letterSpacing:'.08em', textTransform:'uppercase'}}>HQ →</a>
          </div>
        </header>
        <div style={{flex:1, display:'grid', placeItems:'center', padding:'48px 24px'}}>
          <div style={{width:'100%', maxWidth:420}}>
            <div style={{marginBottom:28}}>
              <div className="tag" style={{color:'var(--brand)', marginBottom:8}}>01 · כניסה</div>
              <h1 style={{margin:'0 0 6px', font:'800 38px/1.05 var(--font-ui)', letterSpacing:'-.025em'}}>שלום, נציג השטח</h1>
              <p style={{margin:0, font:'400 14px/1.5 var(--font-ui)', color:'var(--ink-3)'}}>
                דווח את מלאי הארגון. הנתונים נכנסים מיידית לתמונת המצב הלאומית.
              </p>
            </div>
            <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:14}}>
              {formBody}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-stage">
      <div className="phone">
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
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, paddingBottom:12, borderBottom:'1px solid var(--ink)'}}>
            <Crest subtitle="דיווח שטח"/>
            <ModePill mode="emergency"/>
          </div>
          <div style={{marginBottom:24}}>
            <div className="tag" style={{color:'var(--brand)'}}>01 · כניסה</div>
            <h1 style={{margin:'10px 0 4px', font:'800 30px/1.05 var(--font-ui)', letterSpacing:'-.02em'}}>שלום, נציג השטח</h1>
            <p style={{margin:0, font:'400 14px/1.4 var(--font-ui)', color:'var(--ink-3)'}}>
              דווח את מלאי הארגון. הנתונים נכנסים מיידית לתמונת המצב הלאומית.
            </p>
          </div>
          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:14}}>
            {formBody}
          </form>
          <div style={{marginTop:20, paddingTop:14, borderTop:'1px solid var(--hairline)', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <span style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase'}}>HQ_USER?</span>
            <a href="/hq.html" style={{font:'600 12px var(--font-ui)', color:'var(--brand)', textDecoration:'none'}}>לחמ״ל המרכזי ←</a>
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'center', padding:'8px 0 10px', flexShrink:0}}>
          <div style={{width:120, height:4, background:'var(--ink)', borderRadius:2}}/>
        </div>
      </div>
    </div>
  );
}
