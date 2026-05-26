// HQ "ניהול ארגונים" — list, add, edit organizations + their primary field user.

const { useState: useStateO, useMemo: useMemoO } = React;

function OrgsView({ orgs, users, onAdd, onUpdate }) {
  const [drawer, setDrawer] = useStateO(null); // null | 'add' | { editId }
  const [search, setSearch] = useStateO('');
  const [filterCat, setFilterCat] = useStateO('all');

  const enrichedOrgs = useMemoO(() => {
    return orgs
      .filter(o => o.cat_id !== null) // hide HQ "מטה רח״ל"
      .map(o => {
        const owner = users.find(u => u.organization_id === o.id && u.role === 'FIELD_USER');
        const cat = CATEGORIES.find(c => c.id === o.cat_id);
        return { ...o, owner, cat };
      });
  }, [orgs, users]);

  const filtered = enrichedOrgs.filter(o => {
    if (filterCat !== 'all' && o.cat_id !== filterCat) return false;
    if (search && !o.name.includes(search) && !(o.owner?.full_name || '').includes(search)) return false;
    return true;
  });

  return (
    <div style={{display:'flex', flexDirection:'column', gap:22}}>
      <PageHeader
        title="ניהול ארגונים"
        sub="הוספה, עריכה והשבתה של ארגונים מדווחים. כאן וויקי מגדירה גם איזה משתמש שטח שייך לארגון ואיזה מוצרים הוא מחויב לדווח עליהם."
        right={
          <button className="btn btn--accent" onClick={() => setDrawer('add')}>
            <Icon name="plus" size={16}/> הוסף ארגון
          </button>
        }
      />

      <div className="hq-kpis">
        <Kpi label="סה״כ ארגונים"      value={enrichedOrgs.length}/>
        <Kpi label="פעילים מחויבי דיווח" value={enrichedOrgs.filter(o => o.active).length} accent="ok"/>
        <Kpi label="לא פעילים"           value={enrichedOrgs.filter(o => !o.active).length} accent={enrichedOrgs.some(o => !o.active) ? 'bad' : 'ok'}/>
        <Kpi label="ממוצע מוצרים מקושרים" value={Math.round(enrichedOrgs.reduce((a,o) => a + (o.linked_products?.length || 0), 0) / Math.max(1, enrichedOrgs.length))}/>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'10px 14px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--line)', flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, flex:'1 1 200px', minWidth:200}}>
            <Icon name="search" size={14}/>
            <input className="input" placeholder="חיפוש לפי ארגון או איש קשר…" value={search} onChange={e => setSearch(e.target.value)}
                   style={{border:0, padding:'4px 0', boxShadow:'none', fontSize:14, background:'transparent'}}/>
          </div>
          <select className="select" value={filterCat} onChange={e => setFilterCat(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  style={{width:'auto', flex:'0 0 auto'}}>
            <option value="all">כל המשרדים</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:40}}>#</th>
              <th>שם ארגון</th>
              <th>סוג</th>
              <th>משרד</th>
              <th>איש קשר ראשי</th>
              <th>ת״ז להתחברות</th>
              <th>מוצרים מקושרים</th>
              <th>סטטוס</th>
              <th style={{width:110}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o.id}>
                <td className="num" style={{color:'var(--ink-3)'}}>{String(i+1).padStart(2,'0')}</td>
                <td style={{fontWeight:500}}>{o.name}</td>
                <td style={{color:'var(--ink-2)'}}>{o.type}</td>
                <td>{o.cat ? <span className="chip" style={{fontSize:11}}>{o.cat.short}</span> : '—'}</td>
                <td>{o.owner?.full_name || <span style={{color:'var(--ink-3)'}}>— ללא משתמש —</span>}</td>
                <td><span className="mono" style={{fontSize:13}}>{o.owner?.id_number || '—'}</span></td>
                <td>
                  <span className="num" style={{color:'var(--ink)'}}>{o.linked_products?.length || 0}</span>
                  <span style={{color:'var(--ink-3)', marginInlineStart:6, fontSize:12}}>מוצרים</span>
                </td>
                <td>
                  {o.active
                    ? <span className="chip chip--ok"><span className="dot"/> פעיל</span>
                    : <span className="chip chip--bad"><span className="dot"/> כבוי</span>}
                </td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => setDrawer({ editId: o.id })}>פתח</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{textAlign:'center', padding:'30px 0', color:'var(--ink-3)'}}>
                אין ארגונים תואמים. <button className="btn btn--ghost btn--sm" onClick={() => setDrawer('add')} style={{marginInlineStart:8}}><Icon name="plus" size={12}/> הוסף ארגון חדש</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {drawer === 'add' && (
        <OrgDrawer title="הוספת ארגון חדש" onClose={() => setDrawer(null)}
          onSubmit={(payload) => { onAdd(payload); setDrawer(null); }} />
      )}
      {drawer && drawer.editId && (
        <OrgDrawer title="עריכת ארגון" editing
          org={orgs.find(o => o.id === drawer.editId)}
          owner={users.find(u => u.organization_id === drawer.editId && u.role === 'FIELD_USER')}
          onClose={() => setDrawer(null)}
          onSubmit={({ org }) => { onUpdate(drawer.editId, org); setDrawer(null); }}
          onToggleActive={() => {
            const cur = orgs.find(o => o.id === drawer.editId);
            onUpdate(drawer.editId, { active: !cur.active });
            setDrawer(null);
          }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawer / modal — add or edit organization
// ─────────────────────────────────────────────────────────────────────────────

function OrgDrawer({ title, org, owner, editing = false, onClose, onSubmit, onToggleActive }) {
  const [name, setName]   = useStateO(org?.name || '');
  const [type, setType]   = useStateO(org?.type || ORG_TYPES[0]);
  const [catId, setCatId] = useStateO(org?.cat_id || CATEGORIES[0].id);

  const [contactName, setContactName] = useStateO(owner?.full_name || '');
  const [idNumber, setIdNumber]       = useStateO(owner?.id_number || '');
  const [phone, setPhone]             = useStateO(owner?.phone || '');
  const [password, setPassword]       = useStateO(owner?.password || '');
  const [contactTitle, setContactTitle] = useStateO(owner?.title || '');

  const [linkedIds, setLinkedIds] = useStateO(org?.linked_products || []);
  const [productSearch, setProductSearch] = useStateO('');

  const [errors, setErrors] = useStateO({});

  function toggleProduct(pid) {
    setLinkedIds(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]);
  }

  function selectCategoryProducts(cid) {
    const ids = PRODUCTS.filter(p => p.category_id === cid).map(p => p.id);
    setLinkedIds(prev => Array.from(new Set([...prev, ...ids])));
  }

  function deselectCategoryProducts(cid) {
    const ids = PRODUCTS.filter(p => p.category_id === cid).map(p => p.id);
    setLinkedIds(prev => prev.filter(x => !ids.includes(x)));
  }

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'חובה';
    if (!editing) {
      if (!contactName.trim()) e.contactName = 'חובה';
      if (!/^\d{9}$/.test(idNumber)) e.idNumber = 'ת״ז חייב להיות 9 ספרות';
      if (!password.trim() || password.length < 4) e.password = 'סיסמה חייבת להיות לפחות 4 תווים';
    }
    if (linkedIds.length === 0) e.linked = 'יש לבחור לפחות מוצר אחד';
    return e;
  }

  function submit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (editing) {
      onSubmit({ org: { name: name.trim(), type, cat_id: catId, linked_products: linkedIds } });
    } else {
      onSubmit({
        org: { name: name.trim(), type, cat_id: catId, linked_products: linkedIds },
        user: { full_name: contactName.trim(), id_number: idNumber, phone, password, title: contactTitle.trim() || `נציג שטח — ${name.trim()}`, active: true },
      });
    }
  }

  const filteredProducts = PRODUCTS.filter(p =>
    !productSearch || p.name.includes(productSearch));

  const productsByCat = CATEGORIES.map(c => ({
    cat: c,
    products: filteredProducts.filter(p => p.category_id === c.id),
  }));

  return (
    <div className="drawer-scrim" onClick={(e) => { if (e.target.classList.contains('drawer-scrim')) onClose(); }}>
      <div className="drawer anim-in" role="dialog" aria-label={title}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--line)'}}>
          <div>
            <div style={{font:'600 11px var(--font-ui)', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)'}}>
              {editing ? 'עריכת ארגון' : 'ארגון חדש'}
            </div>
            <h2 style={{margin:'4px 0 0', font:'600 20px var(--font-ui)'}}>{title}</h2>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Section 1: org details */}
          <FormSection num="01" title="פרטי הארגון" hint="המידע הזה יופיע במסכי המטה ובכותרת מסך הדיווח של נציג השטח.">
            <FormGrid>
              <Field label="שם הארגון" error={errors.name}>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="לדוגמה: רשת שיווק צפון"/>
              </Field>
              <Field label="סוג ארגון">
                <select className="select" value={type} onChange={e => setType(e.target.value)}>
                  {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="משרד ממשלתי משויך" full>
                <select className="select" value={catId} onChange={e => setCatId(Number(e.target.value))}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <FieldHint>קובע למחיצה איזה משרד יקבל את נתוני הארגון בקובץ הייצוא של מטה רח״ל.</FieldHint>
              </Field>
            </FormGrid>
          </FormSection>

          {/* Section 2: primary user */}
          {!editing && (
            <FormSection num="02" title="משתמש שטח ראשי" hint="פרטי ההתחברות שיינתנו לבעל החנות / קצין הלוגיסטיקה. אימות פשוט (ת״ז + סיסמה) — ללא MFA, לפי מגבלת ה-MVP.">
              <FormGrid>
                <Field label="שם מלא" error={errors.contactName}>
                  <input className="input" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="ישראל ישראלי"/>
                </Field>
                <Field label="תפקיד">
                  <input className="input" value={contactTitle} onChange={e => setContactTitle(e.target.value)} placeholder="מנהל לוגיסטיקה"/>
                </Field>
                <Field label="מספר תעודת זהות (משמש כשם משתמש)" error={errors.idNumber}>
                  <input className="input num-input" inputMode="numeric" maxLength={9}
                         value={idNumber} onChange={e => setIdNumber(e.target.value.replace(/\D/g,''))}
                         placeholder="9 ספרות"/>
                </Field>
                <Field label="טלפון נייד">
                  <input className="input num-input" inputMode="tel" value={phone}
                         onChange={e => setPhone(e.target.value)} placeholder="050-1234567"/>
                </Field>
                <Field label="סיסמה ראשונית" error={errors.password} full>
                  <input className="input" type="text" value={password}
                         onChange={e => setPassword(e.target.value)} placeholder="לפחות 4 תווים"/>
                  <FieldHint>הסיסמה תועבר ידנית לבעל החנות. ה-MVP אינו תומך באיפוס עצמי או אימות דו־שלבי.</FieldHint>
                </Field>
              </FormGrid>
            </FormSection>
          )}

          {/* Section 3: linked products */}
          <FormSection num={editing ? '02' : '03'} title="קטלוג מוצרים מקושר" hint="בחר אילו מוצרים מתוך הקטלוג הארצי הארגון מחויב לדווח עליהם. מסך הדיווח של נציג השטח ייפתח עם השורות הללו כברירת מחדל.">
            <div className="card" style={{padding:0, overflow:'hidden', borderRadius:6}}>
              <div style={{padding:'10px 14px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12, background:'var(--bg-2)'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, flex:1}}>
                  <Icon name="search" size={14}/>
                  <input className="input" placeholder="חיפוש מוצר…" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                         style={{border:0, padding:'2px 0', boxShadow:'none', background:'transparent', fontSize:13}}/>
                </div>
                <span className="chip chip--accent" style={{fontSize:11}}>
                  {linkedIds.length} מקושרים
                </span>
              </div>
              <div style={{maxHeight:300, overflow:'auto'}}>
                {productsByCat.map(({ cat, products }) => {
                  if (products.length === 0) return null;
                  const linkedInCat = products.filter(p => linkedIds.includes(p.id)).length;
                  const allLinked = linkedInCat === products.length;
                  return (
                    <div key={cat.id}>
                      <div style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'8px 14px', background:'var(--bg)', borderBottom:'1px solid var(--line)',
                        position:'sticky', top:0,
                      }}>
                        <div style={{font:'600 11px var(--font-ui)', letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink-3)'}}>
                          {cat.name} · <span style={{color:'var(--ink-2)'}}>{linkedInCat}/{products.length}</span>
                        </div>
                        <button className="btn btn--ghost btn--sm" style={{padding:'4px 8px', fontSize:11}}
                                onClick={() => allLinked ? deselectCategoryProducts(cat.id) : selectCategoryProducts(cat.id)}>
                          {allLinked ? 'הסר הכל' : 'בחר הכל'}
                        </button>
                      </div>
                      {products.map(p => {
                        const on = linkedIds.includes(p.id);
                        return (
                          <label key={p.id} style={{
                            display:'flex', alignItems:'center', gap:10,
                            padding:'9px 14px', cursor:'pointer',
                            borderBottom:'1px solid var(--line)',
                            background: on ? 'var(--accent-bg)' : 'transparent',
                          }}>
                            <input type="checkbox" checked={on} onChange={() => toggleProduct(p.id)}
                                   style={{width:16, height:16, accentColor:'var(--accent)'}}/>
                            <span style={{flex:1, font:'500 14px var(--font-ui)'}}>{p.name}</span>
                            <span className="mono" style={{font:'500 12px var(--font-mono)', color:'var(--ink-3)'}}>{p.unit}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            {errors.linked && <ErrorLine text={errors.linked}/>}
          </FormSection>
        </div>

        {/* Footer */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          gap:12, padding:'14px 24px', borderTop:'1px solid var(--line)',
          background:'var(--surface)',
        }}>
          {editing && onToggleActive ? (
            <button className="btn btn--ghost" onClick={onToggleActive}>
              {org?.active ? 'השבת ארגון' : 'הפעל מחדש'}
            </button>
          ) : <span/>}
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn--ghost" onClick={onClose}>ביטול</button>
            <button className="btn btn--accent" onClick={submit}>
              {editing ? 'שמור שינויים' : 'צור ארגון ומשתמש'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form atoms
// ─────────────────────────────────────────────────────────────────────────────

function FormSection({ num, title, hint, children }) {
  return (
    <section style={{display:'flex', flexDirection:'column', gap:14, paddingBlock:'18px 22px', borderBottom:'1px dashed var(--line)'}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
        <span className="mono" style={{
          flex:'0 0 auto',
          font:'600 11px var(--font-mono)', color:'var(--ink-3)',
          letterSpacing:'.08em', paddingTop:3,
        }}>{num}</span>
        <div style={{flex:1}}>
          <div style={{font:'600 15px var(--font-ui)'}}>{title}</div>
          {hint && <div style={{font:'400 12px var(--font-ui)', color:'var(--ink-3)', marginTop:4, lineHeight:1.55, maxWidth:680}}>{hint}</div>}
        </div>
      </div>
      <div style={{paddingInlineStart:30}}>{children}</div>
    </section>
  );
}

function FormGrid({ children }) {
  return <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>{children}</div>;
}

function Field({ label, children, error, full }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto', display:'flex', flexDirection:'column'}}>
      <label className="label">{label}</label>
      {children}
      {error && <ErrorLine text={error}/>}
    </div>
  );
}

function FieldHint({ children }) {
  return <div style={{font:'400 11px var(--font-ui)', color:'var(--ink-3)', marginTop:6, lineHeight:1.5}}>{children}</div>;
}

function ErrorLine({ text }) {
  return <div style={{font:'500 12px var(--font-ui)', color:'var(--bad)', marginTop:6, display:'flex', alignItems:'center', gap:5}}><Icon name="alert" size={12}/> {text}</div>;
}

Object.assign(window, { OrgsView });
