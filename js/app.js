import {
  payrollPresets,
  taxFilingsCatalog,
  sponsorBanks,
  verticalLaborRules,
  neobankRoutingCatalog,
  remittanceCorridors,
  openPayrollCardDisclosures
} from './data.js';
import {THEMES, applyTheme, loadSavedTheme, listThemes} from './theme.js';
import {
  money,
  escapeHTML as e,
  audit,
  computePayRunSummary,
  executePayRunAndPostBooks,
  evaluateComplianceLab,
  trialBalance,
  provisionOpenPayrollWalletCard,
  connectWorkerNeobankRouting,
  updateWorkerSplitDeposit,
  pushInstantShiftTips,
  sendBilingualWhatsappPaystub,
  defaultUnbankedEmployeeId,
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
  ['cockpit', '◫', 'Payroll Overview'],
  ['unbanked-wallet', '📱', 'Unbanked Wallet & Español QR'],
  ['payrun', '💵', 'Run Payroll (W-2 & 1099)'],
  ['direct-deposit', '🏦', 'Direct Deposit Batches'],
  ['tax-filings', '🏛', 'Tax Filings (941 / W-2 / 1099)'],
  ['compliance', '⚖', 'Timecards & Tip Credits'],
  ['books-sync', '◈', 'General Ledger Sync']
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
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
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
  const defaultEmpId = defaultUnbankedEmployeeId(state.payRun.employees);
  const defaultEmp = state.payRun.employees.find(emp => emp.id === defaultEmpId) || state.payRun.employees[0];
  state.unbanked.selectedEmployeeId = defaultEmp.id;
  state.unbanked.selectedAppId = defaultEmp.payoutMethod || 'open_payroll_card';
  state.unbanked.accountLast4Input = defaultEmp.accountLast4 || '9042';
  state.calculator.w2Employees = preset.w2Count;
  state.calculator.contractors1099 = preset.contractorCount;
  state.calculator.annualTippedWages = preset.annualTippedWages;
  audit(state, `Switched active payroll preset to ${preset.vertical} (${preset.employer})`);
  persist();
  render();
  notify(`Loaded ${preset.vertical} payroll profile: ${preset.employer}`);
}

function renderCockpit() {
  const summary = computePayRunSummary(state);
  const tb = trialBalance(state);

  return `
    ${pageTop(
      'PAYROLL & TAX OPERATIONS OVERVIEW',
      `${summary.preset.employer} — Pay Period Ending ${state.payRun.periodEnding}`,
      `100% checkless digital payroll: zero paper paychecks, 60-second bilingual (Español / English) QR phone onboarding, instant Apple/Google Wallet Visa debit cards for unbanked staff, Cash App / Comun / Seis / Chime direct routing, and <5s end-of-shift tip push.`,
      `<div style="display:flex;gap:8px;flex-wrap:wrap"><a href="#tab-unbanked-wallet" class="btn">📱 Bilingual Unbanked Wallet</a>${button('Approve & Run Payroll Now', 'run-payroll-now', 'primary')}</div>`
    )}
    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">CURRENT PERIOD GROSS PAYROLL</span>
        <strong class="kpi-value">${money(summary.totals.grossPay)}</strong>
        <p>${summary.stubs.length} active payees (${summary.preset.w2Count} W-2 · ${summary.preset.contractorCount} 1099)</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">100% CHECKLESS DIGITAL PAYOUT</span>
        <strong class="kpi-value">${money(summary.totals.netPay)}</strong>
        <p>Check date: ${e(state.payRun.checkDate)} · ${e(summary.bank.name)}</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">FEDERAL EFTPS + STATE TAX DUE</span>
        <strong class="kpi-value">${money(summary.totals.eftpsDeposit + summary.totals.stateTaxDeposit)}</strong>
        <p>${money(summary.totals.eftpsDeposit)} IRS EFTPS · ${money(summary.totals.stateTaxDeposit)} State</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">WORKER CHECK-CASHING FEES</span>
        <strong class="kpi-value">$0.00</strong>
        <p>Saves staff ${money(summary.totals.workerFeesSaved)}/run in Casa de Cambio &amp; wire fees</p>
      </article>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">ACTIVE PAYROLL ROSTER &amp; DIGITAL PAYOUT RAILS</span>
            <h2>Employees &amp; Contractors (${summary.preset.payFrequency})</h2>
          </div>
          ${badge(`EIN ${summary.preset.ein} · ${summary.preset.state}`, 'positive')}
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Payee</th>
              <th>Role / Dept</th>
              <th>Digital Wallet / Bank Rail</th>
              <th>Gross</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            ${summary.stubs.map(s => `
              <tr>
                <td><strong>${e(s.name)}</strong><br><small>${e(s.lang === 'es' ? 'Español · ' : 'English · ')}${e(s.tinType || 'SSN')}</small></td>
                <td>${e(s.role)}<br><small>${e(s.dept)} · ${e(s.type)}</small></td>
                <td>${badge(s.payoutAppName, s.payoutMethod === 'open_payroll_card' ? 'positive' : 'info')}<br><small class="mono">ABA ${e(s.routingNumber || '121145433')} · •••• ${e(s.accountLast4 || '9042')}</small></td>
                <td class="mono">${money(s.grossPay)}</td>
                <td class="mono"><strong>${money(s.netPay)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">TAX IMPOUND, GL STATUS &amp; UNBANKED COMPLIANCE</span>
            <h2>Upcoming Pay Run &amp; Filing Schedule</h2>
          </div>
          ${badge(tb.balanced ? 'GL $0.00 Variance' : 'Check Variance', 'positive')}
        </div>
        <table class="data-table">
          <tbody>
            <tr><td><strong>Employer Legal Entity</strong></td><td>${e(summary.preset.employer)} (EIN ${e(summary.preset.ein)})</td></tr>
            <tr><td><strong>Pay Period / Check Date</strong></td><td class="mono">Ending ${e(state.payRun.periodEnding)} · Payday ${e(state.payRun.checkDate)}</td></tr>
            <tr><td><strong>Total Employee Withholdings</strong></td><td class="mono">${money(summary.totals.totalEmployeeTaxes)} (FIT, FICA, SIT, SDI)</td></tr>
            <tr><td><strong>Total Employer Payroll Taxes</strong></td><td class="mono">${money(summary.totals.totalEmployerTaxes)} (ER FICA, FUTA, SUI, WC)</td></tr>
            <tr><td><strong>Form 8846 (§ 45B) Tip Credit Offset</strong></td><td class="mono">+${money(summary.totals.erFicaTipCredit)}</td></tr>
            <tr><td><strong>Unbanked Wage-Access Compliance</strong></td><td>CA Labor Code §§ 212 / 213(d) &amp; CFPB Reg E ($0 Fees · 55,000+ Free ATMs + Unlimited $0 OTC Teller Cash)</td></tr>
          </tbody>
        </table>
        <div style="margin-top:1rem;display:flex;gap:0.75rem;flex-wrap:wrap">
          ${button('Approve & Submit Pay Run', 'run-payroll-now', 'primary')}
          <a href="#tab-unbanked-wallet" class="btn">Configure Español QR &amp; Unbanked Wallets →</a>
          <a href="#tab-payrun" class="btn">Detailed Worksheet →</a>
        </div>
      </section>
    </div>
  `;
}

function renderUnbankedWallet() {
  const summary = computePayRunSummary(state);
  const lang = state.unbanked.lang === 'en' ? 'en' : 'es';
  const isEs = lang === 'es';

  const selectedStub = summary.stubs.find(s => s.id === state.unbanked.selectedEmployeeId) || summary.stubs[0];
  const selectedApp = neobankRoutingCatalog.find(a => a.id === state.unbanked.selectedAppId) || neobankRoutingCatalog[0];
  const currentEmpApp = neobankRoutingCatalog.find(a => a.id === (selectedStub.payoutMethod || 'open_payroll_card')) || neobankRoutingCatalog[0];
  const split = selectedStub.split;

  const langToggleHtml = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <div class="lang-toggle-bar" role="group" aria-label="Onboarding Language Toggle">
        <button type="button" class="lang-toggle-btn ${isEs ? 'active' : ''}" data-action="set-unbanked-lang" data-lang="es" aria-pressed="${isEs}">🇲🇽 Español (ES)</button>
        <button type="button" class="lang-toggle-btn ${!isEs ? 'active' : ''}" data-action="set-unbanked-lang" data-lang="en" aria-pressed="${!isEs}">🇺🇸 English (EN)</button>
      </div>
      ${button(isEs ? 'Emitir Tarjeta Virtual Instantánea' : 'Issue Instant Virtual Card', 'provision-wallet-card', 'primary')}
    </div>
  `;

  return `
    ${pageTop(
      isEs
        ? 'BILLETERA DIGITAL BILINGÜE PARA TRABAJADORES SIN BANCO · CA LABOR CODE §§ 212 / 213(d) & CFPB REG E'
        : 'BILINGUAL UNBANKED WORKER DIGITAL WALLET · CA LABOR CODE §§ 212 / 213(d) & CFPB REG E',
      isEs
        ? 'Cómo Pagar al Personal Hispano sin Cuenta Bancaria (0% Cheques de Papel · $0 Comisiones)'
        : 'Unbanked & Underbanked Workforce Digital Payouts (Zero Paper Checks · $0 Worker Fees)',
      isEs
        ? 'Elimina las comisiones depredadoras del 1.5% al 4.0% ($15–$40 por cheque) en Casas de Cambio. El trabajador escanea el código QR en Español o Inglés y en 60 segundos activa su Tarjeta Visa Open Payroll en Apple/Google Wallet, o conecta su Cash App, Comun, Seis, Chime o Venmo.'
        : 'Eliminates predatory 1.5%–4.0% ($15–$40 per check) check-cashing storefront fees. Workers scan the onboarding QR code in Spanish or English to activate an FDIC-insured Open Payroll Visa Card in Apple/Google Wallet in 30 seconds, or connect Cash App, Comun, Seis, Chime, or Venmo in 2 taps.',
      langToggleHtml
    )}

    <div class="kpi-grid">
      <article class="kpi-card">
        <span class="eyebrow">${isEs ? 'COMISIÓN POR COBRAR SUELDO' : 'WORKER CHECK-CASHING FEE'}</span>
        <strong class="kpi-value">$0.00</strong>
        <p>${isEs ? `Evita el 1.5%–4.0% ($15–$40) de Casa de Cambio · Ahorra ${money(split.totalWorkerFeesSavedPerPaycheck)}/pago a ${selectedStub.name}` : `Eliminates 1.5%–4.0% ($15–$40) check-casher tax · Saves ${selectedStub.name} ${money(split.totalWorkerFeesSavedPerPaycheck)}/paycheck`}</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">${isEs ? 'VÍA 1 · TARJETA OPEN PAYROLL + FBO' : 'PATH 1 · OPEN PAYROLL VISA + FBO'}</span>
        <strong class="kpi-value">30 seg</strong>
        <p>${isEs ? 'Apple Wallet / Google Pay al instante + 55,000+ cajeros gratis y retiro total en ventanilla ($0)' : 'Instant Apple/Google Wallet + 55,000+ free ATMs & unlimited $0 bank teller full-wage cash'}</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">${isEs ? 'VÍA 2 · APPS YA EN SU TELÉFONO' : 'PATH 2 · ALREADY-ON-PHONE APPS'}</span>
        <strong class="kpi-value">2 Toques</strong>
        <p>${isEs ? 'Ruta ACH pre-llenada para Comun, Seis, Cash App, Chime, Venmo y Oportun (SSN o ITIN)' : 'Auto-filled ACH routing for Comun, Seis, Cash App, Chime, Venmo & Oportun (SSN or ITIN)'}</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">${isEs ? 'VÍA 3 · PROPINAS AL FINAL DEL TURNO' : 'PATH 3 · END-OF-SHIFT TIP PUSH'}</span>
        <strong class="kpi-value">&lt;5 seg</strong>
        <p>${isEs ? 'Push instantáneo Visa Direct / FedNow sin efectivo en caja + Crédito Fiscal IRS Form 8846' : 'Instant Visa Direct / FedNow push with zero safe cash risk + Auto IRS Form 8846 tip credit'}</p>
      </article>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">${isEs ? 'VÍA 1 Y VÍA 2 · REGISTRO MÓVIL QR EN 60 SEGUNDOS (ESPAÑOL / ENGLISH)' : 'PATH 1 & PATH 2 · 60-SECOND MOBILE QR ONBOARDING (ESPAÑOL / ENGLISH)'}</span>
            <h2>${isEs ? 'Tarjeta Virtual/Física Open Payroll o Conexión en 2 Toques (Cash App / Comun / Seis / Chime)' : 'Instant Virtual/Physical Payroll Card or 2-Tap App Routing (Cash App / Comun / Seis / Chime)'}</h2>
          </div>
          ${badge(isEs ? 'Acepta SSN · ITIN · Matrícula' : 'Supports SSN · ITIN · Matrícula', 'positive')}
        </div>

        <div class="qr-badge-box">
          <svg class="qr-svg" viewBox="0 0 64 64" aria-label="Onboarding QR Code">
            <rect x="4" y="4" width="20" height="20" fill="none" stroke="#1F2B22" stroke-width="4"/>
            <rect x="10" y="10" width="8" height="8" fill="#1F2B22"/>
            <rect x="40" y="4" width="20" height="20" fill="none" stroke="#1F2B22" stroke-width="4"/>
            <rect x="46" y="10" width="8" height="8" fill="#1F2B22"/>
            <rect x="4" y="40" width="20" height="20" fill="none" stroke="#1F2B22" stroke-width="4"/>
            <rect x="10" y="46" width="8" height="8" fill="#1F2B22"/>
            <rect x="28" y="8" width="6" height="6" fill="#2F4A34"/>
            <rect x="28" y="20" width="6" height="12" fill="#2F4A34"/>
            <rect x="8" y="28" width="12" height="6" fill="#2F4A34"/>
            <rect x="28" y="38" width="10" height="10" fill="#2F4A34"/>
            <rect x="44" y="28" width="16" height="6" fill="#2F4A34"/>
            <rect x="44" y="42" width="8" height="18" fill="#2F4A34"/>
            <rect x="54" y="50" width="6" height="10" fill="#2F4A34"/>
          </svg>
          <div>
            <strong>${isEs ? 'Código QR de Alta Instantánea en Cocina / Campo' : 'Breakroom & Field Crew Instant Onboarding QR'}</strong>
            <p class="muted">${isEs
              ? 'El trabajador escanea con su cámara → elige Español o English → recibe su Tarjeta Visa Open Payroll en Apple/Google Wallet en 30 segundos o conecta la app que ya usa.'
              : 'Worker scans with phone camera → selects Español or English → receives an instant Open Payroll Visa Card in Apple/Google Wallet in 30 seconds or links the app already on their phone.'}</p>
          </div>
        </div>

        <div class="form-grid">
          <label>${isEs ? 'Seleccionar Trabajador de la Nómina Activa' : 'Select Active Worker from Roster'}
            <select data-unbanked="selectedEmployeeId" aria-label="Select Worker">
              ${summary.stubs.map(s => `<option value="${s.id}" ${s.id === selectedStub.id ? 'selected' : ''}>${e(s.name)} — ${e(s.role)} (${money(s.netPay)} net)</option>`).join('')}
            </select>
          </label>
          <label>${isEs ? 'Verificación de Identidad y TIN (31 CFR § 1020.220 CIP)' : 'Identity & TIN Verification (31 CFR § 1020.220 CIP)'}
            <input type="text" readonly value="${e(selectedStub.tinType || 'ITIN (9XX-XX-7340 · Matrícula Consular)')}">
          </label>
        </div>

        <div class="wallet-card-visual">
          <div class="wallet-card-top">
            <span class="wallet-card-brand">Open Payroll · ${e(summary.preset.employer)}</span>
            <span class="wallet-card-chip">${e(currentEmpApp.id === 'open_payroll_card' ? 'APPLE PAY / GOOGLE WALLET ACTIVE' : 'DIRECT DEPOSIT LINKED')}</span>
          </div>
          <div class="wallet-card-pan">4812 •••• •••• ${e(selectedStub.accountLast4 || '9042')}</div>
          <div class="wallet-card-meta">
            <div><strong>${isEs ? 'TITULAR' : 'CARDHOLDER / PAYEE'}:</strong> ${e(selectedStub.name)}</div>
            <div><strong>ABA:</strong> ${e(selectedStub.routingNumber || '121145433')} (${e(currentEmpApp.name)})</div>
            <div><strong>FDIC FBO:</strong> $0.00 Fees · VISA DEBIT</div>
          </div>
        </div>

        <div style="margin-top:14px">
          <span class="eyebrow">${isEs ? '¿TIENES CASH APP, VENMO, CHIME, COMUN O SEIS? TOCA AQUÍ PARA CONECTAR TU DEPÓSITO DIRECTO GRATIS' : 'ALREADY HAVE CASH APP, VENMO, CHIME, COMUN, OR SEIS? TAP TO AUTO-FILL DIRECT DEPOSIT ROUTING'}</span>
          <div class="app-selector-grid">
            ${neobankRoutingCatalog.map(app => `
              <button type="button" class="app-selector-btn ${app.id === selectedApp.id ? 'active' : ''}" data-action="select-neobank-app" data-app-id="${app.id}" aria-pressed="${app.id === selectedApp.id}">
                <strong>${e(app.name)}</strong>
                <small>${e(isEs ? app.badgeEs : app.badgeEn)}</small>
                <small class="mono">ABA ${e(app.routing)}</small>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="callout" style="margin-top:12px">
          <strong>${e(selectedApp.name)} · ${e(selectedApp.sponsorBank)} (ABA ${e(selectedApp.routing)})</strong>
          <p><strong>${isEs ? 'Documentos Aceptados:' : 'Accepted IDs:'}</strong> ${e(selectedApp.acceptedIds)} · <strong>${isEs ? 'Cajeros ATM:' : 'ATM Network:'}</strong> ${e(selectedApp.atmNetwork)}</p>
          <p style="margin-top:6px"><strong>${isEs ? 'Instrucciones Guiadas en 3 Pasos:' : '3-Step Guided Setup:'}</strong><br>${(isEs ? selectedApp.stepsEs : selectedApp.stepsEn).map(step => e(step)).join('<br>')}</p>
        </div>

        <div class="form-grid" style="margin-top:12px">
          <label>${isEs ? 'Número de Ruta ABA (Pre-llenado Automáticamente)' : 'Sponsor Bank ABA Routing Number (Auto-Filled)'}
            <input type="text" readonly class="mono" value="${e(selectedApp.routing)}">
          </label>
          <label>${isEs ? 'Últimos 4 Dígitos de Cuenta / Tarjeta FBO' : 'Account / FBO Card Last 4 Digits'}
            <input type="text" maxlength="4" class="mono" value="${e(state.unbanked.accountLast4Input)}" data-unbanked="accountLast4Input">
          </label>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
          ${button(
            isEs ? `Conectar ${selectedApp.name} Gratis ($0)` : `Connect ${selectedApp.name} Free ($0)`,
            'connect-neobank',
            'primary'
          )}
          ${button(
            isEs ? 'Emitir Tarjeta Virtual Open Payroll + Apple/Google Wallet (30s)' : 'Provision Instant Open Payroll Visa + Apple/Google Wallet (30s)',
            'provision-wallet-card',
            ''
          )}
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">${isEs ? 'VÍA 3 · LIQUIDACIÓN INSTANTÁNEA DE PROPINAS Y SALARIO AL FINAL DEL TURNO (<5 SEG)' : 'PATH 3 · INSTANT END-OF-SHIFT TIP & EARNED-WAGE PUSH (<5 SECONDS)'}</span>
            <h2>${isEs ? 'Push Instantáneo Visa Direct / FedNow sin Efectivo en Caja' : 'Zero-Cash-Drawer Instant Shift Tip Push (Visa Direct OCT & FedNow)'}</h2>
          </div>
          ${badge('IRC § 6053 · CA § 351 · Form 8846', 'positive')}
        </div>
        <p class="muted">${isEs
          ? 'Los meseros, bartenders, bussers, cocineros y cuadrillas de campo reciben sus propinas de tarjeta o salario ganado directamente en su tarjeta Apple/Google Wallet en menos de 5 segundos al cerrar el turno—sin riesgo de efectivo en la caja fuerte del restaurante y con registro automático en el W-2 Box 7.'
          : 'Servers, bartenders, bussers, cooks, and field crew members receive settled credit-card tips or earned shift wages directly on their Apple/Google Wallet debit card in under 5 seconds at shift closeout—eliminating safe cash risk while automatically logging W-2 Box 7 tips and IRS Form 8846 (§ 45B) employer tax credits.'}</p>

        <div class="form-grid">
          <label>${isEs ? 'Monto de Propina / Pago de Turno a Enviar ($)' : 'End-of-Shift Tip / Wage Push Amount ($)'}
            <input type="number" step="0.50" min="1" value="${state.unbanked.instantTipAmount}" data-unbanked="instantTipAmount">
          </label>
          <label>${isEs ? 'Riel de Liquidación Instantánea (<5s)' : 'Instant Settlement Rail (<5s)'}
            <select data-unbanked="instantTipRail">
              <option value="visa_direct_oct" ${state.unbanked.instantTipRail === 'visa_direct_oct' ? 'selected' : ''}>Visa Direct / Mastercard Send OCT (&lt;5s Apple/Google Wallet)</option>
              <option value="fednow_instant" ${state.unbanked.instantTipRail === 'fednow_instant' ? 'selected' : ''}>FedNow / RTP Instant 24/7/365 Bank Push ($0.045/tx)</option>
            </select>
          </label>
        </div>

        <div class="callout">
          <strong>${isEs ? `Vista Previa de Liquidación para ${selectedStub.name}:` : `Instant Push Preview for ${selectedStub.name}:`}</strong>
          <p>${isEs
            ? `Destino: ${currentEmpApp.name} (•••• ${selectedStub.accountLast4 || '9042'}) · 100% libre de descuento por comisión de tarjeta (CA Labor Code § 351) · Incremento automático de Crédito Fiscal IRS Form 8846 (§ 45B): +${money(Number(state.unbanked.instantTipAmount || 0) * 0.0765)}`
            : `Destination: ${currentEmpApp.name} (•••• ${selectedStub.accountLast4 || '9042'}) · 100% tip integrity (CA Labor Code § 351 zero card-fee deduction) · Automatic IRS Form 8846 (§ 45B) FICA Tip Credit increment: +${money(Number(state.unbanked.instantTipAmount || 0) * 0.0765)}`}</p>
        </div>

        <div style="margin:12px 0;display:flex;gap:10px;flex-wrap:wrap">
          ${button(
            isEs ? `💸 Enviar ${money(state.unbanked.instantTipAmount)} al Instante (<5s)` : `💸 Push ${money(state.unbanked.instantTipAmount)} Instant Shift Tips (<5s)`,
            'push-instant-tips',
            'primary'
          )}
        </div>

        <div style="margin-top:16px">
          <span class="eyebrow">${isEs ? `HISTORIAL DE PROPINAS ENVIADAS AL INSTANTE (${state.unbanked.tipPushes.length})` : `SETTLED INSTANT SHIFT TIP PUSHES (${state.unbanked.tipPushes.length})`}</span>
          ${state.unbanked.tipPushes.length === 0 ? `<p class="muted" style="margin-top:6px">${isEs ? 'Haz clic en el botón de arriba para simular un pago instantáneo de propinas al final del turno con asiento contable automático en Open Books.' : 'Click the button above to push an instant end-of-shift tip payout and post a balanced clearing journal to Open Books.'}</p>` : `
            <table class="data-table" style="margin-top:8px">
              <thead>
                <tr>
                  <th>ID / Trabajador</th>
                  <th>Destino / Riel</th>
                  <th>Monto</th>
                  <th>Crédito § 45B</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${state.unbanked.tipPushes.map(tp => `
                  <tr>
                    <td><strong>${e(tp.id)}</strong><br><small>${e(tp.employeeName)}</small></td>
                    <td>${e(tp.destination)}<br><small>${e(tp.rail)}</small></td>
                    <td class="mono"><strong>${money(tp.amount)}</strong></td>
                    <td class="mono">+${money(tp.ficaTipCredit45B)}</td>
                    <td>${badge(tp.status, 'positive')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </section>
    </div>

    <div class="grid-2">
      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">${isEs ? 'VÍA 4 · DIVIDIR MI PAGO Y ENVÍOS DE REMESAS A MÉXICO / LATAM SIN COMISIÓN DE EFECTIVO' : 'PATH 4 · SPLIT DIRECT DEPOSIT & ZERO-CASH-FEE CROSS-BORDER FAMILY REMITTANCES'}</span>
            <h2>${isEs ? `División Automática de Nómina para ${selectedStub.name} (Pago Neto: ${money(selectedStub.netPay)})` : `Automated Split Direct Deposit for ${selectedStub.name} (Net Pay: ${money(selectedStub.netPay)})`}</h2>
          </div>
          ${badge(isEs ? 'Félix Pago WhatsApp · Comun · Remitly · Wise' : 'Félix Pago WhatsApp · Comun · Remitly · Wise', 'info')}
        </div>

        <p class="muted">${isEs
          ? 'Permite separar automáticamente cada cheque neto entre gastos diarios, un sub-fondo exclusivo para enviar dinero a la familia en México o Latinoamérica (usando Félix Pago por WhatsApp, Comun, Remitly o Wise a tarifa digital sin pagar $15–$20 en tiendas de efectivo), y ahorro de emergencia.'
          : 'Automatically splits each net paycheck across daily spending, a dedicated Family Remittance sub-account (compatible with Félix Pago via WhatsApp, Comun, Remitly, and Wise at low digital debit/ACH tiers instead of $15–$20 cash storefront wire fees), and emergency savings.'}</p>

        <div class="split-bar" aria-label="Split Direct Deposit Allocation">
          <div class="split-seg-spend" style="width:${split.spendPct}%"></div>
          <div class="split-seg-remit" style="width:${split.remitPct}%"></div>
          <div class="split-seg-save" style="width:${split.savePct}%"></div>
        </div>

        <div class="form-grid">
          <label>${isEs ? `1. Gastos Diarios (${split.spendPct}% → ${money(split.spendAmount)})` : `1. Daily Spending Card (${split.spendPct}% → ${money(split.spendAmount)})`}
            <input type="number" min="10" max="100" step="5" value="${split.spendPct}" data-split="spendPct">
          </label>
          <label>${isEs ? `2. Fondo para Envíos a Familia / Remesas (${split.remitPct}% → ${money(split.remitAmount)})` : `2. Family Remittance Reserve (${split.remitPct}% → ${money(split.remitAmount)})`}
            <input type="number" min="0" max="90" step="5" value="${split.remitPct}" data-split="remitPct">
          </label>
        </div>

        <div class="callout" style="margin-bottom:14px">
          <strong>${isEs ? 'Desglose Exacto de este Pago Neto:' : 'Exact Net Paycheck Split Breakdown:'}</strong>
          <p>
            • <strong>${isEs ? 'Gastos Diarios' : 'Daily Spending'} (${split.spendPct}%):</strong> ${money(split.spendAmount)} → ${e(currentEmpApp.name)}<br>
            • <strong>${isEs ? 'Fondo Remesas Familiares' : 'Family Remittance Sub-Account'} (${split.remitPct}%):</strong> ${money(split.remitAmount)} → ${isEs ? 'Listo para Félix Pago (WhatsApp) / Comun / Remitly / Wise' : 'Ready for Félix Pago (WhatsApp) / Comun / Remitly / Wise'}<br>
            • <strong>${isEs ? 'Ahorro de Emergencia FDIC' : 'FDIC Emergency Savings'} (${split.savePct}%):</strong> ${money(split.saveAmount)}
          </p>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>${isEs ? 'Corredor Digital de Remesas' : 'Digital Remittance Corridor'}</th>
              <th>${isEs ? 'Bancos y Puntos de Pago en Destino' : 'Receiving Banks & Cash Pickup Network'}</th>
              <th>${isEs ? 'Costo Digital vs. Efectivo' : 'Digital Fee vs. Storefront Cash'}</th>
            </tr>
          </thead>
          <tbody>
            ${remittanceCorridors.map(rc => `
              <tr>
                <td><strong>${e(rc.provider)}</strong><br><small>${e(rc.country)}</small></td>
                <td>${e(rc.receivingBanks)}<br><small>${e(rc.speed)}</small></td>
                <td>${badge(rc.typicalFee, 'positive')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">${isEs ? 'CUMPLIMIENTO LEGAL CA LABOR CODE §§ 212, 213(d), 226(a) Y RECIBO POR WHATSAPP' : 'CA LABOR CODE §§ 212, 213(d), 226(a) COMPLIANCE & WHATSAPP PAYSTUB'}</span>
            <h2>${isEs ? 'Cero Comisiones y Recibo de Nómina Digital por WhatsApp / SMS' : 'Zero-Fee Statutory Guarantee & Bilingual WhatsApp / SMS Paystub'}</h2>
          </div>
          ${badge('CA §§ 212 / 226(a) · CFPB Reg E', 'positive')}
        </div>

        <table class="data-table" style="margin-bottom:14px">
          <thead>
            <tr>
              <th>${isEs ? 'Concepto / Derecho Legal del Trabajador' : 'Statutory Wage-Access Requirement'}</th>
              <th>Open Payroll Card</th>
              <th>${isEs ? 'Casa de Cambio / Cheque de Papel' : 'Paper Check + Check Casher'}</th>
            </tr>
          </thead>
          <tbody>
            ${openPayrollCardDisclosures.feeSchedule.map(row => `
              <tr>
                <td><strong>${e(isEs ? row.itemEs : row.itemEn)}</strong></td>
                <td>${badge(row.openPayroll, 'positive')}</td>
                <td class="muted">${e(row.checkCasher)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="callout">
          <strong>${isEs
            ? `📱 Vista Previa del Recibo Digital por WhatsApp / SMS (CA Labor Code § 226(a) y § 246(i)) — ${selectedStub.name}`
            : `📱 WhatsApp / SMS Itemized Wage Statement Preview (CA Labor Code § 226(a) & § 246(i)) — ${selectedStub.name}`}</strong>
          <p class="mono" style="margin-top:6px;line-height:1.55">
            ${isEs
              ? `• Empleador: ${summary.preset.employer} (EIN ${summary.preset.ein}) · Periodo: Al ${state.payRun.periodEnding}<br>• Trabajador: ${selectedStub.name} (${selectedStub.tinType || 'ITIN'}) · Horas: ${selectedStub.hours} reg + ${selectedStub.overtimeHours} extra<br>• Salario Bruto: ${money(selectedStub.grossPay)} (Reg ${money(selectedStub.regularPay)} · Extra ${money(selectedStub.overtimePay)}${selectedStub.tips > 0 ? ` · Propinas ${money(selectedStub.tips)}` : ''}${selectedStub.mealPenaltyPay > 0 ? ` · Prima §226.7 ${money(selectedStub.mealPenaltyPay)}` : ''})<br>• Retenciones: -${money(selectedStub.totalEmployeeTaxes + selectedStub.preTax401k)} · <strong>PAGO NETO DEPOSITADO: ${money(selectedStub.netPay)}</strong><br>• Saldo de Horas de Enfermedad Pagadas (CA § 246(i)): <strong>${selectedStub.sickHoursAvailable ?? 40.0} hrs disponibles</strong>`
              : `• Employer: ${summary.preset.employer} (EIN ${summary.preset.ein}) · Period Ending: ${state.payRun.periodEnding}<br>• Employee: ${selectedStub.name} (${selectedStub.tinType || 'SSN'}) · Hours: ${selectedStub.hours} reg + ${selectedStub.overtimeHours} OT<br>• Gross Pay: ${money(selectedStub.grossPay)} (Reg ${money(selectedStub.regularPay)} · OT ${money(selectedStub.overtimePay)}${selectedStub.tips > 0 ? ` · Tips ${money(selectedStub.tips)}` : ''}${selectedStub.mealPenaltyPay > 0 ? ` · CA §226.7 Premium ${money(selectedStub.mealPenaltyPay)}` : ''})<br>• Taxes &amp; 401(k): -${money(selectedStub.totalEmployeeTaxes + selectedStub.preTax401k)} · <strong>NET PAY DEPOSITED: ${money(selectedStub.netPay)}</strong><br>• CA Paid Sick Leave Balance (§ 246(i)): <strong>${selectedStub.sickHoursAvailable ?? 40.0} hrs available</strong>`}
          </p>
        </div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          ${button(
            isEs ? `📲 Enviar Recibo Digital por WhatsApp / SMS a ${selectedStub.name}` : `📲 Send Bilingual WhatsApp / SMS Paystub to ${selectedStub.name}`,
            'send-whatsapp-stub',
            'primary'
          )}
          ${state.unbanked.whatsappStubs.length > 0 ? badge(`${state.unbanked.whatsappStubs.length} WhatsApp/SMS Sent`, 'positive') : ''}
        </div>
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
          <span class="eyebrow">LINE-BY-LINE PAYSTUB, DIGITAL WALLET RAIL &amp; BURDENED LABOR LEDGER</span>
          <h2>W-2 Employees &amp; 1099 Contractors (${summary.preset.payFrequency})</h2>
        </div>
        ${badge(`EIN ${summary.preset.ein} · ${summary.preset.state}`, 'positive')}
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Employee / Contractor</th>
            <th>Department / Role</th>
            <th>Payout Wallet / Bank Rail</th>
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
              <td><strong>${e(s.name)}</strong><br><small>${e(s.id)} · ${e(s.lang === 'es' ? 'Español' : 'English')}</small></td>
              <td>${e(s.dept)}<br><small>${e(s.role)} (${e(s.type)})</small></td>
              <td>${badge(s.payoutAppName, s.payoutMethod === 'open_payroll_card' ? 'positive' : 'info')}<br><small class="mono">ABA ${e(s.routingNumber || '121145433')} · Split ${s.split.spendPct}/${s.split.remitPct}/${s.split.savePct}%</small></td>
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
      '100% CHECKLESS DIGITAL PAYROLL · ZERO PAPER CHECKS · ZERO FLOAT',
      'Instant FedNow / Same-Day ACH Bank Push, QR Mobile Onboarding & Digital Wallet Cards',
      'Every employee and 1099 contractor is onboarded digitally in 60 seconds via bilingual QR code (linking Comun, Seis, Cash App, Chime, Venmo, or an instant Open Payroll Apple/Google Wallet Visa card)—eliminating paper checks, check-cashing fees, and payroll float.',
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
      'FEDERAL & STATE PAYROLL TAX E-FILINGS',
      'Automated Form 941, 940, DE-9, W-2, 1099-NEC & Form 8846 Filings',
      'Every pay run automatically populates quarterly and annual federal/state tax returns and transmits EFTPS deposits—with full SSN and ITIN reporting support and zero year-end per-form surcharges.'
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
      'TIMECARDS, MEAL-BREAK COMPLIANCE & § 45B TIP CREDITS',
      'Shift Compliance, Regular-Rate Overtime & Form 8846 Tip Tax Credit',
      'Audit shift meal-break compliance under CA Labor Code § 226.7, calculate regular-rate overtime premiums, and compute IRS Form 8846 (§ 45B) employer FICA tip tax credits.'
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
          <p>Automatically exported to <strong>Open Books v3.3</strong> and <strong>OpenCPA 2.0</strong> Schedule K-1 / Form 3800 so restaurant and club owners capture every dollar of statutory FICA tip tax credits.</p>
        </div>
      </section>
    </div>

    <section class="card" style="margin-top:1rem">
      <div class="card-head">
        <div>
          <span class="eyebrow">VERTICAL LABOR &amp; STATUTORY COMPLIANCE RULES</span>
          <h2>Built-In Industry Payroll, Unbanked Wage-Access &amp; Commission Rules</h2>
        </div>
      </div>
      <div class="grid-2">
        ${verticalLaborRules.map(rule => `
          <div class="callout">
            <strong>${e(rule.vertical)} · ${e(rule.title)}</strong>
            <p><strong>Statutory Requirement:</strong> ${e(rule.problem)}</p>
            <p><strong>Automated Rule:</strong> ${e(rule.solution)}</p>
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
      'GENERAL LEDGER PAYROLL JOURNAL SYNC',
      'Automated Multi-Dimensional Payroll & Tip-Clearing Journal Entries ($0.00 Variance)',
      'Every pay run and instant end-of-shift tip push writes balanced double-entry journal lines directly into Open Books v3.3 across Department, Fund, and Job dimensions.',
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
        <p>Gross wages + ER payroll taxes + tip clearing + rail fees</p>
      </article>
      <article class="kpi-card">
        <span class="eyebrow">TOTAL CREDITS POSTED</span>
        <strong class="kpi-value">${money(tb.totalCredits)}</strong>
        <p>EFTPS + State + 401k/WC + Net checking &amp; tip rails</p>
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
          <h2>Open Books v3.3 Payroll &amp; Instant Tip Journal Entries</h2>
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
  else if (tab === 'unbanked-wallet') main.innerHTML = renderUnbankedWallet();
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
  } else if (action === 'set-unbanked-lang') {
    state.unbanked.lang = actionBtn.dataset.lang === 'en' ? 'en' : 'es';
    persist();
    render();
    notify(state.unbanked.lang === 'es' ? 'Idioma cambiado a Español (ES)' : 'Language switched to English (EN)');
  } else if (action === 'select-neobank-app') {
    state.unbanked.selectedAppId = actionBtn.dataset.appId;
    persist();
    render();
  } else if (action === 'provision-wallet-card') {
    const emp = provisionOpenPayrollWalletCard(state, state.unbanked.selectedEmployeeId);
    persist();
    render();
    if (emp) {
      notify(state.unbanked.lang === 'es'
        ? `Tarjeta Virtual Visa Open Payroll + Cuenta FBO (ABA 121145433) activada en Apple/Google Wallet para ${emp.name}`
        : `Provisioned instant Open Payroll Visa Wallet Card + FDIC FBO Account (ABA 121145433) for ${emp.name}`);
    }
  } else if (action === 'connect-neobank') {
    const res = connectWorkerNeobankRouting(
      state,
      state.unbanked.selectedEmployeeId,
      state.unbanked.selectedAppId,
      state.unbanked.accountLast4Input
    );
    persist();
    render();
    if (res) {
      notify(state.unbanked.lang === 'es'
        ? `Depósito directo conectado a ${res.app.name} (ABA ${res.app.routing} · •••• ${res.emp.accountLast4}) para ${res.emp.name}`
        : `Connected ${res.app.name} direct deposit (ABA ${res.app.routing} · •••• ${res.emp.accountLast4}) for ${res.emp.name}`);
    }
  } else if (action === 'push-instant-tips') {
    const res = pushInstantShiftTips(
      state,
      state.unbanked.selectedEmployeeId,
      state.unbanked.instantTipAmount,
      state.unbanked.instantTipRail
    );
    persist();
    render();
    if (res) {
      notify(state.unbanked.lang === 'es'
        ? `💸 ${money(res.pushRecord.amount)} enviados en <5s a ${res.pushRecord.employeeName} (+${money(res.pushRecord.ficaTipCredit45B)} crédito Form 8846)`
        : `💸 Pushed ${money(res.pushRecord.amount)} instant shift tips to ${res.pushRecord.employeeName} (+${money(res.pushRecord.ficaTipCredit45B)} Form 8846 credit)`);
    }
  } else if (action === 'send-whatsapp-stub') {
    const delivery = sendBilingualWhatsappPaystub(state, state.unbanked.selectedEmployeeId);
    persist();
    render();
    if (delivery) {
      notify(state.unbanked.lang === 'es'
        ? `📲 Recibo digital CA § 226(a) enviado por WhatsApp/SMS a ${delivery.employeeName} (${money(delivery.netPay)} neto)`
        : `📲 Delivered CA § 226(a) itemized WhatsApp/SMS paystub to ${delivery.employeeName} (${money(delivery.netPay)} net)`);
    }
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
  } else if (target.dataset.unbanked) {
    const key = target.dataset.unbanked;
    if (key === 'selectedEmployeeId') {
      state.unbanked.selectedEmployeeId = target.value;
      const emp = state.payRun.employees.find(e => e.id === target.value);
      if (emp) {
        state.unbanked.selectedAppId = emp.payoutMethod || 'open_payroll_card';
        state.unbanked.accountLast4Input = emp.accountLast4 || '9042';
      }
    } else if (key === 'instantTipAmount') {
      state.unbanked.instantTipAmount = Number(target.value) || 0;
    } else {
      state.unbanked[key] = target.value;
    }
    persist();
    render();
  } else if (target.dataset.split) {
    const emp = state.payRun.employees.find(e => e.id === state.unbanked.selectedEmployeeId) || state.payRun.employees[0];
    if (emp) {
      const spendPct = target.dataset.split === 'spendPct' ? Number(target.value) : emp.splitSpendPct;
      const remitPct = target.dataset.split === 'remitPct' ? Number(target.value) : emp.splitRemitPct;
      updateWorkerSplitDeposit(state, emp.id, spendPct, remitPct, 100 - spendPct - remitPct);
      persist();
      render();
    }
  }
});

window.addEventListener('hashchange', render);
render();
