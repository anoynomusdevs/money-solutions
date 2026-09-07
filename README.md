# Money Solutions

An exact replica of the Money Solutions financial services website (`https://moneysolution.co.in/`) with all original images, interactive EMI calculator, catchy hero header, responsive layout, and an integrated lead capture popup modal that stores applicant details in a local SQLite database before redirecting users to the partner affiliate application page.

## Features
- **Faithful Frontend Clone**: Replicates all sections (Hero, Partner Banks, 6 Featured Services, Live EMI Calculator, About Us, Why Choose Us, 4M+ Customer Statistics, Eligibility Checklist, 4-Step Process, Customer Reviews, Partner Brand Disclaimers, and Footer).
- **Offline Assets**: All 90 original images, logos, 3D illustrations, and vector icons stored locally under `public/assets/images/`.
- **Catchy Hero Header**: Prominently placed in the first section directly above the Apply button.
- **Lead Capture Popup Modal**:
  - Automatically pops up on clicking any "Apply Now" or "Apply for Loan" button.
  - Captures Full Name and 10-digit Mobile Number.
  - Validates Indian phone number format (`+91`).
  - Saves applicant information directly to an **SQLite** database (`leads.db`).
  - Seamlessly redirects the applicant to Bajaj Finserv Markets affiliate URL.
- **Admin Leads Portal**: View, search, filter, and download all captured leads to CSV via `http://localhost:3000/admin`.

## Supabase Setup

1. Create a project at [Supabase](https://supabase.com/).
2. In the **SQL Editor**, run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
3. Copy your **Project URL** and **anon / service_role key** from **Project Settings -> API**.
4. Set them in your `.env` file (or in Vercel / hosting Environment Variables):
```env
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=eyJh......
REDIRECT_URL=https://www.bajajfinservmarkets.in/apply-for-personal-loan-finservmarkets/?utm_source=ERefferalAffiliate&utm_medium=SOL&utm_campaign=Open&utm_content=Growthgenius&utm_term=Aug26SC7_
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The application will be live at:
- **Landing Page**: `http://localhost:3000`
- **Admin Leads Portal**: `http://localhost:3000/admin`
- **CSV Export**: `http://localhost:3000/api/export-leads`
