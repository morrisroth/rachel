// Main app — login + routing + tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fieldView": "fullscreen",
  "national": "emergency",
  "density": "regular",
  "dark": false,
  "showTweaks": true
}/*EDITMODE-END*/;

const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [session, setSession] = useStateA(null);
  const [orgs,  setOrgs]  = useStateA(ORGANIZATIONS);
  const [users, setUsers] = useStateA(USERS);
  const [history, setHistory] = useStateA(() => sampleHistory());
  const [national, setNational] = useStateA(t.national);

  useEffectA(() => setNational(t.national), [t.national]);
  useEffectA(() => {
    document.body.classList.toggle('density-compact', t.density === 'compact');
    document.body.classList.toggle('dark', !!t.dark);
  }, [t.density, t.dark]);

  function login(user) { setSession(user); }
  function logout() { setSession(null); }

  function submitReport(payload) {
    setHistory(prev => [{
      id: Date.now(),
      reported_at: payload.reported_at,
      lines: payload.lines.map(l => ({
        product_id: l.product?.kind === 'catalog' ? l.product.product_id : null,
        free_text_product_name: l.product?.kind === 'free' ? l.product.name : null,
        category_id: l.category_id,
        current_stock: Number(l.current_stock) || 0,
        incoming_stock: Number(l.incoming_stock) || 0,
        incoming_status: l.incoming_status,
        quality_status: l.quality_status,
        expected_arrival_date: l.expected_arrival_date,
        notes: l.notes,
      })),
    }, ...prev]);
  }

  // Add a new organization + its primary field user, atomically.
  function addOrganization({ org, user }) {
    const nextOrgId  = Math.max(...orgs.map(o => o.id)) + 1;
    const nextUserId = Math.max(...users.map(u => u.id)) + 1;
    const newOrg = { ...org, id: nextOrgId, active: true };
    const newUser = { ...user, id: nextUserId, organization_id: nextOrgId, role: 'FIELD_USER' };
    setOrgs(prev => [...prev, newOrg]);
    setUsers(prev => [...prev, newUser]);
    return { org: newOrg, user: newUser };
  }

  function updateOrganization(id, patch) {
    setOrgs(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
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

// ─────────────────────────────────────────────────────────────────────────────
// Login screen — id_number + password, with quick-pick persona cards
// ─────────────────────────────────────────────────────────────────────────────

function Login({ users, orgs, onLogin }) {
  const [id, setId] = useStateA('');
  const [pw, setPw] = useStateA('');
  const [err, setErr] = useStateA('');

  function submit(e) {
    e?.preventDefault();
    setErr('');
    const u = users.find(u => u.id_number === id && u.password === pw);
    if (!u) return setErr('פרטי כניסה שגויים — בדוק תעודת זהות וסיסמה');
    onLogin(u);
  }

  function quickPick(user) {
    setId(user.id_number);
    setPw(user.password);
    setTimeout(() => onLogin(user), 120);
  }

  // Show only the seed personas at the top; newly created users still log in via form.
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
            כניסה מהירה לדמו
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {seedUsers.map(u => (
              <button key={u.id} className="persona" onClick={() => quickPick(u)}>
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
              + {users.length - seedUsers.length} משתמשים נוספים שנוצרו בניהול הארגונים — כניסה רגילה בטופס משמאל.
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

          <button type="submit" className="btn btn--lg" style={{justifyContent:'center'}}>כניסה</button>

          <div className="hr"/>
          <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', lineHeight:1.55}}>
            MVP — אימות פשוט (ת״ז + סיסמה), ללא MFA. המידור נאכף בשרת לפי <span className="mono">organization_id</span> מהפעלת ההפעלה.
            כל ניסיון העברת מזהה ארגון בקלט נחסם.
          </div>
        </form>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
