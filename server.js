const express = require('express');
const cors = require('cors');
const path = require('path');
const { saveLead, getAllLeads, getLeadsCount } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const DEFAULT_REDIRECT_URL = 'https://www.bajajfinservmarkets.in/apply-for-personal-loan-finservmarkets/?utm_source=ERefferalAffiliate&utm_medium=SOL&utm_campaign=Open&utm_content=Growthgenius&utm_term=Aug26SC7_';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to capture leads
app.post('/api/apply', (req, res) => {
  try {
    const { name, mobile, loan_type, loan_amount, utm_source, utm_medium, utm_campaign, utm_content, utm_term, source_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const cleanMobile = (mobile || '').toString().replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const saved = saveLead({
      name: name.trim(),
      mobile: cleanMobile.slice(-10),
      loan_type: loan_type || 'Personal Loan',
      loan_amount: loan_amount || '',
      source_url: source_url || req.headers.referer || '',
      utm_source: utm_source || '',
      utm_medium: utm_medium || '',
      utm_campaign: utm_campaign || '',
      utm_content: utm_content || '',
      utm_term: utm_term || '',
      ip_address: ip,
      user_agent: userAgent
    });

    console.log(`[LEAD SAVED] ID #${saved.id} - ${name} (${cleanMobile})`);

    return res.json({
      success: true,
      message: 'Application details captured successfully',
      redirectUrl: DEFAULT_REDIRECT_URL
    });
  } catch (err) {
    console.error('Error saving lead:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// API endpoint to retrieve leads
app.get('/api/leads', (req, res) => {
  try {
    const leads = getAllLeads();
    return res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// CSV Export
app.get('/api/export-leads', (req, res) => {
  try {
    const leads = getAllLeads();
    const headers = ['ID', 'Name', 'Mobile', 'Loan Type', 'Loan Amount', 'IP Address', 'Created At'];
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.mobile}"`,
      `"${l.loan_type || ''}"`,
      `"${l.loan_amount || ''}"`,
      `"${l.ip_address || ''}"`,
      `"${l.created_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=moneysolution_leads.csv');
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).send('Error generating export');
  }
});

// Admin Leads Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Fallback for any other unmatched routes to home page
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Money Solutions Server running on http://localhost:${PORT}`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/admin`);
});
