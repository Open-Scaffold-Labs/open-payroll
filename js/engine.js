import {
  clone,
  architectureLayers,
  payrollPresets,
  taxFilingsCatalog,
  sponsorBanks,
  verticalLaborRules,
  neobankRoutingCatalog,
  remittanceCorridors,
  memberBankBranches,
  retailBarcodeMerchants,
  freeAtmDirectory
} from './data.js';

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

export function defaultUnbankedEmployeeId(employees = []) {
  const esEmp = employees.find(e => e.lang === 'es');
  return (esEmp || employees[0] || {id: 'EMP-102'}).id;
}

export function createState(presetId = 'restaurant') {
  const preset = payrollPresets.find(p => p.id === presetId) || payrollPresets[0];
  const employees = clone(preset.employees);
  const selectedEmployeeId = defaultUnbankedEmployeeId(employees);
  const selectedEmp = employees.find(e => e.id === selectedEmployeeId) || employees[0];
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
      employees
    },
    unbanked: {
      lang: 'es',
      selectedEmployeeId,
      selectedAppId: selectedEmp?.payoutMethod || 'open_payroll_card',
      accountLast4Input: selectedEmp?.accountLast4 || '9042',
      instantTipAmount: 184.50,
      instantTipRail: 'visa_direct_oct',
      remittanceCorridorId: remittanceCorridors[0].id,
      cashOutPath: 'path_a_teller',
      tellerBankId: 'chase',
      tellerAmountMode: 'exact_net',
      tellerCustomAmount: 1143.62,
      barcodeMerchantId: 'walmart',
      barcodeAmountChoice: '500',
      barcodeFeeMode: 'employer_sponsored',
      atmZipQuery: '94596',
      tipPushes: [],
      whatsappStubs: [],
      cashOutTransactions: []
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

export function computeSplitDepositBreakdown(netPay, emp = {}) {
  const totalNet = Math.max(0, Number(netPay) || 0);
  const spendPct = Math.max(0, Math.min(100, Number(emp.splitSpendPct ?? 100)));
  const remitPct = Math.max(0, Math.min(100 - spendPct, Number(emp.splitRemitPct ?? 0)));
  const savePct = Math.max(0, 100 - spendPct - remitPct);

  const spendAmount = Math.round(totalNet * (spendPct / 100) * 100) / 100;
  const remitAmount = Math.round(totalNet * (remitPct / 100) * 100) / 100;
  const saveAmount = Math.round((totalNet - spendAmount - remitAmount) * 100) / 100;

  const checkCasherFeeSaved = Math.round(totalNet * 0.025 * 100) / 100;
  const wireFeeSaved = remitAmount > 0 ? 15.00 : 0;

  return {
    spendPct,
    remitPct,
    savePct,
    spendAmount,
    remitAmount,
    saveAmount,
    checkCasherFeeSaved,
    wireFeeSaved,
    totalWorkerFeesSavedPerPaycheck: Math.round((checkCasherFeeSaved + wireFeeSaved) * 100) / 100
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

  const appInfo = neobankRoutingCatalog.find(a => a.id === (emp.payoutMethod || 'open_payroll_card')) || neobankRoutingCatalog[0];

  if (is1099) {
    const split = computeSplitDepositBreakdown(grossPay, emp);
    return {
      ...emp,
      payoutAppName: appInfo.name,
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
      totalBurdenedCost: grossPay,
      split
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
  const split = computeSplitDepositBreakdown(netPay, emp);

  return {
    ...emp,
    payoutAppName: appInfo.name,
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
    totalBurdenedCost,
    split
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
    acc.workerFeesSaved += (s.split?.totalWorkerFeesSavedPerPaycheck || 0);
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
    stateTaxDeposit: 0,
    workerFeesSaved: 0
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

export function provisionOpenPayrollWalletCard(state, employeeId, now = new Date()) {
  const emp = state.payRun.employees.find(e => e.id === employeeId) || state.payRun.employees[0];
  if (!emp) return null;
  emp.payoutMethod = 'open_payroll_card';
  emp.routingNumber = '121145433';
  if (!emp.accountLast4) emp.accountLast4 = '9042';
  emp.walletCardProvisioned = true;
  emp.regEConsentTimestamp = now.toISOString();
  state.unbanked.selectedEmployeeId = emp.id;
  state.unbanked.selectedAppId = 'open_payroll_card';
  state.unbanked.accountLast4Input = emp.accountLast4;

  audit(
    state,
    `Provisioned Open Payroll Visa Wallet Card (Column N.A. FBO ABA 121145433 · •••• ${emp.accountLast4}) + Apple/Google Wallet token for ${emp.name} with CA § 213(d) & CFPB Reg E consent`,
    now
  );
  return emp;
}

export function connectWorkerNeobankRouting(state, employeeId, appId, accountLast4 = '4829', now = new Date()) {
  const emp = state.payRun.employees.find(e => e.id === employeeId) || state.payRun.employees[0];
  const app = neobankRoutingCatalog.find(a => a.id === appId) || neobankRoutingCatalog[0];
  if (!emp) return null;

  const cleanLast4 = String(accountLast4 || '4829').replace(/\D/g, '').slice(-4).padStart(4, '0');
  emp.payoutMethod = app.id;
  emp.routingNumber = app.routing;
  emp.accountLast4 = cleanLast4;

  state.unbanked.selectedEmployeeId = emp.id;
  state.unbanked.selectedAppId = app.id;
  state.unbanked.accountLast4Input = cleanLast4;

  audit(
    state,
    `Connected ${app.name} direct deposit (ABA ${app.routing} · Acct •••• ${cleanLast4}) for ${emp.name}`,
    now
  );
  return {emp, app};
}

export function updateWorkerSplitDeposit(state, employeeId, spendPct, remitPct, savePct, now = new Date()) {
  const emp = state.payRun.employees.find(e => e.id === employeeId) || state.payRun.employees[0];
  if (!emp) return null;
  const s = Math.max(0, Math.min(100, Math.round(Number(spendPct) || 0)));
  const r = Math.max(0, Math.min(100 - s, Math.round(Number(remitPct) || 0)));
  const v = Math.max(0, 100 - s - r);

  emp.splitSpendPct = s;
  emp.splitRemitPct = r;
  emp.splitSavePct = v;

  audit(
    state,
    `Updated Split Direct Deposit (Dividir Mi Pago) for ${emp.name}: ${s}% Daily Spend / ${r}% Family Remittance / ${v}% Emergency Savings`,
    now
  );
  return emp;
}

export function pushInstantShiftTips(state, employeeId, amount, rail = 'visa_direct_oct', now = new Date()) {
  const emp = state.payRun.employees.find(e => e.id === employeeId) || state.payRun.employees[0];
  const preset = payrollPresets.find(p => p.id === state.activePresetId) || payrollPresets[0];
  if (!emp) return null;

  const cleanAmount = Math.round(Math.max(1, Number(amount) || 0) * 100) / 100;
  emp.tips = Math.round(((Number(emp.tips) || 0) + cleanAmount) * 100) / 100;

  const app = neobankRoutingCatalog.find(a => a.id === (emp.payoutMethod || 'open_payroll_card')) || neobankRoutingCatalog[0];
  const ficaCreditIncrement = Math.round(cleanAmount * 0.0765 * 100) / 100;
  const railLabel = rail === 'fednow_instant'
    ? 'FedNow Instant Credit ($0.045/tx · <5s)'
    : 'Visa Direct / Mastercard Send OCT (<5s Apple/Google Wallet Push)';

  const pushId = `TIP-${preset.id.toUpperCase()}-${String(state.unbanked.tipPushes.length + 1).padStart(3, '0')}`;
  const pushRecord = {
    id: pushId,
    employeeId: emp.id,
    employeeName: emp.name,
    role: emp.role,
    destination: `${app.name} (•••• ${emp.accountLast4 || '9042'})`,
    rail: railLabel,
    amount: cleanAmount,
    ficaTipCredit45B: ficaCreditIncrement,
    settlementSeconds: 3.2,
    status: 'Settled in Wallet (<5s) · W-2 Box 7 Logged',
    createdAt: now.toISOString()
  };

  state.unbanked.tipPushes.unshift(pushRecord);

  const lines = [
    {account: '2160 Customer Credit-Card Tips Payable (CA § 351 Pool)', debit: cleanAmount, credit: 0},
    {account: '1015 Sponsor Bank Instant Tip Clearing (Visa Direct / FedNow)', debit: 0, credit: cleanAmount}
  ];
  const journal = {
    id: `JE-${pushId}`,
    batchId: pushId,
    vertical: preset.vertical,
    employer: preset.employer,
    date: state.payRun.checkDate,
    lines,
    totalDebits: cleanAmount,
    totalCredits: cleanAmount,
    variance: 0
  };
  state.journals.unshift(journal);

  audit(
    state,
    `Pushed ${money(cleanAmount)} instant end-of-shift tips to ${emp.name} via ${railLabel} (+${money(ficaCreditIncrement)} Form 8846 § 45B credit) & posted ${journal.id}`,
    now
  );

  return {pushRecord, journal};
}

export function sendBilingualWhatsappPaystub(state, employeeId, now = new Date()) {
  const summary = computePayRunSummary(state);
  const stub = summary.stubs.find(s => s.id === employeeId) || summary.stubs[0];
  if (!stub) return null;

  const lang = state.unbanked?.lang || stub.lang || 'es';
  const msgId = `WA-STUB-${String(state.unbanked.whatsappStubs.length + 1).padStart(3, '0')}`;
  const delivery = {
    id: msgId,
    employeeId: stub.id,
    employeeName: stub.name,
    lang,
    netPay: stub.netPay,
    grossPay: stub.grossPay,
    sickHoursAvailable: stub.sickHoursAvailable ?? 40.0,
    complianceStatute: 'CA Labor Code § 226(a) (9 Itemized Elements) & § 246(i) Paid Sick Leave',
    channel: lang === 'es' ? 'WhatsApp + SMS en Español' : 'WhatsApp + SMS in English',
    deliveredAt: now.toISOString()
  };

  state.unbanked.whatsappStubs.unshift(delivery);
  audit(
    state,
    `Delivered ${delivery.channel} itemized wage statement (${msgId} · Net ${money(stub.netPay)}) to ${stub.name} under CA Labor Code § 226(a)`,
    now
  );
  return delivery;
}

export function findFreeAtmsByZip(zipQuery = '94596') {
  const q = String(zipQuery || '').trim().toLowerCase();
  if (!q) return freeAtmDirectory;
  const matches = freeAtmDirectory.filter(
    atm => atm.zip.toLowerCase().includes(q) || atm.neighborhood.toLowerCase().includes(q) || atm.venue.toLowerCase().includes(q)
  );
  return matches.length > 0 ? matches : freeAtmDirectory;
}

export function generateWorkerCashOutPass(state, options = {}, now = new Date()) {
  const summary = computePayRunSummary(state);
  const employeeId = options.employeeId || state.unbanked?.selectedEmployeeId;
  const stub = summary.stubs.find(s => s.id === employeeId) || summary.stubs[0];
  const path = options.path || state.unbanked?.cashOutPath || 'path_a_teller';
  const seq = (state.unbanked?.cashOutTransactions?.length || 0) + 1;

  if (path === 'path_a_teller' || path === 'PATH_A_OTC_BANK_TELLER') {
    const bankId = options.tellerBankId || state.unbanked?.tellerBankId || 'chase';
    const bank = memberBankBranches.find(b => b.id === bankId) || memberBankBranches[0];
    const mode = options.tellerAmountMode || state.unbanked?.tellerAmountMode || 'exact_net';
    const exactAmount = mode === 'custom_penny'
      ? Math.round(Math.max(1, Number(options.amount ?? state.unbanked?.tellerCustomAmount ?? 1143.62)) * 100) / 100
      : stub.netPay;

    const exactAmountCents = Math.round(exactAmount * 100);
    const casaDeCambioFeeSaved = Math.round(exactAmount * 0.03 * 100) / 100;
    const token = `OTC-VISA-${String(481200 + seq * 19)}-${stub.accountLast4 || '9042'}`;

    const tellerScriptEn = `Hello Teller: Please process a $0-fee Visa Over-the-Counter (OTC) Manual Cash Disbursement for the exact amount of ${money(exactAmount)} from this Open Payroll Visa Debit Card (ending in ${stub.accountLast4 || '9042'}). Per Visa Core Rules § 5.4.2.4 and California Labor Code § 212(a)(1), no bank account at this branch is required.`;
    const workerGuideEs = `Muestra esta pantalla al cajero de ${bank.name} junto con tu identificación (Matrícula Consular, Pasaporte o ID) y tu tarjeta Open Payroll (•••• ${stub.accountLast4 || '9042'}). El cajero te entregará exactamente ${money(exactAmount)} en efectivo hasta el último centavo con $0.00 de comisión.`;

    const record = {
      cash_out_id: `CSH-OTC-${String(seq).padStart(3, '0')}`,
      worker_id: stub.id,
      worker_name: stub.name,
      paycard_last4: stub.accountLast4 || '9042',
      cash_out_path: 'PATH_A_OTC_BANK_TELLER',
      merchant_or_bank_name: bank.name,
      exact_amount: exactAmount,
      exact_amount_cents: exactAmountCents,
      worker_fee: 0.00,
      worker_fee_cents: 0,
      casa_de_cambio_fee_saved: casaDeCambioFeeSaved,
      casa_de_cambio_fee_saved_cents: Math.round(casaDeCambioFeeSaved * 100),
      reference_or_barcode_token: token,
      statutory_basis: 'CA Labor Code § 212(a)(1) & Visa Core Rules § 5.4.2.4',
      teller_script_en: tellerScriptEn,
      worker_guide_es: workerGuideEs,
      status: 'AUTHORIZED_READY',
      created_at: now.toISOString()
    };

    if (state.unbanked) {
      state.unbanked.cashOutTransactions.unshift(record);
    }
    audit(
      state,
      `Generated Path A Exact-Penny Bank Teller Cash Pass (${record.cash_out_id} · ${money(exactAmount)} · $0.00 fee at ${bank.name}) for ${stub.name}`,
      now
    );
    return record;
  }

  if (path === 'path_b_barcode' || path === 'PATH_B_RETAIL_BARCODE') {
    const merchantId = options.barcodeMerchantId || state.unbanked?.barcodeMerchantId || 'walmart';
    const merchant = retailBarcodeMerchants.find(m => m.id === merchantId) || retailBarcodeMerchants[0];
    const choice = String(options.barcodeAmountChoice ?? state.unbanked?.barcodeAmountChoice ?? '500');
    const rawAmount = choice === 'full'
      ? Math.min(stub.netPay, merchant.maxPerTx)
      : Math.min(Number(choice) || 200, stub.netPay, merchant.maxPerTx);
    const exactAmount = Math.round(Math.max(20, rawAmount) * 100) / 100;
    const feeMode = options.barcodeFeeMode || state.unbanked?.barcodeFeeMode || 'employer_sponsored';
    const workerFee = feeMode === 'network_passthrough' ? merchant.networkPassThroughFee : 0.00;
    const casaDeCambioFeeSaved = Math.round(Math.max(0, exactAmount * 0.035 - workerFee) * 100) / 100;
    const barcodeDigits = `7942 ${String(8810 + seq * 7).slice(0, 4)} ${String(4390 + seq * 13).slice(0, 4)} ${stub.accountLast4 || '9042'}`;

    const record = {
      cash_out_id: `CSH-BAR-${String(seq).padStart(3, '0')}`,
      worker_id: stub.id,
      worker_name: stub.name,
      paycard_last4: stub.accountLast4 || '9042',
      cash_out_path: 'PATH_B_RETAIL_BARCODE',
      merchant_or_bank_name: `${merchant.name} (${merchant.network})`,
      exact_amount: exactAmount,
      exact_amount_cents: Math.round(exactAmount * 100),
      worker_fee: workerFee,
      worker_fee_cents: Math.round(workerFee * 100),
      casa_de_cambio_fee_saved: casaDeCambioFeeSaved,
      casa_de_cambio_fee_saved_cents: Math.round(casaDeCambioFeeSaved * 100),
      reference_or_barcode_token: barcodeDigits,
      statutory_basis: 'CA Labor Code § 212(a)(1) · VanillaDirect / GreenDot Register Barcode',
      teller_script_en: merchant.instructionsEn,
      worker_guide_es: merchant.instructionsEs,
      status: 'BARCODE_ACTIVE_30MIN',
      created_at: now.toISOString()
    };

    if (state.unbanked) {
      state.unbanked.cashOutTransactions.unshift(record);
    }
    audit(
      state,
      `Generated Path B Retail Register Barcode (${record.cash_out_id} · ${barcodeDigits} · ${money(exactAmount)} at ${merchant.name} · Fee ${money(workerFee)}) for ${stub.name}`,
      now
    );
    return record;
  }

  const zipQuery = options.atmZipQuery || state.unbanked?.atmZipQuery || '94596';
  const atms = findFreeAtmsByZip(zipQuery);
  const atm = atms[0] || freeAtmDirectory[0];
  const exactAmount = Math.min(800, Math.floor(stub.netPay / 20) * 20 || 400);
  const casaDeCambioFeeSaved = Math.round(exactAmount * 0.03 * 100) / 100;
  const token = `NFC-ATM-${atm.zip}-${String(1000 + seq * 23)}`;

  const record = {
    cash_out_id: `CSH-ATM-${String(seq).padStart(3, '0')}`,
    worker_id: stub.id,
    worker_name: stub.name,
    paycard_last4: stub.accountLast4 || '9042',
    cash_out_path: 'PATH_C_ALLPOINT_NFC_ATM',
    merchant_or_bank_name: `${atm.venue} (${atm.address})`,
    exact_amount: exactAmount,
    exact_amount_cents: Math.round(exactAmount * 100),
    worker_fee: 0.00,
    worker_fee_cents: 0,
    casa_de_cambio_fee_saved: casaDeCambioFeeSaved,
    casa_de_cambio_fee_saved_cents: Math.round(casaDeCambioFeeSaved * 100),
    reference_or_barcode_token: token,
    statutory_basis: 'CFPB Reg E (12 CFR § 1005.18) · 55,000+ Free Allpoint / MoneyPass NFC ATMs',
    teller_script_en: `Tap Apple Pay / Google Wallet at ${atm.venue} (${atm.address}) for $0.00-fee cash withdrawal up to $${atm.dailyLimit}/day.`,
    worker_guide_es: `Acerca tu celular con Apple Pay / Google Wallet al lector sin contacto del cajero ${atm.venue} (${atm.address}) para retirar hasta $${atm.dailyLimit}/día con $0.00 de comisión.`,
    status: 'NFC_READY_0_FEE',
    created_at: now.toISOString()
  };

  if (state.unbanked) {
    state.unbanked.cashOutTransactions.unshift(record);
  }
  audit(
    state,
    `Generated Path C Free Allpoint/MoneyPass NFC ATM Pass (${record.cash_out_id} · ${money(exactAmount)} at ${atm.venue} · $0.00 fee) for ${stub.name}`,
    now
  );
  return record;
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

  const violation = shiftHours > 5 && breakMinute >= 300;
  const alertMinute = 255;
  const penaltyOwed = violation ? regularRateOfPay : 0;

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
    const base = createState(parsed.activePresetId);
    return {
      ...base,
      ...parsed,
      unbanked: {
        ...base.unbanked,
        ...(parsed.unbanked || {})
      }
    };
  } catch {
    return createState();
  }
}
