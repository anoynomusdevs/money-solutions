/**
 * MONEY SOLUTIONS - CORE SCRIPT
 * Handles:
 * 1. Apply Now Popup Modal
 * 2. Form validation, SQLite DB persistence via /api/apply
 * 3. Redirection to Bajaj Finserv Markets partner URL
 * 4. Interactive EMI Calculator
 * 5. Mobile Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  const BAJAJ_REDIRECT_URL = 'https://www.bajajfinservmarkets.in/apply-for-personal-loan-finservmarkets/?utm_source=ERefferalAffiliate&utm_medium=SOL&utm_campaign=Open&utm_content=Growthgenius&utm_term=Aug26SC7_';

  // --------------------------------------------------------------------------
  // 1. POPUP MODAL CONTROL
  // --------------------------------------------------------------------------
  const modalOverlay = document.getElementById('applyModalOverlay');
  const closeModalBtn = document.getElementById('closeApplyModal');
  const applyForm = document.getElementById('applyLeadForm');
  const nameInput = document.getElementById('userName');
  const mobileInput = document.getElementById('userMobile');
  const groupName = document.getElementById('groupName');
  const groupMobile = document.getElementById('groupMobile');
  const submitBtn = document.getElementById('submitLeadBtn');
  const selectedLoanTypeInput = document.getElementById('selectedLoanType');

  function openModal(loanType = 'Personal Loan') {
    if (selectedLoanTypeInput) {
      selectedLoanTypeInput.value = loanType;
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameInput.focus(), 150);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    groupName.classList.remove('has-error');
    groupMobile.classList.remove('has-error');
  }

  // Attach click listeners to all "Apply Now" / "Apply for Loan" buttons
  document.querySelectorAll('.open-apply-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const loanType = btn.getAttribute('data-loan-type') || 'Personal Loan';
      openModal(loanType);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  // Close when clicking backdrop
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Sanitize mobile input: digits only, max 10
  mobileInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (e.target.value.length === 10) {
      groupMobile.classList.remove('has-error');
    }
  });

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length > 1) {
      groupName.classList.remove('has-error');
    }
  });

  // --------------------------------------------------------------------------
  // 2. FORM SUBMISSION & DATABASE PERSISTENCE & REDIRECTION
  // --------------------------------------------------------------------------
  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameVal = nameInput.value.trim();
    const mobileVal = mobileInput.value.trim();

    let hasError = false;

    if (!nameVal || nameVal.length < 2) {
      groupName.classList.add('has-error');
      hasError = true;
    } else {
      groupName.classList.remove('has-error');
    }

    // 10 digits check (typically 6-9 in India)
    if (!mobileVal || mobileVal.length !== 10 || !/^[6-9]\d{9}$/.test(mobileVal)) {
      groupMobile.classList.add('has-error');
      hasError = true;
    } else {
      groupMobile.classList.remove('has-error');
    }

    if (hasError) return;

    // Collect URL search params (UTMs if visitor arrived via ad)
    const urlParams = new URLSearchParams(window.location.search);

    const payload = {
      name: nameVal,
      mobile: mobileVal,
      loan_type: selectedLoanTypeInput.value || 'Personal Loan',
      source_url: window.location.href,
      utm_source: urlParams.get('utm_source') || 'MoneySolutions_Clone',
      utm_medium: urlParams.get('utm_medium') || 'Affiliate',
      utm_campaign: urlParams.get('utm_campaign') || 'Direct',
      utm_content: urlParams.get('utm_content') || '',
      utm_term: urlParams.get('utm_term') || ''
    };

    // UI Loading state
    submitBtn.classList.add('is-loading');
    const btnText = submitBtn.querySelector('.btn-text');
    const origText = btnText.textContent;
    btnText.textContent = 'Saving & Verifying...';

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        btnText.textContent = 'Approved! Redirecting...';
        // Give a micro visual feedback before redirect
        setTimeout(() => {
          window.location.href = data.redirectUrl || BAJAJ_REDIRECT_URL;
        }, 500);
      } else {
        alert(data.message || 'Something went wrong. Please check your details.');
        submitBtn.classList.remove('is-loading');
        btnText.textContent = origText;
      }
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback redirection so user isn't stuck even on network glitch
      btnText.textContent = 'Redirecting...';
      setTimeout(() => {
        window.location.href = BAJAJ_REDIRECT_URL;
      }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 3. EMI CALCULATOR
  // --------------------------------------------------------------------------
  const loanAmountSlider = document.getElementById('loanAmount');
  const interestRateSlider = document.getElementById('interestRate');
  const loanTenureSlider = document.getElementById('loanTenure');

  const amountDisplay = document.getElementById('amountDisplay');
  const rateDisplay = document.getElementById('rateDisplay');
  const tenureDisplay = document.getElementById('tenureDisplay');

  const emiValueDisplay = document.getElementById('emiValue');
  const principalValueDisplay = document.getElementById('principalValue');
  const interestValueDisplay = document.getElementById('interestValue');
  const totalPaymentValueDisplay = document.getElementById('totalPaymentValue');

  function formatINR(val) {
    return '₹ ' + Math.round(val).toLocaleString('en-IN');
  }

  function calculateEMI() {
    if (!loanAmountSlider) return;

    const principal = parseFloat(loanAmountSlider.value);
    const annualRate = parseFloat(interestRateSlider.value);
    const tenureYears = parseInt(loanTenureSlider.value);
    const tenureMonths = tenureYears * 12;

    // Update Slider Displays
    amountDisplay.textContent = formatINR(principal);
    rateDisplay.textContent = `${annualRate.toFixed(2)}%`;
    tenureDisplay.textContent = `${tenureYears} Year${tenureYears > 1 ? 's' : ''} (${tenureMonths} Mos)`;

    // Monthly interest rate
    const monthlyRate = annualRate / 12 / 100;

    // EMI formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;

    emiValueDisplay.textContent = formatINR(emi);
    principalValueDisplay.textContent = formatINR(principal);
    interestValueDisplay.textContent = formatINR(totalInterest);
    totalPaymentValueDisplay.textContent = formatINR(totalPayment);
  }

  if (loanAmountSlider && interestRateSlider && loanTenureSlider) {
    loanAmountSlider.addEventListener('input', calculateEMI);
    interestRateSlider.addEventListener('input', calculateEMI);
    loanTenureSlider.addEventListener('input', calculateEMI);
    calculateEMI(); // initial calculation
  }

  // --------------------------------------------------------------------------
  // 4. MOBILE NAVIGATION TOGGLE
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
});
