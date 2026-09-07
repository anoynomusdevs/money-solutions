require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('[WARNING] SUPABASE_URL or SUPABASE_KEY not configured. Please set them in your .env file or environment variables.');
}

// Fallback in-memory cache if Supabase credentials are not yet entered
const inMemoryLeads = [];

async function saveLead(leadData) {
  const payload = {
    name: leadData.name || '',
    mobile: leadData.mobile || '',
    loan_type: leadData.loan_type || 'Personal Loan',
    loan_amount: leadData.loan_amount || '',
    source_url: leadData.source_url || '',
    utm_source: leadData.utm_source || '',
    utm_medium: leadData.utm_medium || '',
    utm_campaign: leadData.utm_campaign || '',
    utm_content: leadData.utm_content || '',
    utm_term: leadData.utm_term || '',
    ip_address: leadData.ip_address || '',
    user_agent: leadData.user_agent || ''
  };

  if (!supabase) {
    console.warn('[DB] Supabase not connected. Saving lead to in-memory fallback.');
    const mockRecord = { id: inMemoryLeads.length + 1, ...payload, created_at: new Date().toISOString() };
    inMemoryLeads.unshift(mockRecord);
    return mockRecord;
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([payload])
    .select();

  if (error) {
    console.error('[Supabase Error] insert failed:', error.message);
    throw new Error(error.message);
  }

  return data && data[0] ? data[0] : payload;
}

async function getAllLeads() {
  if (!supabase) {
    return inMemoryLeads;
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase Error] select failed:', error.message);
    throw new Error(error.message);
  }

  return data || [];
}

async function getLeadsCount() {
  if (!supabase) {
    return inMemoryLeads.length;
  }

  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('[Supabase Error] count failed:', error.message);
    return 0;
  }

  return count || 0;
}

module.exports = {
  saveLead,
  getAllLeads,
  getLeadsCount
};
