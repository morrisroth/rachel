// Seed data for the Rachel MVP prototype. All organization/product names are
// generic stand-ins to illustrate the categories defined in the PRD; nothing
// here is real or claims to be.

const CATEGORIES = [
  { id: 1, name: 'משרד הכלכלה — מזון', short: 'כלכלה' },
  { id: 2, name: 'משרד האנרגיה — דלקים', short: 'אנרגיה' },
  { id: 3, name: 'משרד החקלאות — גרעינים ומספוא', short: 'חקלאות' },
  { id: 4, name: 'משרד הבריאות — ציוד רפואי', short: 'בריאות' },
];

const PRODUCTS = [
  { id: 101, category_id: 1, name: 'קמח חיטה', unit: 'טון' },
  { id: 102, category_id: 1, name: 'אורז לבן', unit: 'טון' },
  { id: 103, category_id: 1, name: 'שמן חמניות', unit: 'ק"ל' },
  { id: 104, category_id: 1, name: 'סוכר לבן', unit: 'טון' },
  { id: 105, category_id: 1, name: 'מים מינרליים — בקבוקים 1.5 ליטר', unit: 'יחידות' },
  { id: 201, category_id: 2, name: 'סולר תעשייתי', unit: 'ק"ל' },
  { id: 202, category_id: 2, name: 'בנזין 95', unit: 'ק"ל' },
  { id: 203, category_id: 2, name: 'גז בישול (LPG)', unit: 'טון' },
  { id: 301, category_id: 3, name: 'גרעיני חיטה', unit: 'טון' },
  { id: 302, category_id: 3, name: 'מספוא כוספאות', unit: 'טון' },
  { id: 401, category_id: 4, name: 'מכשירי הנשמה', unit: 'יחידות' },
  { id: 402, category_id: 4, name: 'מנות דם — O שלילי', unit: 'מנות' },
  { id: 403, category_id: 4, name: 'חמצן נוזלי', unit: 'ק"ל' },
];

const ORGANIZATIONS = [
  { id: 1, name: 'רשת שיווק צפון',    type: 'רשת שיווק',    cat_id: 1, active: true,
    linked_products: [101, 102, 103, 104, 105] },
  { id: 2, name: 'רשת שיווק דרום',    type: 'רשת שיווק',    cat_id: 1, active: true,
    linked_products: [101, 102, 103, 104] },
  { id: 3, name: 'רשת שיווק מרכז',    type: 'רשת שיווק',    cat_id: 1, active: true,
    linked_products: [101, 102, 105] },
  { id: 4, name: 'חברת דלק א׳',       type: 'חברת אנרגיה', cat_id: 2, active: true,
    linked_products: [201, 202, 203] },
  { id: 5, name: 'חברת דלק ב׳',       type: 'חברת אנרגיה', cat_id: 2, active: true,
    linked_products: [201, 202] },
  { id: 6, name: 'ממגורות לאומיות',   type: 'אחסון גרעינים', cat_id: 3, active: true,
    linked_products: [301, 302] },
  { id: 7, name: 'מרכז רפואי דרום',   type: 'מרכז רפואי',   cat_id: 4, active: true,
    linked_products: [401, 402, 403] },
  { id: 8, name: 'מרכז רפואי צפון',   type: 'מרכז רפואי',   cat_id: 4, active: true,
    linked_products: [401, 402] },
  { id: 9, name: 'מטה רח"ל',          type: 'מטה',          cat_id: null, active: true,
    linked_products: [] },
];

const ORG_TYPES = [
  'רשת שיווק', 'חברת אנרגיה', 'אחסון גרעינים', 'מרכז רפואי',
  'חברת תרופות', 'מתקן ייצור', 'מחסן ערכי חירום', 'אחר',
];

const USERS = [
  {
    id: 11, role: 'FIELD_USER', organization_id: 1,
    full_name: 'דנה אברהמי', id_number: '039482156', phone: '050-1234567', password: '1234',
    title: 'מנהלת לוגיסטיקה — רשת שיווק צפון',
  },
  {
    id: 22, role: 'HQ_USER', organization_id: 9,
    full_name: 'וויקי לוי', id_number: '012345678', phone: '050-7654321', password: '1234',
    title: 'מנהלת חמ"ל — מטה רח"ל',
  },
];

// Sample history for the field user. Newest first.
function sampleHistory() {
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  return [
    {
      id: 9012, reported_at: now - 1 * day,
      lines: [
        { product_id: 101, current_stock: 10, incoming_stock: 4,  incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
        { product_id: 102, current_stock: 22, incoming_stock: 0,  incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
        { product_id: 103, current_stock: 18, incoming_stock: 6,  incoming_status: 'מעוכב בנמל', quality_status: 'תקין', notes: 'אחור 4 ימים' },
        { product_id: 104, current_stock: 14, incoming_stock: 0,  incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
        { product_id: 105, current_stock: 9400, incoming_stock: 12000, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
      ],
    },
    {
      id: 9011, reported_at: now - 2 * day,
      lines: [
        { product_id: 101, current_stock: 11, incoming_stock: 4, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
        { product_id: 102, current_stock: 24, incoming_stock: 0, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
        { product_id: 103, current_stock: 19, incoming_stock: 6, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
      ],
    },
    {
      id: 9010, reported_at: now - 3 * day,
      lines: [
        { product_id: 101, current_stock: 12, incoming_stock: 0, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
        { product_id: 102, current_stock: 26, incoming_stock: 0, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
      ],
    },
    {
      id: 9009, reported_at: now - 4 * day,
      lines: [
        { product_id: 101, current_stock: 14, incoming_stock: 0, incoming_status: 'תקין ובדרך', quality_status: 'בלאי', notes: 'בלאי בשק אחד' },
      ],
    },
    {
      id: 9008, reported_at: now - 6 * day,
      lines: [
        { product_id: 102, current_stock: 28, incoming_stock: 0, incoming_status: 'תקין ובדרך', quality_status: 'תקין', notes: '' },
      ],
    },
  ];
}

// HQ monitor — last-reported timestamp per org. Some are "dead zones" (no report today).
function sampleHqMonitor() {
  const now = Date.now();
  const h = 3600 * 1000;
  return [
    { org_id: 1, last: now - 3 * h,  user: 'דנה אברהמי' },
    { org_id: 2, last: now - 8 * h,  user: 'מאיה בן-נון' },
    { org_id: 3, last: now - 27 * h, user: 'יעל קצב' },           // dead zone
    { org_id: 4, last: now - 5 * h,  user: 'נדב טל' },
    { org_id: 5, last: now - 31 * h, user: 'אורן שמואלי' },        // dead zone
    { org_id: 6, last: now - 12 * h, user: 'הילה כהן' },
    { org_id: 7, last: now - 2 * h,  user: 'ד״ר אבי שריר' },
    { org_id: 8, last: now - 26 * h, user: 'ד״ר רותי מור' },       // dead zone
  ];
}

const INCOMING_STATUSES = ['תקין ובדרך', 'מעוכב בנמל', 'תקוע בחו"ל'];
const QUALITY_STATUSES  = ['תקין', 'בלאי', 'פסול'];

Object.assign(window, {
  CATEGORIES, PRODUCTS, ORGANIZATIONS, USERS, ORG_TYPES,
  INCOMING_STATUSES, QUALITY_STATUSES,
  sampleHistory, sampleHqMonitor,
});
