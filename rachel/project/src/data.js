import { supabase } from './supabase.js';

export const CATEGORIES = [
  { id: 1, name: 'משרד הכלכלה — מזון', short: 'כלכלה' },
  { id: 2, name: 'משרד האנרגיה — דלקים', short: 'אנרגיה' },
  { id: 3, name: 'משרד החקלאות — גרעינים ומספוא', short: 'חקלאות' },
  { id: 4, name: 'משרד הבריאות — ציוד רפואי', short: 'בריאות' },
];

export const ALL_UNITS = ['טון', 'ק"ל', 'קג', 'יחידות', 'מנות', 'משטח', 'מ"ק', 'ליטר'];

export const PRODUCTS = [
  { id: 101, category_id: 1, name: 'קמח חיטה',                      unit: 'טון',     allowed_units: ['טון', 'ק"ל', 'קג'] },
  { id: 102, category_id: 1, name: 'אורז לבן',                       unit: 'טון',     allowed_units: ['טון', 'ק"ל', 'קג'] },
  { id: 103, category_id: 1, name: 'שמן חמניות',                     unit: 'ק"ל',    allowed_units: ['ק"ל', 'ליטר', 'יחידות'] },
  { id: 104, category_id: 1, name: 'סוכר לבן',                       unit: 'טון',     allowed_units: ['טון', 'ק"ל', 'קג'] },
  { id: 105, category_id: 1, name: 'מים מינרליים — בקבוקים 1.5 ליטר', unit: 'יחידות', allowed_units: ['יחידות', 'משטח'] },
  { id: 201, category_id: 2, name: 'סולר תעשייתי',                   unit: 'ק"ל',    allowed_units: ['ק"ל', 'ליטר', 'טון'] },
  { id: 202, category_id: 2, name: 'בנזין 95',                       unit: 'ק"ל',    allowed_units: ['ק"ל', 'ליטר', 'טון'] },
  { id: 203, category_id: 2, name: 'גז בישול (LPG)',                 unit: 'טון',     allowed_units: ['טון', 'ק"ל', 'קג'] },
  { id: 301, category_id: 3, name: 'גרעיני חיטה',                    unit: 'טון',     allowed_units: ['טון', 'ק"ל', 'קג'] },
  { id: 302, category_id: 3, name: 'מספוא כוספאות',                  unit: 'טון',     allowed_units: ['טון', 'ק"ל', 'קג'] },
  { id: 401, category_id: 4, name: 'מכשירי הנשמה',                   unit: 'יחידות', allowed_units: ['יחידות'] },
  { id: 402, category_id: 4, name: 'מנות דם — O שלילי',             unit: 'מנות',   allowed_units: ['מנות', 'יחידות'] },
  { id: 403, category_id: 4, name: 'חמצן נוזלי',                     unit: 'ק"ל',    allowed_units: ['ק"ל', 'ליטר', 'מ"ק'] },
];

export const ORG_TYPES = [
  'רשת שיווק', 'חברת אנרגיה', 'אחסון גרעינים', 'מרכז רפואי',
  'חברת תרופות', 'מתקן ייצור', 'מחסן ערכי חירום', 'אחר',
];

export const INCOMING_STATUSES = ['תקין ובדרך', 'מעוכב בנמל', 'תקוע בחו"ל'];
export const QUALITY_STATUSES  = ['תקין', 'בלאי', 'פסול'];

export async function dbFetchOrganizations() {
  const [{ data: orgs }, { data: links }] = await Promise.all([
    supabase.from('organizations').select('*').order('id'),
    supabase.from('org_products').select('*'),
  ]);
  return (orgs || []).map(o => ({
    ...o,
    linked_products: (links || []).filter(l => l.org_id === o.id).map(l => l.product_id),
  }));
}

export async function dbFetchUsers() {
  const { data } = await supabase.from('rachel_users').select('*').order('id');
  return data || [];
}

export async function dbLogin(id_number, password) {
  const { data, error } = await supabase
    .from('rachel_users')
    .select('*')
    .eq('id_number', id_number)
    .eq('password', password)
    .single();
  return { user: data, error };
}

export async function dbFetchHistory(organization_id) {
  const { data: reports } = await supabase
    .from('reports')
    .select('id, reported_at, report_lines(*)')
    .eq('organization_id', organization_id)
    .order('reported_at', { ascending: false })
    .limit(50);
  return (reports || []).map(r => ({
    id: r.id,
    reported_at: new Date(r.reported_at).getTime(),
    lines: (r.report_lines || []).map(l => ({
      ...l,
      current_stock: Number(l.current_stock),
      incoming_stock: Number(l.incoming_stock),
    })),
  }));
}

export async function dbFetchMonitor() {
  const { data: reports } = await supabase
    .from('reports')
    .select('organization_id, reported_at, rachel_users(full_name)')
    .order('reported_at', { ascending: false });
  const seen = new Set();
  const monitor = [];
  for (const r of (reports || [])) {
    if (!seen.has(r.organization_id)) {
      seen.add(r.organization_id);
      monitor.push({
        org_id: r.organization_id,
        last: new Date(r.reported_at).getTime(),
        user: r.rachel_users?.full_name || '—',
      });
    }
  }
  return monitor;
}

export async function dbInsertReport({ user_id, organization_id, lines, reported_at, image_url }) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert({ organization_id, user_id, reported_at: new Date(reported_at).toISOString(), ...(image_url ? { image_url } : {}) })
    .select()
    .single();
  if (error) throw error;

  const lineRows = lines.map(l => ({
    report_id: report.id,
    product_id: l.product?.kind === 'catalog' ? l.product.product_id : null,
    free_text_product_name: l.product?.kind === 'free' ? l.product.name : null,
    category_id: l.category_id,
    current_stock: Number(l.current_stock) || 0,
    incoming_stock: Number(l.incoming_stock) || 0,
    incoming_status: l.incoming_status,
    quality_status: l.quality_status,
    expected_arrival_date: l.expected_arrival_date || null,
    notes: l.notes || null,
    unit: l.unit || null,
  }));
  await supabase.from('report_lines').insert(lineRows);
  return report;
}

export async function dbInsertOrganization({ org, user }) {
  const { data: newOrg, error: orgErr } = await supabase
    .from('organizations')
    .insert({ name: org.name, type: org.type, cat_id: org.cat_id, active: true })
    .select()
    .single();
  if (orgErr) throw orgErr;

  if (org.linked_products?.length > 0) {
    await supabase.from('org_products').insert(
      org.linked_products.map(pid => ({ org_id: newOrg.id, product_id: pid }))
    );
  }

  const { data: newUser, error: userErr } = await supabase
    .from('rachel_users')
    .insert({ ...user, organization_id: newOrg.id, role: 'FIELD_USER' })
    .select()
    .single();
  if (userErr) throw userErr;

  return {
    org: { ...newOrg, linked_products: org.linked_products || [] },
    user: newUser,
  };
}

export async function dbFetchLatestReportLines(org_id) {
  const { data: report } = await supabase
    .from('reports')
    .select('id, reported_at, report_lines(*)')
    .eq('organization_id', org_id)
    .order('reported_at', { ascending: false })
    .limit(1)
    .single();
  if (!report) return null;
  return {
    reported_at: new Date(report.reported_at).getTime(),
    lines: (report.report_lines || []).map(l => ({
      ...l,
      current_stock: Number(l.current_stock),
      incoming_stock: Number(l.incoming_stock),
    })),
  };
}

export async function dbUploadReportImage(file, orgId) {
  const ext  = file.name.split('.').pop();
  const path = `${orgId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('report-images').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('report-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function dbFetchNotifications(org_id = null) {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(20);
  if (org_id) query = query.or(`org_id.eq.${org_id},org_id.is.null`);
  const { data } = await query;
  return data || [];
}

export async function dbSendNotification({ message, org_id = null, sent_by }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ message, org_id, sent_by, sent_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function dbFetchReportsForExport(fromMs = null, toMs = null) {
  let query = supabase
    .from('reports')
    .select('id, organization_id, reported_at, report_lines(*)')
    .order('reported_at', { ascending: false });
  if (fromMs) query = query.gte('reported_at', new Date(fromMs).toISOString());
  if (toMs)   query = query.lte('reported_at', new Date(new Date(toMs).setHours(23,59,59,999)).toISOString());
  const { data: reports } = await query;
  if (fromMs || toMs) {
    return (reports || []).map(r => ({
      organization_id: r.organization_id,
      reported_at: new Date(r.reported_at).getTime(),
      lines: (r.report_lines || []).map(l => ({ ...l, current_stock: Number(l.current_stock), incoming_stock: Number(l.incoming_stock) })),
    }));
  }
  const seen = new Set();
  const result = [];
  for (const r of (reports || [])) {
    if (!seen.has(r.organization_id)) {
      seen.add(r.organization_id);
      result.push({
        organization_id: r.organization_id,
        reported_at: new Date(r.reported_at).getTime(),
        lines: (r.report_lines || []).map(l => ({ ...l, current_stock: Number(l.current_stock), incoming_stock: Number(l.incoming_stock) })),
      });
    }
  }
  return result;
}

export async function dbFetchAppSettings() {
  const { data } = await supabase.from('app_settings').select('*');
  return Object.fromEntries((data || []).map(r => [r.key, r.value]));
}

export async function dbSaveAppSetting(key, value) {
  await supabase.from('app_settings').upsert({ key, value }, { onConflict: 'key' });
}

const EMAIL_API = '/api/email';

export async function dbSendEmail({ to, subject, html }) {
  const res = await fetch(`${EMAIL_API}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function dbUpdateOrganization(id, patch) {
  const { linked_products, ...orgFields } = patch;
  if (Object.keys(orgFields).length > 0) {
    await supabase.from('organizations').update(orgFields).eq('id', id);
  }
  if (linked_products !== undefined) {
    await supabase.from('org_products').delete().eq('org_id', id);
    if (linked_products.length > 0) {
      await supabase.from('org_products').insert(
        linked_products.map(pid => ({ org_id: id, product_id: pid }))
      );
    }
  }
}
