import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState,
  calculatePayrollSavings,
  computeEmployeePaystub,
  computePayRunSummary,
  executePayRunAndPostBooks,
  evaluateComplianceLab,
  trialBalance,
  computeSplitDepositBreakdown,
  provisionOpenPayrollWalletCard,
  connectWorkerNeobankRouting,
  updateWorkerSplitDeposit,
  pushInstantShiftTips,
  sendBilingualWhatsappPaystub,
  findFreeAtmsByZip,
  generateWorkerCashOutPass,
  saveState,
  loadState
} from '../js/engine.js';
import {
  architectureLayers,
  payrollPresets,
  taxFilingsCatalog,
  sponsorBanks,
  neobankRoutingCatalog,
  remittanceCorridors,
  openPayrollCardDisclosures,
  memberBankBranches,
  retailBarcodeMerchants,
  freeAtmDirectory,
  unbankedRelationalSchema
} from '../js/data.js';
import {THEMES, listThemes} from '../js/theme.js';

test('1. architectureLayers defines all 5 layers of Open Payroll OS', () => {
  assert.equal(architectureLayers.length, 5);
  assert.ok(architectureLayers[0].title.includes('Gross-to-Net'));
  assert.ok(architectureLayers[4].title.includes('OpenScaffold') || architectureLayers[4].title.includes('books'));
});

test('2. payrollPresets includes 6 core vertical profiles with valid EIN and employees', () => {
  assert.equal(payrollPresets.length, 6);
  for (const p of payrollPresets) {
    assert.ok(p.id);
    assert.ok(p.employer);
    assert.ok(p.employees.length >= 2);
  }
});

test('3. calculatePayrollSavings computes direct fee savings and IRS Form 8846 (45B) FICA tip credit', () => {
  const state = createState('restaurant');
  const res = calculatePayrollSavings(state.calculator);
  assert.equal(res.totalPeople, 52);
  assert.ok(res.legacyAnnualCost > 8000);
  assert.equal(res.openPayrollLicense, 299);
  assert.ok(res.ficaTipCredit45B > 50000);
  assert.equal(res.totalEconomicBenefit, res.directFeeSavings + res.ficaTipCredit45B);
});

test('4. computeEmployeePaystub handles W-2 hourly overtime and CA 226.7 meal penalty accurately', () => {
  const preset = payrollPresets.find(p => p.id === 'restaurant');
  const cook = preset.employees.find(e => e.id === 'EMP-102');
  const stub = computeEmployeePaystub(cook, preset);
  assert.equal(stub.regularPay, 26.50 * 80);
  assert.equal(stub.overtimePay, 26.50 * 1.5 * 4);
  assert.equal(stub.mealPenaltyPay, 26.50 * 1);
  assert.ok(stub.netPay > 0 && stub.netPay < stub.grossPay);
});

test('5. computeEmployeePaystub handles 1099-NEC contractor with zero W-2 withholding', () => {
  const preset = payrollPresets.find(p => p.id === 'restaurant');
  const contractor = preset.employees.find(e => e.id === 'CON-201');
  const stub = computeEmployeePaystub(contractor, preset);
  assert.equal(stub.grossPay, 850);
  assert.equal(stub.totalEmployeeTaxes, 0);
  assert.equal(stub.totalEmployerTaxes, 0);
  assert.equal(stub.netPay, 850);
});

test('6. computeEmployeePaystub handles IRC 107 clergy housing allowance exemption', () => {
  const preset = payrollPresets.find(p => p.id === 'church');
  const pastor = preset.employees.find(e => e.id === 'EMP-601');
  const stub = computeEmployeePaystub(pastor, preset);
  assert.equal(stub.eeSocialSecurity, 0);
  assert.equal(stub.eeMedicare, 0);
  assert.equal(stub.fedIncomeTax, 0);
});

test('7. computePayRunSummary aggregates gross, net, EFTPS, and rail fees across all payees', () => {
  const state = createState('dentist');
  const summary = computePayRunSummary(state);
  assert.equal(summary.stubs.length, 5);
  assert.ok(summary.totals.grossPay > 20000);
  assert.ok(summary.totals.netPay > 15000);
  assert.equal(summary.railFeeTotal, 0.50);
});

test('8. executePayRunAndPostBooks creates settled batch and $0.00-variance double-entry journal', () => {
  const state = createState('restaurant');
  const {batch, journal} = executePayRunAndPostBooks(state);
  assert.equal(batch.id, 'PR-RESTAURANT-001');
  assert.equal(journal.variance, 0);
  assert.equal(journal.totalDebits, journal.totalCredits);
  const tb = trialBalance(state);
  assert.equal(tb.balanced, true);
  assert.equal(tb.variance, 0);
});

test('9. evaluateComplianceLab detects CA 226.7 meal-break violation and computes Ferra regular rate + Form 8846 credit', () => {
  const state = createState('restaurant');
  const res1 = evaluateComplianceLab(state);
  assert.equal(res1.violation, true);
  assert.equal(res1.regularRateOfPay, 26.50);
  assert.equal(res1.penaltyOwed, 26.50);
  assert.ok(res1.form8846Credit > 50000);

  state.compliance.mealBreakTakenMinute = 240;
  const res2 = evaluateComplianceLab(state);
  assert.equal(res2.violation, false);
  assert.equal(res2.penaltyOwed, 0);
});

test('10. taxFilingsCatalog and sponsorBanks contain all statutory forms and ODFI banks', () => {
  assert.equal(taxFilingsCatalog.length, 6);
  assert.equal(sponsorBanks.length, 3);
  assert.equal(listThemes().length, 4);
  assert.ok(THEMES['warm-editorial']);
});

test('11. saveState and loadState round-trip workspace state cleanly', () => {
  const mem = new Map();
  const storage = {
    getItem: k => mem.get(k) || null,
    setItem: (k, v) => mem.set(k, v)
  };
  const s = createState('landscape');
  executePayRunAndPostBooks(s);
  assert.equal(saveState(s, storage), true);
  const loaded = loadState(storage);
  assert.equal(loaded.activePresetId, 'landscape');
  assert.equal(loaded.achBatches.length, 1);
});

test('12. neobankRoutingCatalog, remittanceCorridors, and openPayrollCardDisclosures cover bilingual Hispanic unbanked rails', () => {
  assert.equal(neobankRoutingCatalog.length, 7);
  const ids = neobankRoutingCatalog.map(a => a.id);
  assert.deepEqual(ids, ['open_payroll_card', 'comun', 'seis', 'cashapp', 'chime', 'venmo', 'oportun']);
  assert.equal(neobankRoutingCatalog.find(a => a.id === 'comun').routing, '026014928');
  assert.equal(neobankRoutingCatalog.find(a => a.id === 'cashapp').routing, '041215663');
  assert.equal(remittanceCorridors.length, 3);
  assert.ok(remittanceCorridors[0].provider.includes('Félix Pago'));
  assert.equal(openPayrollCardDisclosures.feeSchedule.length, 6);
});

test('13. provisionOpenPayrollWalletCard and connectWorkerNeobankRouting update worker ACH routing & Reg E consent', () => {
  const state = createState('restaurant');
  const connected = connectWorkerNeobankRouting(state, 'EMP-102', 'comun', '5519');
  assert.equal(connected.emp.payoutMethod, 'comun');
  assert.equal(connected.emp.routingNumber, '026014928');
  assert.equal(connected.emp.accountLast4, '5519');

  const cardEmp = provisionOpenPayrollWalletCard(state, 'EMP-102');
  assert.equal(cardEmp.payoutMethod, 'open_payroll_card');
  assert.equal(cardEmp.routingNumber, '121145433');
  assert.equal(cardEmp.walletCardProvisioned, true);
  assert.ok(cardEmp.regEConsentTimestamp);
});

test('14. computeSplitDepositBreakdown and updateWorkerSplitDeposit reconcile net pay to the penny', () => {
  const state = createState('restaurant');
  const emp = updateWorkerSplitDeposit(state, 'EMP-102', 65, 25, 10);
  assert.equal(emp.splitSpendPct, 65);
  assert.equal(emp.splitRemitPct, 25);
  assert.equal(emp.splitSavePct, 10);

  const split = computeSplitDepositBreakdown(1843.67, emp);
  assert.equal(Math.round((split.spendAmount + split.remitAmount + split.saveAmount) * 100) / 100, 1843.67);
  assert.ok(split.checkCasherFeeSaved > 40);
  assert.equal(split.wireFeeSaved, 15.00);
});

test('15. pushInstantShiftTips settles <5s shift tips, increments Form 8846 (§ 45B) credit, and posts $0.00-variance GL journal', () => {
  const state = createState('restaurant');
  const res = pushInstantShiftTips(state, 'EMP-103', 200.00, 'visa_direct_oct');
  assert.equal(res.pushRecord.amount, 200.00);
  assert.equal(res.pushRecord.ficaTipCredit45B, 15.30);
  assert.equal(res.journal.variance, 0);
  const tb = trialBalance(state);
  assert.equal(tb.balanced, true);
  assert.equal(tb.variance, 0);
});

test('16. sendBilingualWhatsappPaystub delivers CA Labor Code § 226(a) & § 246(i) itemized wage statement in Español or English', () => {
  const state = createState('restaurant');
  state.unbanked.lang = 'es';
  const msg = sendBilingualWhatsappPaystub(state, 'EMP-102');
  assert.equal(msg.id, 'WA-STUB-001');
  assert.equal(msg.lang, 'es');
  assert.ok(msg.channel.includes('Español'));
  assert.equal(msg.sickHoursAvailable, 40.0);
});

test('17. Sacar Efectivo Gratis Path A generates $0-fee Exact-Penny Bank Teller OTC Cash Pass (Visa § 5.4.2.4 & CA § 212(a)(1))', () => {
  const state = createState('restaurant');
  const rec = generateWorkerCashOutPass(state, {
    employeeId: 'EMP-102',
    path: 'path_a_teller',
    tellerBankId: 'chase',
    tellerAmountMode: 'exact_net'
  });
  assert.equal(rec.cash_out_id, 'CSH-OTC-001');
  assert.equal(rec.cash_out_path, 'PATH_A_OTC_BANK_TELLER');
  assert.equal(rec.worker_fee, 0.00);
  assert.equal(rec.worker_fee_cents, 0);
  assert.ok(rec.exact_amount > 1000);
  assert.ok(rec.casa_de_cambio_fee_saved > 30);
  assert.ok(rec.teller_script_en.includes('Visa Core Rules § 5.4.2.4'));
  assert.ok(rec.worker_guide_es.includes('Muestra esta pantalla al cajero'));
  assert.equal(state.unbanked.cashOutTransactions.length, 1);
});

test('18. Sacar Efectivo Gratis Path B generates Retail Register Barcode Cash-Out ($0.00 sponsored or $1.00 flat pass-through)', () => {
  const state = createState('restaurant');
  const recFree = generateWorkerCashOutPass(state, {
    employeeId: 'EMP-102',
    path: 'path_b_barcode',
    barcodeMerchantId: 'walmart',
    barcodeAmountChoice: '500',
    barcodeFeeMode: 'employer_sponsored'
  });
  assert.equal(recFree.cash_out_id, 'CSH-BAR-001');
  assert.equal(recFree.cash_out_path, 'PATH_B_RETAIL_BARCODE');
  assert.equal(recFree.exact_amount, 500);
  assert.equal(recFree.worker_fee, 0.00);
  assert.ok(recFree.reference_or_barcode_token.startsWith('7942 '));

  const recPass = generateWorkerCashOutPass(state, {
    employeeId: 'EMP-102',
    path: 'path_b_barcode',
    barcodeMerchantId: '7eleven',
    barcodeAmountChoice: '200',
    barcodeFeeMode: 'network_passthrough'
  });
  assert.equal(recPass.exact_amount, 200);
  assert.equal(recPass.worker_fee, 1.00);
  assert.equal(recPass.worker_fee_cents, 100);
});

test('19. Sacar Efectivo Gratis Path C finds 55,000+ Free Allpoint/MoneyPass NFC ATMs by ZIP and logs $0.00 pickup', () => {
  const wcAtms = findFreeAtmsByZip('94596');
  assert.equal(wcAtms.length, 2);
  assert.ok(wcAtms[0].venue.includes('Target'));

  const concordAtms = findFreeAtmsByZip('94520');
  assert.equal(concordAtms.length, 2);

  const state = createState('restaurant');
  const recAtm = generateWorkerCashOutPass(state, {
    employeeId: 'EMP-102',
    path: 'path_c_atm',
    atmZipQuery: '94596'
  });
  assert.equal(recAtm.cash_out_id, 'CSH-ATM-001');
  assert.equal(recAtm.cash_out_path, 'PATH_C_ALLPOINT_NFC_ATM');
  assert.equal(recAtm.worker_fee, 0.00);
  assert.equal(unbankedRelationalSchema.length, 4);
  assert.deepEqual(
    unbankedRelationalSchema.map(t => t.table),
    ['WORKERS', 'WORKER_PAYOUT_DESTINATIONS', 'PAYCARD_ACCOUNTS', 'CASH_OUT_TRANSACTIONS']
  );
  assert.equal(memberBankBranches.length, 5);
  assert.equal(retailBarcodeMerchants.length, 5);
  assert.equal(freeAtmDirectory.length, 6);
});
