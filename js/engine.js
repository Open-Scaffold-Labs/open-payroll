import {clone, architectureLayers, payrollPresets, taxFilingsCatalog, sponsorBanks, verticalLaborRules} from './data.js';

export const STATE_KEY = 'open_payroll.workspace.v1';
export const money = (value, digits = 2) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
}).format(Number(value) || 0);

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

export function createState(presetId = 'restaurant') {
  const preset = payrollPresets.find(p => p.id === presetId) || payrollPresets[0];
  return {
    version: 1,
    activePresetId: preset.id,
    activeLayerId: architectureLayers[0].id,
    calculator: {
      w2Employees: preset.w2Count,
      contractors1099: preset.contractorCount,
      payRunsPerYear: preset.payFrequency.includes('52') ? 52 : preset.payFrequency.includes('26') ? 26 : 24,
      legacyBaseMonthly: 120,
      legacyPerPersonMonthly: 12,
      annualTippedWages: preset.annualTippedWages,
      includeTimeTrackingAddon: true
    },
    payRun: {
      presetId: preset.id,
      periodEnding: '2026-10-25',
      checkDate: '2026-10-30',
      sponsorBankId: 'column',
      rail: 'nacha_ppd',
      employees: clone(preset.employees)
    },
    achBatches: [],
    taxFilings: clone(taxFilingsCatalog),
    journals: [],
    compliance: {
      activeRuleId: verticalLaborRules[0].id,
      mealBreakShiftHours: 6.5,
      mealBreakTakenMinute: 315,
      hourlyBaseRate: 24.00,
      shiftDifferential: 2.50,
      tippedHoursWorked: 12000,
      reportedTips: 685000,
      hourlyCashWagePaid: 16.50
    },
    audit: []
  };
}

export function audit(state, message, now = new Date()) {
  state.audit.unshift({message, time: now.toISOString()});
  state.audit = state.audit.slice(0, 100);
}

export function calculatePayrollSavings(calc) {
  const w2 = Math.max(1, Number(calc.w2Employees) || 1);
  const c1099 = Math.max(0, Number(calc.contractors1099) || 0);
  const totalPeople = w2 + c1099;
  const runs = Math.max(12, Number(calc.payRunsPerYear) || 26);
  const baseMo = Math.max(0, Number(calc.legacyBaseMonthly) || 120);
  const perPersonMo = Math.max(0, Number(calc.legacyPerPersonMonthly) || 12);
  const timeAddonMo = calc.includeTimeTrackingAddon ? totalPeople * 6 : 0;
  const yearEndW2Fee = 150 + totalPeople * 6;
  const legacyAnnualCost = (baseMo + totalPeople * perPersonMo + timeAddonMo) * 12 + yearEndW2Fee;

  const achPerPayment = 0.15;
  const openPayrollAchCost = totalPeople * runs * achPerPayment;
  const openPayrollLicense = 299;
  const openPayrollTotal = openPayrollLicense + openPayrollAchCost;

  const tippedWages = Math.max(0, Number(calc.annualTippedWages) || 0);
  const ficaTipCredit45B = Math.round(tippedWages * 0.0765 * 100) / 100;
  const directFeeSavings = Math.max(0, legacyAnnualCost - openPayrollTotal);

  return {
    totalPeople,
    runs,
    legacyAnnualCost,
    openPayrollAchCost,
    openPayrollLicense,
    openPayrollTotal,
    directFeeSavings,
    ficaTipCredit45B,
    totalEconomicBenefit: directFeeSavings + ficaTipCredit45B
  };
}

export function computeEmployeePaystub(emp, preset) {
  const is1099 = emp.type === '1099-NEC';
  const isClergy = emp.type.includes('107');
  const isSalaryOrComm = emp.type.includes('Salary') || emp.type.includes('Commission') || isClergy || is1099;

  const regularPay = isSalaryOrComm ? Number(emp.rate) : Number(emp.rate) * Number(emp.hours);
  const overtimeRate = isSalaryOrComm ? 0 : Number(emp.rate) * 1.5;
  const overtimePay = overtimeRate * (Number(emp.overtimeHours) || 0);
  const mealPenaltyPay = (Number(emp.mealPenalties) || 0) * (isSalaryOrComm ? 0 : Number(emp.rate));
  const tips = Number(emp.tips) || 0;
  const grossPay = Math.round((regularPay + overtimePay + mealPenaltyPay + tips) * 100) / 100;

  if (is1099) {
    return {
      ...emp,
      regularPay,
      overtimePay: 0,
      mealPenaltyPay: 0,
      tips: 0,
      grossPay,
      preTax401k: 0,
      taxableWages: grossPay,
      eeSocialSecurity: 0,
      eeMedicare: 0,
      fedIncomeTax: 0,
      stateIncomeTax: 0,
      stateSdi: 0,
      totalEmployeeTaxes: 0,
      netPay: grossPay,
      erSocialSecurity: 0,
      erMedicare: 0,
      erFuta: 0,
      erSui: 0,
      erWorkersComp: 0,
      erFicaTipCredit: 0,
      totalEmployerTaxes: 0,
      totalBurdenedCost: grossPay
    };
  }

  const preTax401k = Math.min(grossPay * 0.5, Number(emp.preTax401k) || 0);
  const taxableIncomeWages = Math.max(0, grossPay - preTax401k);

  const eeSocialSecurity = isClergy ? 0 : Math.round(grossPay * 0.062 * 100) / 100;
  const eeMedicare = isClergy ? 0 : Math.round(grossPay * 0.0145 * 100) / 100;
  const fedIncomeTax = isClergy ? 0 : Math.round(taxableIncomeWages * 0.115 * 100) / 100;
  const stateIncomeTax = isClergy || preset.state === 'TX' ? 0 : Math.round(taxableIncomeWages * 0.042 * 100) / 100;
  const stateSdi = isClergy || preset.state === 'TX' ? 0 : Math.round(grossPay * 0.011 * 100) / 100;

  const totalEmployeeTaxes = Math.round((eeSocialSecurity + eeMedicare + fedIncomeTax + stateIncomeTax + stateSdi) * 100) / 100;
  const netPay = Math.round((grossPay - preTax401k - totalEmployeeTaxes) * 100) / 100;

  const erSocialSecurity = isClergy ? 0 : Math.round(grossPay * 0.062 * 100) / 100;
  const erMedicare = isClergy ? 0 : Math.round(grossPay * 0.0145 * 100) / 100;
  const erFuta = isClergy ? 0 : Math.round(Math.min(grossPay, 500) * 0.006 * 100) / 100;
  const erSui = isClergy ? 0 : Math.round(Math.min(grossPay, 900) * (preset.suiRate || 0.025) * 100) / 100;
  const erWorkersComp = Math.round(grossPay * (preset.wcRate || 0.015) * 100) / 100;
  const erFicaTipCredit = tips > 0 ? Math.round(tips * 0.0765 * 100) / 100 : 0;

  const totalEmployerTaxes = Math.round((erSocialSecurity + erMedicare + erFuta + erSui + erWorkersComp) * 100) / 100;
  const totalBurdenedCost = Math.round((grossPay + totalEmployerTaxes) * 100) / 100;

  return {
    ...emp,
    regularPay,
    overtimePay,
    mealPenaltyPay,
    tips,
    grossPay,
    preTax401k,
    taxableWages: taxableIncomeWages,
    eeSocialSecurity,
    eeMedicare,
    fedIncomeTax,
    stateIncomeTax,
    stateSdi,
    totalEmployeeTaxes,
    netPay,
    erSocialSecurity,
    erMedicare,
    erFuta,
    erSui,
    erWorkersComp,
    erFicaTipCredit,
    totalEmployerTaxes,
    totalBurdenedCost
  };
}

export function computePayRunSummary(state) {
  const preset = payrollPresets.find(p => p.id === state.activePresetId) || payrollPresets[0];
  const stubs = state.payRun.employees.map(emp => computeEmployeePaystub(emp, preset));
  const bank = sponsorBanks.find(b => b.id === state.payRun.sponsorBankId) || sponsorBanks[0];
  const perTxFee = state.payRun.rail === 'fednow' ? bank.fednowFee : bank.achFee;

  const totals = stubs.reduce((acc, s) => {
    acc.grossPay += s.grossPay;
    acc.tips += s.tips;
    acc.mealPenaltyPay += s.mealPenaltyPay;
    acc.preTax401k += s.preTax401k;
    acc.totalEmployeeTaxes += s.totalEmployeeTaxes;
    acc.netPay += s.netPay;
    acc.totalEmployerTaxes += s.totalEmployerTaxes;
    acc.erWorkersComp += s.erWorkersComp;
    acc.erFicaTipCredit += s.erFicaTipCredit;
    acc.totalBurdenedCost += s.totalBurdenedCost;
    acc.eftpsDeposit += (s.eeSocialSecurity + s.eeMedicare + s.fedIncomeTax + s.erSocialSecurity + s.erMedicare + s.erFuta);
    acc.stateTaxDeposit += (s.stateIncomeTax + s.stateSdi + s.erSui);
    return acc;
  }, {
    grossPay: 0,
    tips: 0,
    mealPenaltyPay: 0,
    preTax401k: 0,
    totalEmployeeTaxes: 0,
    netPay: 0,
    totalEmployerTaxes: 0,
    erWorkersComp: 0,
    erFicaTipCredit: 0,
    totalBurdenedCost: 0,
    eftpsDeposit: 0,
    stateTaxDeposit: 0
  });

  Object.keys(totals).forEach(k => {
    totals[k] = Math.round(totals[k] * 100) / 100;
  });

  const railFeeTotal = Math.round(stubs.length * perTxFee * 100) / 100;

  return {
    preset,
    bank,
    stubs,
    totals,
    railFeeTotal
  };
}

export function executePayRunAndPostBooks(state, now = new Date()) {
  const summary = computePayRunSummary(state);
  const batchId = `PR-${summary.preset.id.toUpperCase()}-${String(state.achBatches.length + 1).padStart(3, '0')}`;
  const traceNumber = `12114543${String(100000 + state.achBatches.length * 17)}`;

  const batch = {
    id: batchId,
    employer: summary.preset.employer,
    vertical: summary.preset.vertical,
    periodEnding: state.payRun.periodEnding,
    checkDate: state.payRun.checkDate,
    sponsorBank: summary.bank.name,
    rail: state.payRun.rail === 'fednow' ? 'FedNow Instant Credit ($0.045/tx)' : 'NACHA PPD/CCD Direct Deposit ($0.10–$0.15/tx)',
    traceNumber,
    payeeCount: summary.stubs.length,
    grossPay: summary.totals.grossPay,
    netDirectDeposit: summary.totals.netPay,
    eftpsTaxImpound: summary.totals.eftpsDeposit,
    stateTaxImpound: summary.totals.stateTaxDeposit,
    totalEmployerTaxes: summary.totals.totalEmployerTaxes,
    ficaTipCredit: summary.totals.erFicaTipCredit,
    railFeeTotal: summary.railFeeTotal,
    status: 'Settled & Reconciled ($0.00 Variance)',
    createdAt: now.toISOString()
  };

  state.achBatches.unshift(batch);

  const lines = [
    {account: '6100 Gross Wages & Salaries Expense', debit: summary.totals.grossPay, credit: 0},
    {account: '6150 Employer Payroll Taxes & Workers Comp', debit: summary.totals.totalEmployerTaxes, credit: 0},
    {account: '6190 Sponsor Bank Direct-Deposit Rail Fee', debit: summary.railFeeTotal, credit: 0},
    {account: '2110 Federal EFTPS 941/940 Tax Liability', debit: 0, credit: summary.totals.eftpsDeposit},
    {account: '2120 State PIT/SDI/SUI Tax Liability', debit: 0, credit: summary.totals.stateTaxDeposit},
    {account: '2130 401(k) & Workers Comp Accrued Liability', debit: 0, credit: Math.round((summary.totals.preTax401k + summary.totals.erWorkersComp) * 100) / 100},
    {account: '1010 Operating Checking (Net Direct Deposit + Rail Fee)', debit: 0, credit: Math.round((summary.totals.netPay + summary.railFeeTotal) * 100) / 100}
  ];

  const totalDebits = Math.round(lines.reduce((s, l) => s + l.debit, 0) * 100) / 100;
  const totalCredits = Math.round(lines.reduce((s, l) => s + l.credit, 0) * 100) / 100;

  const journal = {
    id: `JE-${batchId}`,
    batchId,
    vertical: summary.preset.vertical,
    employer: summary.preset.employer,
    date: state.payRun.checkDate,
    lines,
    totalDebits,
    totalCredits,
    variance: Math.round((totalDebits - totalCredits) * 100) / 100
  };

  state.journals.unshift(journal);
  audit(state, `Originated payroll batch ${batchId} (${money(summary.totals.grossPay)} gross / ${money(summary.totals.netPay)} net) and posted balanced journal ${journal.id} ($0.00 variance)`, now);
  return {batch, journal};
}

export function evaluateComplianceLab(state) {
  const c = state.compliance;
  const shiftHours = Number(c.mealBreakShiftHours) || 0;
  const breakMinute = Number(c.mealBreakTakenMinute) || 0;
  const baseRate = Number(c.hourlyBaseRate) || 0;
  const diff = Number(c.shiftDifferential) || 0;
  const regularRateOfPay = Math.round((baseRate + diff) * 100) / 100;

  // Under CA Labor Code 226.7 & Brinker, first meal period must begin before end of 5th hour (minute 300) if shift > 5 hours
  const violation = shiftHours > 5 && breakMinute >= 300;
  const alertMinute = 255; // 4h 15m proactive alert
  const penaltyOwed = violation ? regularRateOfPay : 0;

  // IRS Form 8846 (IRC 45B) FICA Tip Credit calculation
  const tippedHours = Number(c.tippedHoursWorked) || 0;
  const reportedTips = Number(c.reportedTips) || 0;
  const cashWage = Number(c.hourlyCashWagePaid) || 0;
  const federalTipBaseline = 5.15;
  const nonCreditablePerHour = Math.max(0, federalTipBaseline - cashWage);
  const creditableTips = Math.max(0, reportedTips - tippedHours * nonCreditablePerHour);
  const form8846Credit = Math.round(creditableTips * 0.0765 * 100) / 100;

  return {
    shiftHours,
    breakMinute,
    regularRateOfPay,
    violation,
    alertMinute,
    penaltyOwed,
    creditableTips,
    form8846Credit
  };
}

export function trialBalance(state) {
  const totalDebits = Math.round(state.journals.reduce((s, j) => s + j.totalDebits, 0) * 100) / 100;
  const totalCredits = Math.round(state.journals.reduce((s, j) => s + j.totalCredits, 0) * 100) / 100;
  return {
    totalDebits,
    totalCredits,
    variance: Math.round((totalDebits - totalCredits) * 100) / 100,
    balanced: Math.abs(totalDebits - totalCredits) < 0.005
  };
}

export function saveState(state, storage) {
  if (!storage) return false;
  try {
    storage.setItem(STATE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadState(storage) {
  if (!storage) return createState();
  try {
    const raw = storage.getItem(STATE_KEY);
    if (!raw) return createState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createState();
    return {...createState(parsed.activePresetId), ...parsed};
  } catch {
    return createState();
  }
}
