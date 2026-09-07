const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'leads.db');
const db = new Database(dbPath);

// Create leads table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    loan_type TEXT DEFAULT 'Personal Loan',
    loan_amount TEXT,
    source_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertLeadStmt = db.prepare(`
  INSERT INTO leads (
    name, mobile, loan_type, loan_amount, source_url,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    ip_address, user_agent
  ) VALUES (
    @name, @mobile, @loan_type, @loan_amount, @source_url,
    @utm_source, @utm_medium, @utm_campaign, @utm_content, @utm_term,
    @ip_address, @user_agent
  )
`);

function saveLead(leadData) {
  const result = insertLeadStmt.run({
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
  });
  return { id: result.lastInsertRowid, ...leadData };
}

function getAllLeads() {
  return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
}

function getLeadsCount() {
  return db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
}

module.exports = {
  db,
  saveLead,
  getAllLeads,
  getLeadsCount
};
