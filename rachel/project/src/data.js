import { supabase } from './supabase.js';

export const CATEGORIES = [
  { id: 1, name: 'משרד הכלכלה — מזון', short: 'כלכלה' },
  { id: 2, name: 'משרד האנרגיה — דלקים', short: 'אנרגיה' },
  { id: 3, name: 'משרד החקלאות — גרעינים ומספוא', short: 'חקלאות' },
  { id: 4, name: 'משרד הבריאות — ציוד רפואי', short: 'בריאות' },
];

export const PRODUCTS = [
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

export async function dbInsertReport({ user_id, organization_id, lines, reported_at }) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert({ organization_id, user_id, reported_at: new Date(reported_at).toISOString() })
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
