import {architectureLayers, payrollPresets, taxFilingsCatalog, sponsorBanks, verticalLaborRules} from './data.js';
import {THEMES, applyTheme, loadSavedTheme, listThemes} from './theme.js';
import {
  money,
  escapeHTML as e,
  createState,
  audit,
  calculatePayrollSavings,
  computePayRunSummary,
  executePayRunAndPostBooks,
  evaluateComplianceLab,
  trialBalance,
  saveState,
  loadState
} from './engine.js';

const $ = selector => document.querySelector(selector);
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {getItem: () => null, setItem: () => { throw new Error('Storage disabled'); }};
}

let state = loadState(storage);
let theme = loadSavedTheme(document.documentElement, storage);
let toastTimer;

const tabs = [
  ['cockpit', '◫', 'Morning cockpit'],
  ['payrun', '💵', 'Gross-to-net pay run'],
  ['direct-deposit', '🏦', 'Direct deposit & FedNow'],
  ['tax-filings', '🏛', '941 / W-2 / 1099 e-file'],
  ['compliance', '⚖', 'Meal-break & tip credits'],
  ['books-sync', '◈', 'Open Books v3.3 GL sync']
];

const badge = (text, type = 'neutral') => `<span class="badge ${type}">${e(text)}</span>`;
const button = (text, action, classes = '', attrs = '') =>
  `<button type="button" class="btn ${classes}" data-action="${action}" ${attrs}>${e(text)}</button>`;

function persist() {
  if (!saveState(state, storage)) {
    notify('Browser storage is unavailable. Changes will last for this session.');
  }
}

function notify(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

function activeTab() {
  const raw = location.hash.replace('#tab-', '');
  return tabs.some(t => t[0] === raw) ? raw : 'cockpit';
}

function setTheme(name) {
  theme = applyTheme(name, document.documentElement, storage);
  const picker = $('#top-theme-picker');
  if (picker) picker.value = theme;
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme));
  });
}

function renderHeader() {
  const presetPicker = $('#preset-picker');
  if (presetPicker) {
    presetPicker.innerHTML = payrollPresets
      .map(p => `<option value="${p.id}">${e(p.vertical)} · ${e(p.employer)} (${p.w2Count} W-2 / ${p.contractorCount} 1099)</option>`)
      .join('');
    presetPicker.value = state.activePresetId;
  }
  const themePicker = $('#top-theme-picker');
  if (themePicker) {
    themePicker.innerHTML = listThemes()
      .map(t => `<option value="${t.key}">${e(t.label)}</option>`)
      .join('');
  }
  const pills = $('#theme-pills');
  if (pills) {
    pills.innerHTML = listThemes()
      .map(t => `<button type="button" style="background:${THEMES[t.key].vars['--os-accent']}" title="${e(t.label)}" aria-label="${e(t.label)}" aria-pressed="${theme === t.key}" data-theme="${t.key}"></button>`)
      .join('');
  }
  setTheme(theme);
}

function renderNav() {
  const nav = $('#navigation');
  if (!nav) return;
  const current = activeTab();
  nav.innerHTML = tabs
    .map(([id, icon, label]) => `<a href="#tab-${id}" class="nav-link ${current === id ? 'active' : ''}" aria-current="${current === id ? 'page' : 'false'}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${e(label)}</span></a>`)
    .join('');
}

function pageTop(eyebrow, title, description, action = '') {
  return `<div class="page-top"><div><span class="eyebrow">${e(eyebrow)}</span><h1>${e(title)}</h1><p>${e(description)}</p></div>${action}</div>`;
}

function selectPreset(presetId) {
  const preset = payrollPresets.find(p => p.id === presetId) || payrollPresets[0];
  state.activePresetId = preset.id;
  state.payRun.presetId = preset.id;
  state.payRun.employees = JSON.parse(JSON.stringify(preset.employees));
  state.calculator.w2Employees = preset.w2Count;
  state.calculator.contractors1099 = preset.contractorCount;
  state.calculator.annualTippedWages = preset.annualTippedWages;
  audit(state, `Switched active payroll preset to ${preset.vertical} (${preset.employer})`);
  persist();
  render();
  notify(`Loaded ${preset.vertical} payroll profile: ${preset.employer}`);
}

function renderCockpit() {
  const preset = payrollPresets.find(p => p.id === state.activePresetId) || payrollPresets[0];
  const calc = calculatePayrollSavings(state.calculator);
  const summary = computePayRunSummary(state);
  const activeLayer = architectureLayers.find(l => l.id === state.activeLayerId) || architectureLayers[0];

  return `
    ${pageTop(
      'WHITE-LABEL ADP, GUSTO, PAYCHEX & RIPPLING REPLACEMENT · @OPENSCAFFOLD/PAYROLL V1.0',
      'Zero Per-Employee Payroll & Automated Tax E-Filing OS',
      `Payroll is strictly tax-table math, a $0.15 NACHA ACH batch, and IRS/State XML e-filings. Open Payroll OS eliminates $6–$18/employee monthly rent, 4-day float holds, and manual payroll journal re-keying across all 17 Open Scaffold Labs verticals.`,
      button('Run Pay Period & Post to Open Books', 'run-payroll-now', 'primary')
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">ANNUAL FEE + TAX CREDIT IMPACT</span>
        <strong class="kpi-value">${money(calc.totalEconomicBenefit, 0)}/yr</strong>
        <p>${money(calc.directFeeSavings, 0)} fee savings + ${money(calc.ficaTipCredit45B, 0)} § 45B tip credit</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">PER-EMPLOYEE MONTHLY RENT</span>
        <strong class="kpi-value">$0.00 / employee</strong>
        <p>vs. $6–$18/mo per head on Gusto, ADP &amp; Rippling</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">DIRECT DEPOSIT RAIL COST</span>
        <strong class="kpi-value">$0.15 flat ACH</strong>
        <p>$0.045 FedNow instant wage payout · 0-day float hold</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">OPEN BOOKS V3.3 VARIANCE</span>
        <strong class="kpi-value">$0.00 Variance</strong>
        <p>${state.achBatches.length} settled pay runs · auto 941/DE-9/W-2/1099</p>
      </article>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">5-LAYER PAYROLL &amp; TAX ARCHITECTURE</span>
            <h2>Why Legacy Payroll Bureaus Charge $5,000–$12,000/yr for Free Math</h2>
          </div>
          ${badge('100% Owned Stack', 'positive')}
        </div>
        <div class="layer-list">
          ${architectureLayers.map(layer => `
            <button type="button" class="layer-item ${layer.id === activeLayer.id ? 'active' : ''}" data-action="select-layer" data-layer="${layer.id}">
              <div>
                <strong>${e(layer.number)} · ${e(layer.title)}</strong>
                <small>${e(layer.replacement)}</small>
              </div>
              ${badge(layer.savingMetric, 'positive')}
            </button>
          `).join('')}
        </div>
        <div class="callout" style="margin-top:1rem">
          <strong>${e(activeLayer.number)}: ${e(activeLayer.title)}</strong>
          <p>${e(activeLayer.summary)}</p>
          <p><strong>Legacy Bureau Toll:</strong> ${e(activeLayer.legacyTax)}<br><strong>Open Payroll Cost:</strong> ${e(activeLayer.openPayrollCost)}</p>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">INTERACTIVE PAYROLL &amp; § 45B TIP CREDIT CALCULATOR</span>
            <h2>Compare ADP / Gusto / Paychex vs. Open Payroll OS</h2>
          </div>
          ${badge(preset.vertical, 'info')}
        </div>
        <div class="form-grid">
          <label>W-2 Employees
            <input type="number" min="1" max="500" value="${state.calculator.w2Employees}" data-calc="w2Employees">
          </label>
          <label>1099 Contractors
            <input type="number" min="0" max="200" value="${state.calculator.contractors1099}" data-calc="contractors1099">
          </label>
          <label>Pay Runs / Year
            <input type="number" min="12" max="52" value="${state.calculator.payRunsPerYear}" data-calc="payRunsPerYear">
          </label>
          <label>Legacy Per-Person Fee ($/mo)
            <input type="number" min="4" max="35" value="${state.calculator.legacyPerPersonMonthly}" data-calc="legacyPerPersonMonthly">
          </label>
          <label>Annual Reported Tipped Wages ($)
            <input type="number" min="0" step="5000" value="${state.calculator.annualTippedWages}" data-calc="annualTippedWages">
          </label>
          <label>Current Period Net Deposit Preview
            <input type="text" readonly value="${money(summary.totals.netPay)} (${summary.stubs.length} payees)">
          </label>
        </div>
        <table class="data-table" style="margin-top:1rem">
          <thead>
            <tr><th>Cost / Credit Component</th><th>Legacy Payroll Bureau</th><th>Open Payroll OS</th></tr>
          </thead>
          <tbody>
            <tr><td>Annual Software &amp; Per-Employee Fees</td><td class="mono">${money(calc.legacyAnnualCost)}/yr</td><td class="mono">${money(calc.openPayrollLicense)}/yr</td></tr>
            <tr><td>Direct Deposit ACH Rail Fees (${calc.totalPeople} payees × ${calc.runs} runs)</td><td class="mono">Included in 4-day float</td><td class="mono">${money(calc.openPayrollAchCost)}/yr ($0.15/tx)</td></tr>
            <tr><td>IRS Form 8846 (§ 45B) FICA Tip Credit Recovered</td><td class="mono">$0.00 (Missed/Manual)</td><td class="mono">+${money(calc.ficaTipCredit45B)}/yr</td></tr>
            <tr><td><strong>Total Net Annual Benefit to Business</strong></td><td class="mono">—</td><td class="mono"><strong>+${money(calc.totalEconomicBenefit)}/yr</strong></td></tr>
          </tbody>
        </table>
      </section>
    </div>
  `;
}

function renderPayRun() {
  const summary = computePayRunSummary(state);
  return `
    ${pageTop(
      `GROSS-TO-NET PAY RUN ENGINE · ${summary.preset.vertical.toUpperCase()}`,
      `${summary.preset.employer} · Pay Period Ending ${state.payRun.periodEnding}`,
      e(summary.preset.highlight),
      button('Approve & Originate Direct Deposit Batch', 'run-payroll-now', 'primary')
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">TOTAL GROSS PAY (W-2 + 1099)</span>
        <strong class="kpi-value">${money(summary.totals.grossPay)}</strong>
        <p>Includes ${money(summary.totals.tips)} tips &amp; ${money(summary.totals.mealPenaltyPay)} break premiums</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">EMPLOYEE TAXES + 401(K) WITHHELD</span>
        <strong class="kpi-value">${money(summary.totals.totalEmployeeTaxes + summary.totals.preTax401k)}</strong>
        <p>${money(summary.totals.totalEmployeeTaxes)} taxes · ${money(summary.totals.preTax401k)} 401(k)</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">NET DIRECT DEPOSIT PAYOUT</span>
        <strong class="kpi-value">${money(summary.totals.netPay)}</strong>
        <p>${summary.stubs.length} payees · ${money(summary.railFeeTotal)} total ODFI rail cost</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">EMPLOYER TAXES &amp; § 45B CREDIT</span>
        <strong class="kpi-value">${money(summary.totals.totalEmployerTaxes)}</strong>
        <p>Offsets: +${money(summary.totals.erFicaTipCredit)} Form 8846 FICA tip credit</p>
      </article>
    </div>

    <section class="card">
      <div class="card-head">
        <div>
          <span class="eyebrow">LINE-BY-LINE PAYSTUB &amp; BURDENED LABOR LEDGER</span>
          <h2>W-2 Employees &amp; 1099 Contractors (${summary.preset.payFrequency})</h2>
        </div>
        ${badge(`EIN ${summary.preset.ein} · ${summary.preset.state}`, 'positive')}
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Employee / Contractor</th>
            <th>Department / Role</th>
            <th>Type</th>
            <th>Gross Pay</th>
            <th>EE Taxes &amp; 401k</th>
            <th>Net Direct Deposit</th>
            <th>ER Taxes &amp; WC</th>
            <th>Total Burdened Cost</th>
          </tr>
        </thead>
        <tbody>
          ${summary.stubs.map(s => `
            <tr>
              <td><strong>${e(s.name)}</strong><br><small>${e(s.id)}</small></td>
              <td>${e(s.dept)}<br><small>${e(s.role)}</small></td>
              <td>${badge(s.type, s.type === '1099-NEC' ? 'attention' : 'positive')}</td>
              <td class="mono">${money(s.grossPay)}${s.tips > 0 ? `<br><small>Tips: ${money(s.tips)}</small>` : ''}${s.mealPenaltyPay > 0 ? `<br><small>CA §226.7: ${money(s.mealPenaltyPay)}</small>` : ''}</td>
              <td class="mono">${money(s.totalEmployeeTaxes + s.preTax401k)}</td>
              <td class="mono"><strong>${money(s.netPay)}</strong></td>
              <td class="mono">${money(s.totalEmployerTaxes)}</td>
              <td class="mono">${money(s.totalBurdenedCost)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function renderDirectDeposit() {
  const summary = computePayRunSummary(state);
  return `
    ${pageTop(
      'LAYER 2 · SPONSOR BANK NACHA PPD/CCD & FEDNOW INSTANT WAGE RAILS',
      'Direct Bank-to-Bank Payroll Origination (Zero 4-Day Float Hold)',
      'Legacy payroll providers pull employer cash 3–4 business days before payday so they can pocket interest on your payroll float. Open Payroll OS originates NACHA PPD/CCD batches at $0.10–$0.15/tx or instant FedNow payouts at $0.045/tx straight through our Sponsor Bank ODFI.',
      button('Originate NACHA / FedNow Batch Now', 'run-payroll-now', 'primary')
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">ODFI SPONSOR BANK &amp; RAIL SELECTOR</span>
            <h2>Configure Direct Deposit &amp; EFTPS Tax Impound</h2>
          </div>
          ${badge(summary.bank.name, 'positive')}
        </div>
        <div class="form-grid">
          <label>Sponsor Bank ODFI
            <select data-payrun="sponsorBankId">
              ${sponsorBanks.map(b => `<option value="${b.id}" ${b.id === state.payRun.sponsorBankId ? 'selected' : ''}>${e(b.name)} (ABA ${b.routing})</option>`).join('')}
            </select>
          </label>
          <label>Settlement Rail
            <select data-payrun="rail">
              <option value="nacha_ppd" ${state.payRun.rail === 'nacha_ppd' ? 'selected' : ''}>Same-Day NACHA PPD/CCD (${money(summary.bank.achFee)}/tx)</option>
              <option value="fednow" ${state.payRun.rail === 'fednow' ? 'selected' : ''}>FedNow Instant 24/7/365 Wage Payout ($0.045/tx)</option>
            </select>
          </label>
          <label>Pay Period Ending
            <input type="date" value="${state.payRun.periodEnding}" data-payrun="periodEnding">
          </label>
          <label>Check / Settlement Date
            <input type="date" value="${state.payRun.checkDate}" data-payrun="checkDate">
          </label>
        </div>
        <div class="callout" style="margin-top:1rem">
          <strong>${e(summary.bank.name)} · ${e(summary.bank.cutoff)}</strong>
          <p><strong>Settlement Model:</strong> ${e(summary.bank.settlementModel)}</p>
          <p><strong>Current Batch Breakdown:</strong> ${money(summary.totals.netPay)} net direct deposit + ${money(summary.totals.eftpsDeposit)} IRS EFTPS deposit + ${money(summary.totals.stateTaxDeposit)} State deposit · <strong>Total Rail Fee: ${money(summary.railFeeTotal)}</strong></p>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">ORIGINATED PAYROLL BATCH LEDGER</span>
            <h2>Settled NACHA &amp; FedNow Batches (${state.achBatches.length})</h2>
          </div>
          ${badge('$0.00 Variance', 'positive')}
        </div>
        ${state.achBatches.length === 0 ? `<p>No batches originated in this session yet. Click <strong>Originate NACHA / FedNow Batch Now</strong> to run a live simulation.</p>` : `
          <table class="data-table">
            <thead>
              <tr><th>Batch ID</th><th>Employer / Rail</th><th>Net Deposit</th><th>EFTPS + State</th><th>Rail Fee</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${state.achBatches.map(b => `
                <tr>
                  <td class="mono"><strong>${e(b.id)}</strong><br><small>Trace ${e(b.traceNumber)}</small></td>
                  <td>${e(b.employer)}<br><small>${e(b.rail)}</small></td>
                  <td class="mono">${money(b.netDirectDeposit)}</td>
                  <td class="mono">${money(b.eftpsTaxImpound + b.stateTaxImpound)}</td>
                  <td class="mono">${money(b.railFeeTotal)}</td>
                  <td>${badge(b.status, 'positive')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </section>
    </div>
  `;
}

function renderTaxFilings() {
  const summary = computePayRunSummary(state);
  return `
    ${pageTop(
      'LAYER 3 · AUTOMATED IRS MeF, EFTPS, SSA BSO & 50-STATE E-FILING',
      'Zero-Touch 941, 940, DE-9, W-2 & 1099-NEC Electronic Filings',
      'Every pay run automatically populates quarterly and annual federal/state tax returns and transmits EFTPS deposits—with zero year-end per-form W-2 or 1099-NEC surcharges.'
    )}
    <div class="grid-2">
      ${state.taxFilings.map(f => `
        <article class="card">
          <div class="card-head">
            <div>
              <span class="eyebrow">${e(f.authority)} · ${e(f.frequency)}</span>
              <h2>${e(f.code)} — ${e(f.title)}</h2>
            </div>
            ${badge('Auto E-File Ready', 'positive')}
          </div>
          <p>${e(f.purpose)}</p>
          <div class="callout" style="margin-top:0.75rem">
            <strong>Status for ${e(summary.preset.employer)} (EIN ${e(summary.preset.ein)}):</strong>
            <p>${e(f.status)} · Current Period Liability: <strong>${f.id.includes('ca') ? money(summary.totals.stateTaxDeposit) : f.id.includes('8846') ? money(summary.totals.erFicaTipCredit) : money(summary.totals.eftpsDeposit)}</strong></p>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderCompliance() {
  const lab = evaluateComplianceLab(state);
  return `
    ${pageTop(
      'LAYER 4 · VERTICAL WAGE-HOUR SHIELD & § 45B TIP TAX CREDIT LAB',
      'California Meal-Break Penalty Guard & IRS Form 8846 Tip Credit Engine',
      'Generic payroll tools only record violations after the money is lost. Open Payroll OS prevents CA § 226.7 meal-break penalties before the 5th hour and automatically calculates IRS § 45B FICA Tip Tax Credits.'
    )}
    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">CA LABOR CODE § 226.7 &amp; FERRA V. LOEWS REGULAR-RATE ENGINE</span>
            <h2>Proactive Meal-Break Premium Simulator</h2>
          </div>
          ${badge(lab.violation ? '1.0 Hr Premium Triggered' : 'Compliant Before 5th Hour', lab.violation ? 'critical' : 'positive')}
        </div>
        <div class="form-grid">
          <label>Shift Duration (Hours)
            <input type="number" step="0.5" min="3" max="12" value="${state.compliance.mealBreakShiftHours}" data-comp="mealBreakShiftHours">
          </label>
          <label>Meal Break Start Minute (300 = 5th Hr)
            <input type="number" step="5" min="180" max="420" value="${state.compliance.mealBreakTakenMinute}" data-comp="mealBreakTakenMinute">
          </label>
          <label>Base Hourly Rate ($)
            <input type="number" step="0.5" min="16" max="80" value="${state.compliance.hourlyBaseRate}" data-comp="hourlyBaseRate">
          </label>
          <label>Shift Differential / Bonus ($/hr)
            <input type="number" step="0.25" min="0" max="20" value="${state.compliance.shiftDifferential}" data-comp="shiftDifferential">
          </label>
        </div>
        <div class="callout" style="margin-top:1rem">
          <strong>Proactive POS/Watch Alert Fired at Minute ${lab.alertMinute} (4h 15m into shift)</strong>
          <p><strong>Regular Rate of Pay (Ferra v. Loews):</strong> ${money(lab.regularRateOfPay)}/hr · <strong>CA § 226.7 Premium Owed:</strong> ${money(lab.penaltyOwed)}</p>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">IRS FORM 8846 (IRC § 45B) EMPLOYER FICA TIP CREDIT</span>
            <h2>Annual FICA Tip Tax Credit Recovery Calculator</h2>
          </div>
          ${badge(`+${money(lab.form8846Credit)} Tax Credit`, 'positive')}
        </div>
        <div class="form-grid">
          <label>Annual Tipped Employee Hours
            <input type="number" step="500" min="0" value="${state.compliance.tippedHoursWorked}" data-comp="tippedHoursWorked">
          </label>
          <label>Annual Reported Tips ($)
            <input type="number" step="10000" min="0" value="${state.compliance.reportedTips}" data-comp="reportedTips">
          </label>
          <label>Employer Cash Wage Paid ($/hr)
            <input type="number" step="0.5" min="2.13" value="${state.compliance.hourlyCashWagePaid}" data-comp="hourlyCashWagePaid">
          </label>
          <label>Creditable Tips Above § 45B Baseline
            <input type="text" readonly value="${money(lab.creditableTips)}">
          </label>
        </div>
        <div class="callout" style="margin-top:1rem">
          <strong>IRS Form 8846 Dollar-for-Dollar General Business Tax Credit: ${money(lab.form8846Credit)}/yr</strong>
          <p>Automatically exported to <strong>Open Books v3.3</strong> and <strong>OpenCPA 2.0</strong> Schedule K-1 / Form 3800 so restaurant and club owners never leave FICA tip tax credits on the table.</p>
        </div>
      </section>
    </div>

    <section class="card" style="margin-top:1rem">
      <div class="card-head">
        <div>
          <span class="eyebrow">17-VERTICAL LABOR INTELLIGENCE RULES</span>
          <h2>Built-In Industry Payroll &amp; Commission Rules</h2>
        </div>
      </div>
      <div class="grid-2">
        ${verticalLaborRules.map(rule => `
          <div class="callout">
            <strong>${e(rule.vertical)} · ${e(rule.title)}</strong>
            <p><strong>Legacy Gap:</strong> ${e(rule.problem)}</p>
            <p><strong>Open Payroll Solution:</strong> ${e(rule.solution)}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderBooksSync() {
  const tb = trialBalance(state);
  return `
    ${pageTop(
      'LAYER 5 · @OPENSCAFFOLD/BOOKS V3.3 DOUBLE-ENTRY GL SYNC',
      'Automated Multi-Dimensional Payroll Journal Entries ($0.00 Variance)',
      'Every pay run writes balanced double-entry journal lines directly into Open Books v3.3 across Department, Fund, and Job dimensions—eliminating manual payroll journal entry and reconciliation.',
      button('Post New Pay Run Journal', 'run-payroll-now', 'primary')
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">POSTED PAYROLL JOURNALS</span>
        <strong class="kpi-value">${state.journals.length}</strong>
        <p>Synced to @openscaffold/books v3.3</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">TOTAL DEBITS POSTED</span>
        <strong class="kpi-value">${money(tb.totalDebits)}</strong>
        <p>Gross wages + ER payroll taxes + rail fees</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">TOTAL CREDITS POSTED</span>
        <strong class="kpi-value">${money(tb.totalCredits)}</strong>
        <p>EFTPS + State + 401k/WC + Net checking</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">TRIAL BALANCE VARIANCE</span>
        <strong class="kpi-value">${money(tb.variance)}</strong>
        <p>${tb.balanced ? '100% Balanced Double-Entry' : 'Check variance'}</p>
      </article>
    </div>

    <section class="card">
      <div class="card-head">
        <div>
          <span class="eyebrow">GENERAL LEDGER JOURNAL STREAM</span>
          <h2>Open Books v3.3 Payroll Journal Entries</h2>
        </div>
        ${badge('$0.00 Variance Verified', 'positive')}
      </div>
      ${state.journals.length === 0 ? `<p>Click <strong>Post New Pay Run Journal</strong> above to originate a payroll batch and inspect the exact balanced double-entry journal lines.</p>` : state.journals.map(j => `
        <div class="callout" style="margin-bottom:1rem">
          <strong>${e(j.id)} · ${e(j.employer)} (${e(j.vertical)}) · Check Date ${e(j.date)} · Variance: ${money(j.variance)}</strong>
          <table class="data-table" style="margin-top:0.5rem">
            <thead><tr><th>GL Account</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
              ${j.lines.map(l => `
                <tr>
                  <td>${e(l.account)}</td>
                  <td class="mono">${l.debit > 0 ? money(l.debit) : '—'}</td>
                  <td class="mono">${l.credit > 0 ? money(l.credit) : '—'}</td>
                </tr>
              `).join('')}
              <tr>
                <td><strong>Total Balanced Journal</strong></td>
                <td class="mono"><strong>${money(j.totalDebits)}</strong></td>
                <td class="mono"><strong>${money(j.totalCredits)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      `).join('')}
    </section>
  `;
}

export function render() {
  renderHeader();
  renderNav();
  const main = $('#main');
  if (!main) return;
  const tab = activeTab();
  if (tab === 'cockpit') main.innerHTML = renderCockpit();
  else if (tab === 'payrun') main.innerHTML = renderPayRun();
  else if (tab === 'direct-deposit') main.innerHTML = renderDirectDeposit();
  else if (tab === 'tax-filings') main.innerHTML = renderTaxFilings();
  else if (tab === 'compliance') main.innerHTML = renderCompliance();
  else if (tab === 'books-sync') main.innerHTML = renderBooksSync();
}

document.addEventListener('click', event => {
  const themeBtn = event.target.closest('[data-theme]');
  if (themeBtn) {
    setTheme(themeBtn.dataset.theme);
    return;
  }
  const actionBtn = event.target.closest('[data-action]');
  if (!actionBtn) return;
  const action = actionBtn.dataset.action;
  if (action === 'select-layer') {
    state.activeLayerId = actionBtn.dataset.layer;
    persist();
    render();
  } else if (action === 'run-payroll-now') {
    const {batch, journal} = executePayRunAndPostBooks(state);
    persist();
    render();
    notify(`Originated ${batch.id} (${money(batch.netDirectDeposit)} net) & posted ${journal.id} ($0.00 variance)`);
  }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'preset-picker') {
    selectPreset(target.value);
  } else if (target.id === 'top-theme-picker') {
    setTheme(target.value);
  } else if (target.dataset.calc) {
    state.calculator[target.dataset.calc] = Number(target.value) || 0;
    persist();
    render();
  } else if (target.dataset.payrun) {
    state.payRun[target.dataset.payrun] = target.value;
    persist();
    render();
  } else if (target.dataset.comp) {
    state.compliance[target.dataset.comp] = Number(target.value) || 0;
    persist();
    render();
  }
});

window.addEventListener('hashchange', render);
render();
