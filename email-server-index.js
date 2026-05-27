const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const cron       = require('node-cron');
const https      = require('https');

const SUPABASE_HOST = 'jerkggtuyisclgsllpgf.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_7SwRadLqsXKEIXu6GAZiwQ_DGROuaP6';
const FROM_EMAIL    = 'morisiusmoris@gmail.com';
const APP_URL       = 'http://213.199.53.73:4001';

const app = express();
app.use(cors());
app.use(express.json());

function makeTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: FROM_EMAIL, pass: process.env.GMAIL_APP_PASS }
  });
}

function sbGet(path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: SUPABASE_HOST,
      path: '/rest/v1/' + path,
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve([]); } });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

function wrapHtml(inner) {
  return '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif">' +
    '<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)">' +
    inner +
    '<div style="padding:16px 32px;text-align:center;color:#aaa;font-size:12px;border-top:1px solid #eee">' +
    'מערכת רחל — מטה החירום הלאומי &nbsp;|&nbsp; הודעה אוטומטית, אין להשיב למייל זה' +
    '</div></div></body></html>';
}

function btnHtml(text) {
  return '<div style="text-align:center"><a href="' + APP_URL + '" style="display:inline-block;background:#1a4fa0;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:15px;font-weight:bold;margin:20px 0">' + text + '</a></div>';
}

function reminderRoutineHtml(orgName) {
  return wrapHtml(
    '<div style="background:linear-gradient(135deg,#1a4fa0,#143d7a);padding:28px 32px">' +
    '<div style="color:rgba(255,255,255,.7);font-size:13px;margin-bottom:6px">מערכת רחל — דיווח מלאי לאומי</div>' +
    '<h1 style="color:white;margin:0;font-size:22px">\u{1F4CB} תזכורת דיווח שבועי</h1>' +
    '<div style="color:rgba(255,255,255,.8);font-size:14px;margin-top:6px">הגיע הזמן לדיווח המלאי השבועי</div>' +
    '</div>' +
    '<div style="padding:28px 32px">' +
    '<p style="font-size:16px;color:#333">שלום <strong>' + orgName + '</strong>,</p>' +
    '<p style="font-size:15px;color:#555;line-height:1.7">מערכת רחל מזכירה לכם לבצע את <strong>דיווח המלאי השבועי</strong>.<br/>הדיווח חיוני לתמונת המצב הלאומית של מלאי הביטחון.</p>' +
    '<p style="font-size:14px;color:#666;line-height:1.7">אנא היכנסו למערכת, עדכנו את נתוני המלאי הנוכחי והמלאי הנכנס עבור כל המוצרים הרלוונטיים.</p>' +
    btnHtml('כניסה למערכת הדיווח ←') +
    '<p style="font-size:13px;color:#999;margin-top:20px">במידה ובצעתם דיווח השבוע — תודה, ניתן להתעלם ממייל זה.</p>' +
    '</div>'
  );
}

function reminderEmergencyHtml(orgName) {
  return wrapHtml(
    '<div style="background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:28px 32px">' +
    '<div style="color:rgba(255,255,255,.7);font-size:13px;margin-bottom:6px">מערכת רחל — דיווח מלאי לאומי</div>' +
    '<h1 style="color:white;margin:0;font-size:22px">⚠️ תזכורת דיווח יומי — מצב חירום</h1>' +
    '<div style="color:rgba(255,255,255,.8);font-size:14px;margin-top:6px">נדרש דיווח מיידי</div>' +
    '</div>' +
    '<div style="padding:28px 32px">' +
    '<p style="font-size:16px;color:#333">שלום <strong>' + orgName + '</strong>,</p>' +
    '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 18px;margin-bottom:20px">' +
    '<strong style="color:#b91c1c;font-size:14px">⚠️ מצב חירום לאומי פעיל</strong>' +
    '<p style="margin:6px 0 0;font-size:13px;color:#7f1d1d">במצב חירום נדרש דיווח יומי על מצב המלאי. אי-דיווח עלול לפגוע בתיאום הלאומי.</p>' +
    '</div>' +
    '<p style="font-size:15px;color:#555;line-height:1.7">אנא בצעו <strong>דיווח מלאי יומי</strong> בהקדם האפשרי.</p>' +
    btnHtml('כניסה לדיווח מיידי ←') +
    '</div>'
  );
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.post('/send', async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !subject || !html) return res.status(400).json({ error: 'missing fields' });
  try {
    await makeTransport().sendMail({ from: '"מערכת רחל" <' + FROM_EMAIL + '>', to, subject, html });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/ping', (_, res) => res.json({ ok: true }));

// ── Cron: check every hour ────────────────────────────────────────────────────

cron.schedule('0 * * * *', async () => {
  try {
    const rawSettings = await sbGet('app_settings?select=key,value');
    const s = Object.fromEntries((rawSettings || []).map(r => [r.key, r.value]));

    const targetHour = parseInt(s.notify_hour || '8');
    if (new Date().getHours() !== targetHour) return;

    const skipDays  = JSON.parse(s.notify_skip_days || '[]');
    const dayOfWeek = new Date().getDay();
    if (skipDays.includes(dayOfWeek)) return;

    const mode = s.national || 'routine';
    if (mode === 'routine' && dayOfWeek !== 0) return;

    const [users, orgs] = await Promise.all([
      sbGet('rachel_users?select=full_name,email,organization_id&role=eq.FIELD_USER&email=not.is.null'),
      sbGet('organizations?select=id,name&active=eq.true'),
    ]);

    const transport = makeTransport();
    let sent = 0;
    for (const u of (users || [])) {
      if (!u.email) continue;
      const org = (orgs || []).find(o => o.id === u.organization_id);
      if (!org) continue;
      const isEmergency = mode === 'emergency';
      await transport.sendMail({
        from: '"מערכת רחל" <' + FROM_EMAIL + '>',
        to: u.email,
        subject: isEmergency ? '⚠️ תזכורת דיווח יומי — מצב חירום — מערכת רחל' : '\u{1F4CB} תזכורת דיווח שבועי — מערכת רחל',
        html: isEmergency ? reminderEmergencyHtml(org.name) : reminderRoutineHtml(org.name),
      }).catch(e => console.error('[cron] failed ' + u.email + ':', e.message));
      sent++;
    }
    console.log('[cron] reminders sent to ' + sent + ' recipients, mode=' + mode);
  } catch(e) { console.error('[cron] error:', e.message); }
});

app.listen(4002, () => console.log('Rachel email server :4002'));
