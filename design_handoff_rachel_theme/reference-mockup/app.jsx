// Mounts every screen into a DesignCanvas so the user can see
// the unified theme applied across every surface at once.

const { DesignCanvas, DCSection, DCArtboard } = window;

function App() {
  return (
    <DesignCanvas
      title="רחל · Unified Redesign"
      subtitle="One operational theme — applied identically across login, field, and HQ surfaces. Click any artboard to focus, drag to reorder."
    >
      <DCSection id="theme" title="The system" subtitle="One palette, one type pair, one set of motifs — repeated on every screen.">
        <DCArtboard id="theme-card" label="System · tokens" width={760} height={600}>
          <ThemeReference/>
        </DCArtboard>
      </DCSection>

      <DCSection id="login" title="01 · Login surfaces" subtitle="Field (mobile) and HQ (desktop). Same crest, same accent, same tag pattern.">
        <DCArtboard id="field-login" label="Field login · mobile" width={460} height={840}>
          <ScreenFieldLogin/>
        </DCArtboard>
        <DCArtboard id="hq-login" label="HQ login · desktop" width={1280} height={800}>
          <ScreenHQLogin/>
        </DCArtboard>
      </DCSection>

      <DCSection id="hq" title="02 · HQ command surfaces" subtitle="Dashboard, organizations management, add-org drawer, and export modal.">
        <DCArtboard id="hq-dashboard" label="HQ dashboard · overview" width={1280} height={920}>
          <ScreenHQDashboard/>
        </DCArtboard>
        <DCArtboard id="hq-orgs" label="HQ organizations · list" width={1280} height={920}>
          <ScreenHQOrgs/>
        </DCArtboard>
        <DCArtboard id="hq-drawer" label="HQ · add organization (drawer)" width={1280} height={920}>
          <ScreenHQDrawer/>
        </DCArtboard>
        <DCArtboard id="hq-export" label="HQ · export Excel (modal)" width={1280} height={920}>
          <ScreenHQExport/>
        </DCArtboard>
      </DCSection>

      <DCSection id="field" title="03 · Field surface" subtitle="Daily inventory entry, history, profile, and submit success state — all share the same theme.">
        <DCArtboard id="field-mobile" label="Field · daily report" width={460} height={840}>
          <ScreenFieldMobile/>
        </DCArtboard>
        <DCArtboard id="field-success" label="Field · report submitted" width={460} height={840}>
          <ScreenFieldSuccess/>
        </DCArtboard>
        <DCArtboard id="field-history" label="Field · history tab" width={460} height={840}>
          <ScreenFieldHistory/>
        </DCArtboard>
        <DCArtboard id="field-profile" label="Field · profile tab" width={460} height={840}>
          <ScreenFieldProfile/>
        </DCArtboard>
        <DCArtboard id="field-pc" label="Field · desktop variant" width={1280} height={920}>
          <ScreenFieldPC/>
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

// ── System reference card — shows the tokens themselves ─────────────────
function ThemeReference() {
  return (
    <div dir="rtl" style={{width:'100%', height:'100%', padding:'34px 40px', background:'var(--paper)', overflow:'auto', fontFamily:'var(--font-ui)'}}>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, marginBottom:6, paddingBottom:12, borderBottom:'1px solid var(--ink)'}}>
        <div style={{minWidth:0, flex:'1 1 auto'}}>
          <Tag color="var(--brand)">00 · DESIGN SYSTEM</Tag>
          <h1 style={{margin:'8px 0 4px', font:'800 28px/1 var(--font-ui)', letterSpacing:'-.025em'}}>Operational Command</h1>
          <div style={{font:'400 13px var(--font-ui)', color:'var(--ink-3)'}}>
            Unified theme for רחל — applied identically across every screen.
          </div>
        </div>
        <Stamp>SPEC · v 1.0</Stamp>
      </div>

      <hr className="ruler" style={{marginTop:6}}/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, marginTop:24}}>

        {/* PALETTE */}
        <div>
          <Tag>01 · COLOR</Tag>
          <h3 style={{margin:'6px 0 14px', font:'700 16px var(--font-ui)'}}>Palette</h3>
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {[
              ['Paper',     'var(--paper)',    'oklch(96% .010 80)', 'Default ground'],
              ['Ink',       'var(--ink)',      'oklch(20% .012 80)', 'Text · borders'],
              ['Brand',     'var(--brand)',    'oklch(38% .08 165)', 'Primary action · brand mark'],
              ['Status / OK',   'var(--ok)',   'oklch(48% .12 155)', 'On-time'],
              ['Status / WARN', 'var(--warn)', 'oklch(60% .14 65)',  'Delay'],
              ['Status / BAD',  'var(--bad)',  'oklch(52% .18 28)',  'Critical · emergency'],
            ].map(([name, c, val, role]) => (
              <div key={name} style={{display:'grid', gridTemplateColumns:'40px 1fr auto', alignItems:'center', gap:14, padding:'6px 0'}}>
                <div style={{width:40, height:32, background:c, border:'1px solid var(--line)', borderRadius:3}}/>
                <div>
                  <div style={{font:'600 13px var(--font-ui)'}}>{name}</div>
                  <div style={{font:'500 10.5px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em'}}>{val}</div>
                </div>
                <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', textAlign:'left'}}>{role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TYPE */}
        <div>
          <Tag>02 · TYPOGRAPHY</Tag>
          <h3 style={{margin:'6px 0 14px', font:'700 16px var(--font-ui)'}}>Type</h3>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div>
              <div style={{font:'800 32px/1 var(--font-ui)', letterSpacing:'-.025em'}}>Heebo · עברית</div>
              <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:4}}>
                Display · 300/400/500/600/700/800
              </div>
            </div>
            <div>
              <div className="mono" style={{font:'600 22px var(--font-mono)', letterSpacing:'-.01em'}}>JetBrains Mono · 0123456789</div>
              <div style={{font:'500 11px var(--font-mono)', color:'var(--ink-3)', letterSpacing:'.04em', marginTop:4}}>
                Numbers · timestamps · system tags
              </div>
            </div>
            <hr className="hr"/>
            <div>
              <div className="tag">TAG · 10PX MONO UPPER · .14 EM</div>
              <div style={{font:'700 11px var(--font-ui)', color:'var(--ink-3)', marginTop:6}}>LABEL · 10.5px mono upper · .14em</div>
              <div style={{marginTop:8, font:'400 14px var(--font-ui)'}}>Body · 14px Heebo regular</div>
              <div style={{font:'600 15px var(--font-ui)', marginTop:4}}>Strong · 15px Heebo 600</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="hr" style={{margin:'28px 0'}}/>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24}}>
        {/* COMPONENTS */}
        <div>
          <Tag>03 · COMPONENTS</Tag>
          <h3 style={{margin:'6px 0 12px', font:'700 16px var(--font-ui)'}}>Buttons</h3>
          <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-start'}}>
            <button className="btn btn--brand">פעולה ראשית</button>
            <button className="btn">פעולה משנית</button>
            <button className="btn btn--ghost">פעולת רקע</button>
          </div>
        </div>

        <div>
          <Tag>04 · CHIPS</Tag>
          <h3 style={{margin:'6px 0 12px', font:'700 16px var(--font-ui)'}}>Status</h3>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            <span className="chip"><span className="dot"/>נייטרלי</span>
            <span className="chip chip--ok"><span className="dot"/>בזמן</span>
            <span className="chip chip--warn"><span className="dot"/>איחור</span>
            <span className="chip chip--bad"><span className="dot"/>חירום</span>
            <span className="chip chip--brand"><span className="dot"/>מסומן</span>
            <span className="chip chip--solid">קבוצה</span>
          </div>
          <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
            <ModePill mode="emergency"/>
            <ModePill mode="routine"/>
          </div>
        </div>

        <div>
          <Tag>05 · MARK</Tag>
          <h3 style={{margin:'6px 0 12px', font:'700 16px var(--font-ui)'}}>Brand crest</h3>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <Crest/>
            <Crest variant="brand" subtitle="חמ״ל"/>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
