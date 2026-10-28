export const clone = value => JSON.parse(JSON.stringify(value));

export const architectureLayers = [
  {
    id: 'layer-1',
    number: 'Layer 1',
    title: 'Gross-to-Net Tax Math, Timecards & Multi-State Withholding Engine',
    replacement: 'Native Open Scaffold Tax & Time Engine ($0.00 Per-Employee Fee)',
    legacyTax: '$40–$150/mo base + $6 to $18 per employee/month',
    openPayrollCost: '$0.00 per-employee fee — included in Open Payroll OS ($299/yr standalone or embedded)',
    summary: 'Runs IRS Publication 15-T federal brackets, FICA (6.2% OASDI + 1.45% Medicare), FUTA (0.6%), and 50-state SIT/SDI/SUI withholding tables natively inside @openscaffold/payroll.',
    modules: ['@openscaffold/payroll', '@openscaffold/schedule v0.1', '@openscaffold/books v3.3'],
    savingMetric: '$2,400–$9,600/yr saved in per-head payroll fees'
  },
  {
    id: 'layer-2',
    number: 'Layer 2',
    title: 'Direct Sponsor Bank NACHA PPD/CCD & FedNow Instant Wage Rails',
    replacement: 'Direct ODFI Sponsor Bank Origination (Column, Increase, Cross River)',
    legacyTax: '3-to-4 day float holds + per-contractor payout fees',
    openPayrollCost: '$0.15 flat NACHA PPD/CCD direct deposit · $0.045 FedNow instant earned-wage payout',
    summary: 'Originates employee W-2 direct deposits (PPD) and contractor 1099 payouts (CCD) directly through regulated Sponsor Bank ODFI rails with zero float hold on employer payroll cash.',
    modules: ['NACHA PPD/CCD Batch Builder', 'FedNow Instant Tip & Shift Payout', 'Sponsor Bank FBO Clearing'],
    savingMetric: '$1,200–$4,500/yr saved + 0-day cash hold'
  },
  {
    id: 'layer-3',
    number: 'Layer 3',
    title: 'Automated IRS EFTPS, SSA BSO & 50-State XML Tax E-Filing',
    replacement: 'Zero-Touch Quarterly & Year-End Electronic Filing Pipeline',
    legacyTax: '$150–$450/yr extra for W-2 / 1099-NEC year-end filings and multi-state tax registrations',
    openPayrollCost: '$0.00 per W-2 or 1099-NEC — automated XML e-file + EFTPS tax impound & remittance',
    summary: 'Automatically calculates, impounds, and remits federal EFTPS 941/940 deposits and transmits quarterly IRS Form 941, California EDD DE-9/DE-9C, SSA W-2/W-3, and IRS FIRE/IRIS 1099-NEC filings.',
    modules: ['IRS MeF 941/940 XML Generator', 'SSA EFW2 W-2 Builder', 'CA EDD DE-9/DE-9C XML Bridge', 'IRS IRIS 1099-NEC Engine'],
    savingMetric: '$600–$2,400/yr saved in W-2/1099 & CPA filing prep'
  },
  {
    id: 'layer-4',
    number: 'Layer 4',
    title: 'Vertical Wage-Hour Guardrails, Tip Pooling & § 45B FICA Tip Credit',
    replacement: 'Industry-Native Compliance & Tax-Credit Recovery Engine',
    legacyTax: 'Missed CA Labor Code § 226.7 break rules and § 45B FICA tip credits',
    openPayrollCost: 'Built-in CA meal/rest break guard, Form 8846 (§ 45B) FICA Tip Credit, and associate splits',
    summary: 'Protects employers from wage-hour penalties with real-time meal-break alerts while automatically generating IRS Form 8846 so restaurants recover 7.65% FICA taxes paid on tipped wages above minimum wage.',
    modules: ['CA § 226.7 Meal-Break Guard', 'IRS Form 8846 (§ 45B) Tip Credit', 'Dental Associate Net-Collection Split', 'Prevailing Wage & Certified Payroll'],
    savingMetric: '$8,000–$35,000/yr in § 45B tip tax credits & penalty prevention'
  },
  {
    id: 'layer-5',
    number: 'Layer 5',
    title: 'Instant $0.00-Variance @openscaffold/books v3.3 Multi-Dimensional GL Sync',
    replacement: 'Native Double-Entry Posting by Department, Job, Fund & Location',
    legacyTax: 'Manual bookkeeping to re-key payroll journals & accrue PTO/labor',
    openPayrollCost: 'Instant balanced journal entry into @openscaffold/books v3.3 on every pay run',
    summary: 'Every pay run automatically posts Gross Wages, Employer FICA/FUTA/SUI, Workers Comp accrual, Employee Withholding Liabilities, and Net Direct Deposit Clearing across departments.',
    modules: ['@openscaffold/books v3.3 Bridge', 'Workers Comp Pay-As-You-Go Accrual', 'Zero-PBC CPA Audit Package'],
    savingMetric: 'Eliminates manual payroll journal entry & reconciliations'
  }
];

export const neobankRoutingCatalog = [
  {
    id: 'open_payroll_card',
    name: 'Open Payroll Visa Wallet Card (Instant FBO)',
    badgeEs: 'Tarjeta Instantánea · $0 Comisiones',
    badgeEn: 'Instant Virtual + Physical Card · $0 Fees',
    sponsorBank: 'Column N.A. (Member FDIC — Individual FBO Account)',
    routing: '121145433',
    cardNetwork: 'Visa Debit (Apple Wallet & Google Pay + 3-Day Physical EMV Card)',
    supportsItin: true,
    acceptedIds: 'SSN / ITIN (9XX-XX-XXXX) + Matrícula Consular, Pasaporte Extranjero, CA AB 60 o State ID',
    atmNetwork: '55,000+ Allpoint & MoneyPass ATMs (Target, CVS, Walgreens, 7-Eleven, Kroger) + Retiro Total en Ventanilla Bancaria ($0)',
    stepsEs: [
      '1. Escanea el código QR de Open Payroll con la cámara de tu teléfono y elige "Español".',
      '2. Confirma tu nombre, celular y SSN o ITIN (acepta Matrícula Consular o Pasaporte).',
      '3. Toca "Agregar a Apple Wallet / Google Pay" — tu tarjeta virtual Visa y número de cuenta FBO quedan activos en 30 segundos.'
    ],
    stepsEn: [
      '1. Scan the Open Payroll QR code with your phone camera and select your preferred language.',
      '2. Confirm your legal name, mobile number, and SSN or ITIN (supports Matrícula Consular or Foreign Passport).',
      '3. Tap "Add to Apple Wallet / Google Pay" — your virtual Visa debit card and FDIC FBO account are live in 30 seconds.'
    ]
  },
  {
    id: 'comun',
    name: 'Comun (Banca Móvil en Español)',
    badgeEs: 'App Latina en tu Teléfono',
    badgeEn: 'Latino Mobile Banking App',
    sponsorBank: 'Community Federal Savings Bank (CFSB · Member FDIC)',
    routing: '026014928',
    cardNetwork: 'Comun Visa Debit + Envío de Remesas Integrado',
    supportsItin: true,
    acceptedIds: 'Matrícula Consular, Pasaporte de tu país, ITIN o SSN',
    atmNetwork: '55,000+ Allpoint ATMs sin comisión',
    stepsEs: [
      '1. Abre tu app Comun en el teléfono y entra a la pestaña "Cuenta" / "Depósito Directo".',
      '2. El número de ruta de Comun (CFSB 026014928) ya está pre-llenado automáticamente aquí.',
      '3. Toca "Copiar Número de Cuenta" en Comun y pégalo abajo para recibir tu sueldo sin comisiones.'
    ],
    stepsEn: [
      '1. Open your Comun app and tap the "Account" / "Direct Deposit" tab.',
      '2. Comun\'s sponsor bank routing number (CFSB 026014928) is auto-filled for you below.',
      '3. Tap "Copy Account Number" in Comun and paste it below for zero-fee direct deposit.'
    ]
  },
  {
    id: 'seis',
    name: 'Seis (Cuenta Bancaria en Español)',
    badgeEs: '100% en Español · Visa',
    badgeEn: 'Spanish-First Visa Banking',
    sponsorBank: 'Thread Bank (Member FDIC)',
    routing: '064209588',
    cardNetwork: 'Seis Visa Debit (Apple Pay & Google Wallet)',
    supportsItin: true,
    acceptedIds: 'Pasaporte, Matrícula Consular, ITIN o SSN',
    atmNetwork: '37,000+ MoneyPass ATMs sin comisión',
    stepsEs: [
      '1. Abre la app Seis en tu celular y toca "Depósito Directo" en la pantalla principal.',
      '2. El número de ruta de Seis (Thread Bank 064209588) se llena automáticamente.',
      '3. Copia tu número de cuenta de Seis y pégalo aquí.'
    ],
    stepsEn: [
      '1. Open the Seis app on your phone and tap "Direct Deposit" on the home screen.',
      '2. Seis\'s routing number (Thread Bank 064209588) is automatically filled in.',
      '3. Copy your Seis account number and paste it below.'
    ]
  },
  {
    id: 'cashapp',
    name: 'Cash App (Direct Deposit)',
    badgeEs: 'Depósito Directo Gratis',
    badgeEn: 'Free Direct Deposit + Cash Card',
    sponsorBank: 'Sutton Bank (Member FDIC)',
    routing: '041215663',
    cardNetwork: 'Cash App Visa Card (Apple Pay / Google Pay)',
    supportsItin: true,
    acceptedIds: 'SSN o ITIN verificado en Cash App',
    atmNetwork: 'Reembolso de cajeros ATM con depósito directo calificado',
    stepsEs: [
      '1. Abre Cash App y toca la pestaña "Dinero" ($) abajo a la izquierda.',
      '2. Toca "Depósito Directo" (Direct Deposit) y selecciona "Obtener Número de Cuenta".',
      '3. El número de ruta (Sutton Bank 041215663) ya está listo; copia y pega tu número de cuenta de Cash App.'
    ],
    stepsEn: [
      '1. Open Cash App and tap the "Money" ($) tab on the bottom left.',
      '2. Tap "Direct Deposit" and select "Get Account Number".',
      '3. Routing number (Sutton Bank 041215663) is pre-filled; copy and paste your Cash App account number.'
    ]
  },
  {
    id: 'chime',
    name: 'Chime (Checking Account)',
    badgeEs: 'Pago hasta 2 Días Antes',
    badgeEn: 'Up to 2-Day Early Payday',
    sponsorBank: 'The Bancorp Bank, N.A. / Stride Bank, N.A. (Member FDIC)',
    routing: '031101169',
    cardNetwork: 'Chime Visa Debit Card',
    supportsItin: false,
    acceptedIds: 'SSN / U.S. State ID',
    atmNetwork: '60,000+ cajeros ATM sin comisión (Walgreens, CVS, 7-Eleven, Target)',
    stepsEs: [
      '1. Abre Chime y toca "Configuración" (Settings) → "Información de Cuenta" (Account Info).',
      '2. Verifica el número de ruta (031101169 Bancorp o 103100195 Stride) y toca "Copiar Número de Cuenta".',
      '3. Pégalo abajo para activar tu depósito directo.'
    ],
    stepsEn: [
      '1. Open Chime and tap "Settings" → "Account Info".',
      '2. Confirm your routing number (031101169 Bancorp or 103100195 Stride) and tap "Copy Account Number".',
      '3. Paste it below to activate direct deposit.'
    ]
  },
  {
    id: 'venmo',
    name: 'Venmo Direct Deposit',
    badgeEs: 'Directo a tu Saldo Venmo',
    badgeEn: 'Direct to Venmo Balance & Card',
    sponsorBank: 'The Bancorp Bank, N.A. (Member FDIC)',
    routing: '031101169',
    cardNetwork: 'Venmo Mastercard Debit Card',
    supportsItin: true,
    acceptedIds: 'Cuenta Venmo verificada',
    atmNetwork: 'MoneyPass ATMs sin comisión con tarjeta Venmo',
    stepsEs: [
      '1. Abre Venmo, toca la pestaña "Tú" (Me) → icono de engrane → "Depósito Directo" (Direct Deposit).',
      '2. Toca "Mostrar número de cuenta" (Show Account Number).',
      '3. El número de ruta (031101169) está pre-cargado; pega tu número de cuenta de Venmo.'
    ],
    stepsEn: [
      '1. Open Venmo, tap the "Me" tab → gear icon → "Direct Deposit".',
      '2. Tap "Show Account Number".',
      '3. Routing number (031101169) is pre-filled; paste your Venmo account number.'
    ]
  },
  {
    id: 'oportun',
    name: 'Oportun / Majoritarian CDFI',
    badgeEs: 'CDFI Certificado · ITIN',
    badgeEn: 'Certified CDFI · ITIN Friendly',
    sponsorBank: 'Pathward, N.A. / Coastal Community Bank (Member FDIC)',
    routing: '091409571',
    cardNetwork: 'Visa Debit + Metas de Ahorro Automáticas',
    supportsItin: true,
    acceptedIds: 'ITIN, Matrícula Consular, Pasaporte o SSN',
    atmNetwork: 'Allpoint ATMs sin comisión',
    stepsEs: [
      '1. Abre tu app Oportun y selecciona "Depósito Directo" en el menú de tu tarjeta.',
      '2. Confirma el número de ruta (091409571) y copia tu número de cuenta.',
      '3. Pégalo abajo para recibir tu pago directamente.'
    ],
    stepsEn: [
      '1. Open your Oportun app and select "Direct Deposit" in your card menu.',
      '2. Confirm the routing number (091409571) and copy your account number.',
      '3. Paste it below to receive your pay directly.'
    ]
  }
];

export const memberBankBranches = [
  {id: 'chase', name: 'Chase Bank (Any Visa Member Branch)', rule: 'Visa Core Rules § 5.4.2.4 · OTC Manual Cash Disbursement ($0.00 Fee)'},
  {id: 'bofa', name: 'Bank of America (Any Visa Member Branch)', rule: 'Visa Core Rules § 5.4.2.4 · OTC Manual Cash Disbursement ($0.00 Fee)'},
  {id: 'wellsfargo', name: 'Wells Fargo Bank (Any Visa Member Branch)', rule: 'Visa Core Rules § 5.4.2.4 · OTC Manual Cash Disbursement ($0.00 Fee)'},
  {id: 'usbank', name: 'U.S. Bank (Any Visa Member Branch)', rule: 'Visa Core Rules § 5.4.2.4 · OTC Manual Cash Disbursement ($0.00 Fee)'},
  {id: 'citi', name: 'Citibank (Any Visa Member Branch)', rule: 'Visa Core Rules § 5.4.2.4 · OTC Manual Cash Disbursement ($0.00 Fee)'}
];

export const retailBarcodeMerchants = [
  {
    id: 'walmart',
    name: 'Walmart Service Desk / Register',
    network: 'VanillaDirect / GreenDot @ The Register',
    maxPerTx: 950,
    employerSponsoredFee: 0.00,
    networkPassThroughFee: 1.00,
    instructionsEs: 'Muestra este código de barras en cualquier caja registradora o MoneyCenter de Walmart y pide "Cash Out con Código de Barras VanillaDirect / GreenDot".',
    instructionsEn: 'Present this barcode at any Walmart register or MoneyCenter desk and request a "VanillaDirect / GreenDot Barcode Cash-Out".'
  },
  {
    id: '7eleven',
    name: '7-Eleven Register',
    network: 'VanillaDirect / GreenDot @ The Register',
    maxPerTx: 500,
    employerSponsoredFee: 0.00,
    networkPassThroughFee: 1.00,
    instructionsEs: 'Escanea el código de barras en la caja de 7-Eleven para recibir tu efectivo al instante (24/7).',
    instructionsEn: 'Scan the barcode at any 7-Eleven register for instant 24/7 cash pickup.'
  },
  {
    id: 'cvs',
    name: 'CVS Pharmacy Register',
    network: 'VanillaDirect Cash-Out',
    maxPerTx: 500,
    employerSponsoredFee: 0.00,
    networkPassThroughFee: 1.00,
    instructionsEs: 'Pasa por cualquier caja de CVS Pharmacy, muestra el código de barras en tu celular y recibe el efectivo.',
    instructionsEn: 'Show this phone barcode at any CVS Pharmacy checkout register to collect your cash.'
  },
  {
    id: 'walgreens',
    name: 'Walgreens Register',
    network: 'VanillaDirect / GreenDot Cash-Out',
    maxPerTx: 500,
    employerSponsoredFee: 0.00,
    networkPassThroughFee: 1.00,
    instructionsEs: 'Muestra el código de barras al cajero de Walgreens para retirar efectivo sin cuenta bancaria.',
    instructionsEn: 'Present this barcode to the Walgreens cashier for instant register cash pickup.'
  },
  {
    id: 'cardenas',
    name: 'FoodMaxx / Cardenas Markets / Vallarta Supermarkets',
    network: 'GreenDot / InComm Register Network',
    maxPerTx: 950,
    employerSponsoredFee: 0.00,
    networkPassThroughFee: 1.00,
    instructionsEs: 'Muestra este código en Servicio al Cliente o caja de Cardenas Markets / FoodMaxx / Vallarta para retirar efectivo mientras haces tu mandado.',
    instructionsEn: 'Show this barcode at Customer Service or checkout at Cardenas Markets / FoodMaxx / Vallarta to pick up cash while grocery shopping.'
  }
];

export const freeAtmDirectory = [
  {
    id: 'atm-target-94596',
    zip: '94596',
    neighborhood: 'Walnut Creek / Downtown (Near Va de Vi)',
    venue: 'Target Store #1428 — Allpoint NFC ATM',
    address: '1871 N Main St, Walnut Creek, CA 94596',
    network: 'Allpoint (55,000+ Free ATMs)',
    distance: '0.4 mi',
    dailyLimit: 800,
    fee: 0.00,
    nfcCardless: true,
    hours: '7:00 AM – 10:00 PM'
  },
  {
    id: 'atm-cvs-94596',
    zip: '94596',
    neighborhood: 'Walnut Creek / Broadway Plaza',
    venue: 'CVS Pharmacy #9214 — Allpoint 24hr NFC ATM',
    address: '1123 S California Blvd, Walnut Creek, CA 94596',
    network: 'Allpoint (55,000+ Free ATMs)',
    distance: '0.3 mi',
    dailyLimit: 800,
    fee: 0.00,
    nfcCardless: true,
    hours: 'Open 24 Hours'
  },
  {
    id: 'atm-7eleven-94520',
    zip: '94520',
    neighborhood: 'Concord / Monument Corridor',
    venue: '7-Eleven #23819 — MoneyPass & Allpoint NFC ATM',
    address: '1490 Monument Blvd, Concord, CA 94520',
    network: 'MoneyPass / Allpoint',
    distance: '0.2 mi',
    dailyLimit: 800,
    fee: 0.00,
    nfcCardless: true,
    hours: 'Open 24 Hours'
  },
  {
    id: 'atm-walgreens-94520',
    zip: '94520',
    neighborhood: 'Concord / Willow Pass',
    venue: 'Walgreens #04192 — Allpoint NFC ATM',
    address: '1800 Concord Ave, Concord, CA 94520',
    network: 'Allpoint (55,000+ Free ATMs)',
    distance: '0.5 mi',
    dailyLimit: 800,
    fee: 0.00,
    nfcCardless: true,
    hours: 'Open 24 Hours'
  },
  {
    id: 'atm-safeway-94601',
    zip: '94601',
    neighborhood: 'Oakland / Fruitvale Village',
    venue: 'Safeway / Walgreens Fruitvale — Allpoint NFC ATM',
    address: '3250 Foothill Blvd, Oakland, CA 94601',
    network: 'Allpoint (55,000+ Free ATMs)',
    distance: '0.2 mi',
    dailyLimit: 800,
    fee: 0.00,
    nfcCardless: true,
    hours: '6:00 AM – 12:00 AM'
  },
  {
    id: 'atm-circlek-75001',
    zip: '75001',
    neighborhood: 'Dallas / Addison TX',
    venue: 'Circle K & CVS — Allpoint / MoneyPass NFC ATM',
    address: '5010 Belt Line Rd, Dallas, TX 75001',
    network: 'Allpoint / MoneyPass',
    distance: '0.4 mi',
    dailyLimit: 800,
    fee: 0.00,
    nfcCardless: true,
    hours: 'Open 24 Hours'
  }
];

export const unbankedRelationalSchema = [
  {
    table: 'WORKERS',
    primaryKey: 'worker_id (UUID)',
    columns: [
      'worker_id UUID PRIMARY KEY',
      'employer_id UUID NOT NULL REFERENCES EMPLOYERS(employer_id)',
      'legal_name TEXT NOT NULL',
      'preferred_language VARCHAR(5) NOT NULL DEFAULT \'es\' CHECK (preferred_language IN (\'es\', \'en\'))',
      'tin_type VARCHAR(10) NOT NULL CHECK (tin_type IN (\'SSN\', \'ITIN\', \'EIN\'))',
      'tin_last4 CHAR(4) NOT NULL',
      'cip_id_type VARCHAR(40) NOT NULL -- US_STATE_ID, CA_AB60, MATRICULA_CONSULAR, FOREIGN_PASSPORT, EAD',
      'cip_verified_at TIMESTAMPTZ NOT NULL',
      'whatsapp_phone E164_PHONE NOT NULL',
      'ca_sick_hours_available NUMERIC(6,2) NOT NULL DEFAULT 40.00'
    ]
  },
  {
    table: 'WORKER_PAYOUT_DESTINATIONS',
    primaryKey: 'destination_id (UUID)',
    columns: [
      'destination_id UUID PRIMARY KEY',
      'worker_id UUID NOT NULL REFERENCES WORKERS(worker_id)',
      'bucket_type VARCHAR(20) NOT NULL CHECK (bucket_type IN (\'DAILY_SPEND\', \'FAMILY_REMITTANCE\', \'EMERGENCY_SAVINGS\'))',
      'provider_id VARCHAR(32) NOT NULL -- open_payroll_card, comun, seis, cashapp, chime, venmo, oportun',
      'odfi_routing_aba CHAR(9) NOT NULL',
      'account_number_encrypted BYTEA NOT NULL',
      'account_last4 CHAR(4) NOT NULL',
      'split_percentage NUMERIC(5,2) NOT NULL CHECK (split_percentage BETWEEN 0 AND 100)',
      'rege_consent_signed_at TIMESTAMPTZ NOT NULL',
      'ca_lab_213d_voluntary_consent BOOLEAN NOT NULL DEFAULT TRUE'
    ]
  },
  {
    table: 'PAYCARD_ACCOUNTS',
    primaryKey: 'paycard_id (UUID)',
    columns: [
      'paycard_id UUID PRIMARY KEY',
      'worker_id UUID NOT NULL REFERENCES WORKERS(worker_id)',
      'sponsor_bank VARCHAR(64) NOT NULL DEFAULT \'Column N.A. Member FDIC\'',
      'fbo_routing_aba CHAR(9) NOT NULL DEFAULT \'121145433\'',
      'fbo_account_last4 CHAR(4) NOT NULL',
      'visa_pan_last4 CHAR(4) NOT NULL',
      'apple_wallet_token_id VARCHAR(64)',
      'google_wallet_token_id VARCHAR(64)',
      'physical_card_status VARCHAR(24) NOT NULL DEFAULT \'MAILED_3DAY_EMV\'',
      'available_balance_cents BIGINT NOT NULL DEFAULT 0',
      'monthly_fee_cents INT NOT NULL DEFAULT 0 CHECK (monthly_fee_cents = 0)',
      'otc_teller_fee_cents INT NOT NULL DEFAULT 0 CHECK (otc_teller_fee_cents = 0)'
    ]
  },
  {
    table: 'CASH_OUT_TRANSACTIONS',
    primaryKey: 'cash_out_id (UUID)',
    columns: [
      'cash_out_id UUID PRIMARY KEY',
      'worker_id UUID NOT NULL REFERENCES WORKERS(worker_id)',
      'paycard_id UUID REFERENCES PAYCARD_ACCOUNTS(paycard_id)',
      'cash_out_path VARCHAR(32) NOT NULL CHECK (cash_out_path IN (\'PATH_A_OTC_BANK_TELLER\', \'PATH_B_RETAIL_BARCODE\', \'PATH_C_ALLPOINT_NFC_ATM\'))',
      'merchant_or_bank_name TEXT NOT NULL',
      'exact_amount_cents BIGINT NOT NULL CHECK (exact_amount_cents > 0)',
      'worker_fee_cents INT NOT NULL DEFAULT 0',
      'casa_de_cambio_fee_saved_cents INT NOT NULL',
      'reference_or_barcode_token VARCHAR(32) NOT NULL',
      'statutory_basis TEXT NOT NULL DEFAULT \'CA Labor Code § 212(a)(1) & Visa Core Rules § 5.4.2.4\'',
      'status VARCHAR(24) NOT NULL DEFAULT \'AUTHORIZED_READY\'',
      'created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()'
    ]
  }
];

export const remittanceCorridors = [
  {
    id: 'felix-whatsapp',
    provider: 'Félix Pago (por WhatsApp)',
    country: 'México, Guatemala, El Salvador, Honduras, Colombia',
    receivingBanks: 'BBVA México, BanCoppel, Banco Azteca, OXXO Spin, Elektra, Banrural, Banco Agrícola',
    railUsed: 'Tarjeta Virtual/Física Open Payroll Visa o Débito Conectado',
    typicalFee: '$0 primer envío · $2.99 envío digital (vs. $15–$20 en tienda de efectivo)',
    speed: 'Instantáneo (SPEI / Depósito o Retiro en Ventanilla en <5 min)'
  },
  {
    id: 'comun-remesas',
    provider: 'Comun Remesas Integradas',
    country: 'México y 15 países de Latinoamérica',
    receivingBanks: 'Elektra, OXXO, Soriana, Banorte, Santander, Davivienda, Banco Atlántida',
    railUsed: 'Saldo de Depósito Directo Comun (ACH $0)',
    typicalFee: 'Desde $2.49 tarifa plana digital sin sobrecargo de efectivo',
    speed: 'En minutos (Depósito Bancario o Efectivo en Sucursal)'
  },
  {
    id: 'remitly-digital',
    provider: 'Remitly / Wise Digital (Tarifa Débito/ACH)',
    country: 'México, Centroamérica, Sudamérica y el Caribe',
    receivingBanks: 'Más de 45,000 puntos de pago y bancos directos en Latinoamérica',
    railUsed: 'Número de Ruta/Cuenta FBO Open Payroll o Tarjeta Visa',
    typicalFee: 'Tarifa electrónica más baja (ahorra $12–$18 frente a agentes en efectivo)',
    speed: 'Express (Minutos) o Económico (ACH)'
  }
];

export const openPayrollCardDisclosures = {
  statutes: 'California Labor Code §§ 212(a)(1), 213(d), 226(a), 246(i), 351 · Federal CFPB Regulation E (12 CFR § 1005.18 & § 1005.10(e)(2)) · FinCEN CIP (31 CFR § 1020.220)',
  feeSchedule: [
    {itemEs: 'Cuota Mensual de Mantenimiento', itemEn: 'Monthly Maintenance Fee', openPayroll: '$0.00', checkCasher: '$15.00–$40.00 por cheque (1.5%–4.0%)'},
    {itemEs: 'Compras con Tarjeta / Apple Pay / Google Pay', itemEn: 'POS Swipe / Tap-to-Pay Transactions', openPayroll: '$0.00', checkCasher: 'No disponible (solo efectivo en mano)'},
    {itemEs: 'Retiro Total de Sueldo en Ventanilla Bancaria (CA § 212)', itemEn: 'OTC Bank Teller Full-Wage Cash Withdrawal (CA § 212)', openPayroll: '$0.00 (Ilimitado, hasta el último centavo)', checkCasher: '$15.00–$40.00 de comisión'},
    {itemEs: 'Cajeros Automáticos en Red (55,000+ Allpoint / MoneyPass)', itemEn: 'In-Network ATM Cash Withdrawal (55,000+ ATMs)', openPayroll: '$0.00 (Target, CVS, Walgreens, 7-Eleven)', checkCasher: '$3.50–$5.00 por retiro'},
    {itemEs: 'Transferencia ACH o División Automática de Pago', itemEn: 'ACH Transfer Out & Split Direct Deposit', openPayroll: '$0.00', checkCasher: '$12.00–$20.00 por giro / money order'},
    {itemEs: 'Consulta de Saldo y Recibo Digital por WhatsApp / SMS', itemEn: 'Balance Inquiry & WhatsApp / SMS Digital Paystub', openPayroll: '$0.00', checkCasher: 'Sin recibo digital interactivo'}
  ]
};

export const payrollPresets = [
  {
    id: 'restaurant',
    vertical: 'Open Restaurant',
    employer: 'Harbor & Hearth Bistro',
    ein: '94-3829104',
    state: 'CA',
    payFrequency: 'Bi-Weekly (26/yr)',
    w2Count: 48,
    contractorCount: 4,
    annualGrossPayroll: 1968893,
    annualTippedWages: 685000,
    legacyProvider: 'Restaurant POS + External Payroll Bureau',
    legacyAnnualFee: 7431,
    suiRate: 0.034,
    wcRate: 0.0214,
    highlight: 'Bi-weekly W-2 & 1099 payroll with bilingual Español/English unbanked digital wallets, instant end-of-shift tip pushes, CA § 226.7 break compliance, and IRS Form 8846 (§ 45B) FICA tip tax credits.',
    employees: [
      {id: 'EMP-101', name: 'Marco Bellini', role: 'Executive Chef (BOH Mgmt)', dept: 'Kitchen Management', type: 'W-2 Salary', rate: 4230.77, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 250, lang: 'en', tinType: 'SSN (•••-••-4812)', payoutMethod: 'chime', routingNumber: '031101169', accountLast4: '8821', splitSpendPct: 85, splitRemitPct: 0, splitSavePct: 15, sickHoursAvailable: 40.0},
      {id: 'EMP-102', name: 'Elena Martinez', role: 'Lead Line Cook (BOH Hourly)', dept: 'Kitchen Hourly', type: 'W-2 Hourly', rate: 26.50, hours: 80, overtimeHours: 4, tips: 0, mealPenalties: 1, preTax401k: 80, lang: 'es', tinType: 'ITIN (9XX-XX-7340 · Matrícula Consular)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '9042', splitSpendPct: 70, splitRemitPct: 20, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'EMP-103', name: 'Devon Brooks', role: 'Lead Sommelier & Server (FOH)', dept: 'Front of House', type: 'W-2 Tipped', rate: 16.50, hours: 72, overtimeHours: 0, tips: 2480.00, mealPenalties: 0, preTax401k: 180, lang: 'en', tinType: 'SSN (•••-••-1920)', payoutMethod: 'cashapp', routingNumber: '041215663', accountLast4: '3319', splitSpendPct: 80, splitRemitPct: 0, splitSavePct: 20, sickHoursAvailable: 34.5},
      {id: 'EMP-104', name: 'Chloe Nguyen', role: 'Bartender (FOH Bar)', dept: 'Bar Staff', type: 'W-2 Tipped', rate: 16.50, hours: 68, overtimeHours: 2, tips: 1920.00, mealPenalties: 0, preTax401k: 120, lang: 'en', tinType: 'SSN (•••-••-6104)', payoutMethod: 'venmo', routingNumber: '031101169', accountLast4: '5508', splitSpendPct: 90, splitRemitPct: 0, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'CON-201', name: 'Bay Area Hood & Duct Cleaning LLC', role: 'Nightly Exhaust Maintenance', dept: 'Repairs & Maintenance', type: '1099-NEC', rate: 850.00, hours: 1, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 0, lang: 'en', tinType: 'EIN (84-2910411)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '4401', splitSpendPct: 100, splitRemitPct: 0, splitSavePct: 0, sickHoursAvailable: 0}
    ]
  },
  {
    id: 'dentist',
    vertical: 'Open Dentist',
    employer: 'ClearSight Dental Studio PC',
    ein: '82-4910288',
    state: 'CA',
    payFrequency: 'Semi-Monthly (24/yr)',
    w2Count: 16,
    contractorCount: 3,
    annualGrossPayroll: 1185000,
    annualTippedWages: 0,
    legacyProvider: 'Dental Practice Payroll',
    legacyAnnualFee: 4680,
    suiRate: 0.024,
    wcRate: 0.0085,
    highlight: 'Semi-monthly clinical payroll with automated 32% Associate Doctor net-adjusted-production commission splits, dental lab-bill deductions, and direct ACH origination.',
    employees: [
      {id: 'EMP-201', name: 'Dr. Priya Nair, DDS', role: 'Associate Dentist (32% Net Prod)', dept: 'Clinical Doctor', type: 'W-2 Commission', rate: 9840.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 950, lang: 'en', tinType: 'SSN (•••-••-8102)', payoutMethod: 'chime', routingNumber: '031101169', accountLast4: '2190', splitSpendPct: 80, splitRemitPct: 0, splitSavePct: 20, sickHoursAvailable: 40.0},
      {id: 'EMP-202', name: 'Hannah Lindqvist, RDH', role: 'Registered Dental Hygienist', dept: 'Hygiene Production', type: 'W-2 Hourly', rate: 64.00, hours: 72, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 360, lang: 'en', tinType: 'SSN (•••-••-3911)', payoutMethod: 'venmo', routingNumber: '031101169', accountLast4: '7741', splitSpendPct: 90, splitRemitPct: 0, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'EMP-203', name: 'Maya Lin, RDA', role: 'Lead Dental Assistant', dept: 'Chairside Clinical', type: 'W-2 Hourly', rate: 31.00, hours: 80, overtimeHours: 2, tips: 0, mealPenalties: 0, preTax401k: 125, lang: 'en', tinType: 'SSN (•••-••-6219)', payoutMethod: 'cashapp', routingNumber: '041215663', accountLast4: '1184', splitSpendPct: 85, splitRemitPct: 0, splitSavePct: 15, sickHoursAvailable: 40.0},
      {id: 'EMP-204', name: 'Jordan Vance', role: 'Treatment Coordinator', dept: 'Front Office Admin', type: 'W-2 Salary', rate: 3125.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 200, lang: 'en', tinType: 'SSN (•••-••-4091)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '6012', splitSpendPct: 90, splitRemitPct: 0, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'CON-301', name: 'Dr. Marcus Sterling, DDS (Endo Specialist)', role: 'Visiting Endodontist (1099)', dept: 'Specialist Production', type: '1099-NEC', rate: 4200.00, hours: 1, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 0, lang: 'en', tinType: 'EIN (47-9910234)', payoutMethod: 'chime', routingNumber: '031101169', accountLast4: '9001', splitSpendPct: 100, splitRemitPct: 0, splitSavePct: 0, sickHoursAvailable: 0}
    ]
  },
  {
    id: 'landscape',
    vertical: 'Open Landscape Business',
    employer: 'Diablo Valley Landscape & Maintenance Inc.',
    ein: '68-1940211',
    state: 'CA',
    payFrequency: 'Weekly (52/yr)',
    w2Count: 38,
    contractorCount: 7,
    annualGrossPayroll: 1640000,
    annualTippedWages: 0,
    legacyProvider: 'Field Crew Time & Payroll',
    legacyAnnualFee: 8920,
    suiRate: 0.038,
    wcRate: 0.0640,
    highlight: 'Weekly bilingual field-crew payroll allocating every hour and workers-comp dollar to customer job costing, DIR certified payroll, and Comun/Seis/Open Payroll Wallet cards.',
    employees: [
      {id: 'EMP-301', name: 'Carlos Mendoza', role: 'Account Manager & Estimator', dept: 'Commercial Maintenance', type: 'W-2 Salary', rate: 1950.00, hours: 40, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 150, lang: 'es', tinType: 'SSN (•••-••-5512)', payoutMethod: 'comun', routingNumber: '026014928', accountLast4: '3108', splitSpendPct: 75, splitRemitPct: 15, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'EMP-302', name: 'Miguel Angel Reyes', role: 'Crew Foreman — Route 1 (Lucas Ranch)', dept: 'Field Crew Operations', type: 'W-2 Hourly', rate: 32.00, hours: 40, overtimeHours: 5, tips: 0, mealPenalties: 0, preTax401k: 80, lang: 'es', tinType: 'ITIN (9XX-XX-2841 · Matrícula Consular)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '7729', splitSpendPct: 70, splitRemitPct: 20, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'EMP-303', name: 'Luis Fernando Ortiz', role: 'Irrigation Technician', dept: 'Water & Irrigation', type: 'W-2 Hourly', rate: 28.50, hours: 40, overtimeHours: 2, tips: 0, mealPenalties: 0, preTax401k: 60, lang: 'es', tinType: 'ITIN (9XX-XX-6190 · Pasaporte)', payoutMethod: 'seis', routingNumber: '064209588', accountLast4: '4490', splitSpendPct: 65, splitRemitPct: 25, splitSavePct: 10, sickHoursAvailable: 36.0},
      {id: 'CON-401', name: 'Sierra Arborist Crane Services LLC', role: 'Subcontractor Tree Rigging', dept: 'Arborist Subcontract', type: '1099-NEC', rate: 1850.00, hours: 1, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 0, lang: 'en', tinType: 'EIN (68-4491022)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '8112', splitSpendPct: 100, splitRemitPct: 0, splitSavePct: 0, sickHoursAvailable: 0}
    ]
  },
  {
    id: 'golf',
    vertical: 'Open Golf Course OS',
    employer: 'Oakridge Championship Golf Club LLC',
    ein: '77-3091842',
    state: 'TX',
    payFrequency: 'Bi-Weekly (26/yr)',
    w2Count: 54,
    contractorCount: 8,
    annualGrossPayroll: 2150000,
    annualTippedWages: 390000,
    legacyProvider: 'Club Operations Payroll',
    legacyAnnualFee: 9840,
    suiRate: 0.019,
    wcRate: 0.0245,
    highlight: 'Tracks 6 USGA course departments (Agronomy, Pro Shop, Carts, F&B, Banquets, G&A), PGA lesson commission splits, and bilingual agronomy crew mobile wallets.',
    employees: [
      {id: 'EMP-401', name: 'Grant Callahan, GCSAA', role: 'Golf Course Superintendent', dept: '6100 Course & Grounds (Agronomy)', type: 'W-2 Salary', rate: 4615.38, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 350, lang: 'en', tinType: 'SSN (•••-••-9012)', payoutMethod: 'chime', routingNumber: '031101169', accountLast4: '1044', splitSpendPct: 85, splitRemitPct: 0, splitSavePct: 15, sickHoursAvailable: 40.0},
      {id: 'EMP-402', name: 'Brett Holloway, PGA', role: 'Head Golf Professional (85% Lesson Split)', dept: '6200 Golf Operations & Pro Shop', type: 'W-2 Salary', rate: 3461.54, hours: 80, overtimeHours: 0, tips: 1250.00, mealPenalties: 0, preTax401k: 250, lang: 'en', tinType: 'SSN (•••-••-3341)', payoutMethod: 'cashapp', routingNumber: '041215663', accountLast4: '6721', splitSpendPct: 90, splitRemitPct: 0, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'EMP-403', name: 'Mateo Silva', role: 'Lead Greenskeeper & Mechanic', dept: '6100 Course & Grounds (Agronomy)', type: 'W-2 Hourly', rate: 25.00, hours: 80, overtimeHours: 6, tips: 0, mealPenalties: 0, preTax401k: 90, lang: 'es', tinType: 'ITIN (9XX-XX-8814 · Matrícula Consular)', payoutMethod: 'comun', routingNumber: '026014928', accountLast4: '5291', splitSpendPct: 70, splitRemitPct: 20, splitSavePct: 10, sickHoursAvailable: 40.0}
    ]
  },
  {
    id: 'cpa',
    vertical: 'OpenCPA 2.0',
    employer: 'Allworth Advisory & Tax Solutions LLP',
    ein: '94-8821045',
    state: 'CA',
    payFrequency: 'Semi-Monthly (24/yr)',
    w2Count: 22,
    contractorCount: 5,
    annualGrossPayroll: 1890000,
    annualTippedWages: 0,
    legacyProvider: 'Accountant Wholesale Payroll',
    legacyAnnualFee: 5400,
    suiRate: 0.018,
    wcRate: 0.0042,
    highlight: 'Runs firm payroll and client accounting services (CAS) payroll runs with automated S-Corp Officer W-2 reasonable-compensation & >2% shareholder medical inclusion.',
    employees: [
      {id: 'EMP-501', name: 'Senior Tax Manager, CPA', role: 'Tax Controversy & 1120S Review', dept: 'Tax Advisory Practice', type: 'W-2 Salary', rate: 6250.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 850, lang: 'en', tinType: 'SSN (•••-••-7712)', payoutMethod: 'chime', routingNumber: '031101169', accountLast4: '4018', splitSpendPct: 80, splitRemitPct: 0, splitSavePct: 20, sickHoursAvailable: 40.0},
      {id: 'EMP-502', name: 'CAS Client Controller', role: 'Multi-Entity Client Close Lead', dept: 'Client Accounting Services', type: 'W-2 Salary', rate: 4375.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 450, lang: 'en', tinType: 'SSN (•••-••-2298)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '8904', splitSpendPct: 85, splitRemitPct: 0, splitSavePct: 15, sickHoursAvailable: 40.0}
    ]
  },
  {
    id: 'church',
    vertical: 'OpenChurch',
    employer: 'St. Jude Parish & K-8 Academy',
    ein: '94-1102938',
    state: 'CA',
    payFrequency: 'Semi-Monthly (24/yr)',
    w2Count: 28,
    contractorCount: 6,
    annualGrossPayroll: 1120000,
    annualTippedWages: 0,
    legacyProvider: 'Parish Fund Payroll',
    legacyAnnualFee: 5120,
    suiRate: 0.000,
    wcRate: 0.0110,
    highlight: 'Native IRC § 107 Clergy Housing Allowance exclusion (SECA vs. FICA exemption) and automated multi-fund allocation across General Parish Operating and School Funds.',
    employees: [
      {id: 'EMP-601', name: 'Rev. Thomas Morales', role: 'Senior Pastor (IRC § 107 Housing Allowance)', dept: '100 General Parish Fund', type: 'W-2 Clergy (§107)', rate: 3400.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 300, lang: 'es', tinType: 'SSN (•••-••-1104)', payoutMethod: 'comun', routingNumber: '026014928', accountLast4: '6610', splitSpendPct: 80, splitRemitPct: 10, splitSavePct: 10, sickHoursAvailable: 40.0},
      {id: 'EMP-602', name: 'Claire Donovan', role: 'Parish Music & Liturgy Director', dept: '100 General Parish Fund', type: 'W-2 Salary', rate: 2450.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 150, lang: 'en', tinType: 'SSN (•••-••-9940)', payoutMethod: 'open_payroll_card', routingNumber: '121145433', accountLast4: '2309', splitSpendPct: 90, splitRemitPct: 0, splitSavePct: 10, sickHoursAvailable: 40.0}
    ]
  }
];

export const taxFilingsCatalog = [
  {
    id: 'form-941',
    code: 'IRS Form 941',
    authority: 'Internal Revenue Service (MeF / EFTPS)',
    frequency: 'Quarterly (Due Apr 30, Jul 31, Oct 31, Jan 31)',
    title: "Employer's Quarterly Federal Tax Return",
    purpose: 'Reports federal income tax withheld, employee & employer Social Security (6.2% each up to $176,100 cap), and Medicare (1.45% each + 0.9% Additional Medicare) reconciled against semi-weekly/monthly EFTPS deposits.',
    status: 'Auto-Prepared & Ready for 1-Click MeF XML Transmission'
  },
  {
    id: 'form-940',
    code: 'IRS Form 940',
    authority: 'Internal Revenue Service (MeF / EFTPS)',
    frequency: 'Annual (Due Jan 31)',
    title: "Employer's Annual Federal Unemployment (FUTA) Tax Return",
    purpose: 'Calculates 6.0% gross FUTA less 5.4% state unemployment credit (= 0.6% net effective rate on first $7,000 per employee, or $42.00 max per employee/year) with credit-reduction state verification.',
    status: 'Accrued & Reconciled in @openscaffold/books Account 2140'
  },
  {
    id: 'ca-de9',
    code: 'CA EDD DE-9 & DE-9C',
    authority: 'California Employment Development Department (e-Services for Business)',
    frequency: 'Quarterly',
    title: 'Quarterly Contribution Return and Report of Wages (Continuation)',
    purpose: 'Reports California UI, ETT (0.1%), SDI (1.1%), and PIT withholding with individual employee wage-item lines.',
    status: 'XML Packet Validated against EDD Schema v2026.1'
  },
  {
    id: 'form-w2',
    code: 'SSA Form W-2 / W-3',
    authority: 'Social Security Administration (BSO EFW2)',
    frequency: 'Annual (Due Jan 31)',
    title: 'Wage and Tax Statement (Boxes 1–20 + Box 12/14 Codes)',
    purpose: 'Generates employee portal PDF W-2s + SSA EFW2 electronic submission including Box 7 Social Security tips, Box 12 Code D (401k), and Box 14 CA SDI / IRC § 107 clergy housing.',
    status: 'Live Continuous Preview (Zero Year-End Crunch)'
  },
  {
    id: 'form-1099',
    code: 'IRS Form 1099-NEC',
    authority: 'Internal Revenue Service (IRIS API)',
    frequency: 'Annual (Due Jan 31)',
    title: 'Nonemployee Compensation ($600+ Threshold + TIN Match)',
    purpose: 'Automatically tracks all vendor/subcontractor payments across @openscaffold/payroll and @openscaffold/books AP, verifies W-9 TINs, and e-files Form 1099-NEC via IRS IRIS.',
    status: 'W-9 TIN Verified · Ready for IRIS E-File'
  },
  {
    id: 'form-8846',
    code: 'IRS Form 8846 (§ 45B)',
    authority: 'Internal Revenue Service (General Business Credit -> Form 3800 / K-1)',
    frequency: 'Annual Tax Return Attachment',
    title: 'Credit for Employer Social Security and Medicare Taxes Paid on Certain Employee Tips',
    purpose: 'Dollar-for-dollar federal income tax credit equal to 7.65% employer FICA paid on reported food & beverage tips in excess of the federal minimum wage threshold.',
    status: 'Live Tip Credit Accumulator Active'
  }
];

export const sponsorBanks = [
  {
    id: 'column',
    name: 'Column N.A. (Direct ODFI API)',
    routing: '121145433',
    achFee: 0.10,
    fednowFee: 0.045,
    cutoff: 'Same-Day ACH 4:45 PM PT · FedNow 24/7/365',
    settlementModel: 'Direct Employer Account Origination or FBO Payroll Tax Impound Account'
  },
  {
    id: 'increase',
    name: 'Increase / First Internet Bank ODFI',
    routing: '074909962',
    achFee: 0.15,
    fednowFee: 0.045,
    cutoff: 'Same-Day ACH 4:30 PM PT · FedNow 24/7/365',
    settlementModel: 'Direct API NACHA PPD/CCD & EFTPS Tax Credit Origination'
  },
  {
    id: 'crossriver',
    name: 'Cross River Bank Payroll Rails',
    routing: '021214891',
    achFee: 0.15,
    fednowFee: 0.050,
    cutoff: 'Same-Day ACH 5:00 PM ET · RTP / FedNow 24/7/365',
    settlementModel: 'Regulated Sponsor Bank FBO Omnibus Clearing'
  }
];

export const verticalLaborRules = [
  {
    id: 'ca-meal-break',
    vertical: 'Open Restaurant / Hospitality / Retail',
    title: 'CA Labor Code § 226.7 Meal & Rest Break Premium Guard',
    problem: 'California employers must pay 1.0 hour of regular rate of pay (including shift differentials and non-discretionary bonuses) whenever a 5+ hour shift misses a timely 30-minute uninterrupted meal break before the end of the 5th hour.',
    solution: 'Alerts the floor manager at Hour 4:15 via POS/watch before a violation occurs, and when a penalty is owed, calculates the exact regular-rate-of-pay premium under Ferra v. Loews Hollywood Hotel.'
  },
  {
    id: 'unbanked-paycard-compliance',
    vertical: 'Open Restaurant / Open Landscape Business / Open Golf Course OS',
    title: 'CA Labor Code §§ 212 & 213(d) + CFPB Reg E Unbanked Wage-Access Rule',
    problem: 'Employers cannot mandate a payroll card that charges fees to access full wages, and unbanked workers lose 1.5%–4.0% ($15–$40 per $1,000 check) at predatory check-cashing storefronts.',
    solution: '60-second bilingual (Español/English) QR onboarding connects existing Cash App/Comun/Seis/Chime/Venmo accounts or provisions a $0-fee Open Payroll Visa Wallet Card with 55,000+ free ATMs and unlimited $0 bank teller full-wage cash withdrawals.'
  },
  {
    id: 'fica-tip-credit',
    vertical: 'Open Restaurant / Open Golf Course OS / Open Caterer',
    title: 'IRS § 45B (Form 8846) Employer FICA Tip Tax Credit Engine',
    problem: 'Restaurants and clubs pay 7.65% employer FICA on every dollar of reported tips and must compute the exact per-employee minimum-wage baseline required for IRS Form 8846.',
    solution: 'Every pay run and instant end-of-shift tip push automatically computes creditable tips above the § 45B statutory baseline and exports the exact Form 8846 schedule directly to OpenCPA 2.0 and owner K-1s.'
  },
  {
    id: 'dental-associate-split',
    vertical: 'Open Dentist / OpenChiropractor / OpenSalon',
    title: 'Clinical Associate Net-Collection vs. Production Split + Lab Deduction',
    problem: 'Clinical practices must calculate 30%–35% associate doctor compensation net of insurance write-offs, patient refunds, and 50% crown/bridge dental lab invoices.',
    solution: 'Pulls settled procedure collections and matched dental lab AP bills directly from @openscaffold/books to compute exact associate W-2 or 1099 compensation with a 1-click audit trail.'
  },
  {
    id: 'job-cost-dir',
    vertical: 'Open Landscape Business / Open Property Developer',
    title: 'GPS Crew Job-Cost Allocation & DIR Certified Payroll (WH-347)',
    problem: 'Field contractors must allocate crew wages and high workers-comp rates (6%–12%) across commercial maintenance routes and prevailing-wage public works jobs.',
    solution: 'Every clocked crew hour automatically tags the property/job dimension and posts exact burdened labor + workers-comp cost to that job P&L.'
  },
  {
    id: 'scorp-clergy',
    vertical: 'OpenCPA 2.0 / OpenChurch / OpenLawFirm',
    title: 'S-Corp Officer Reasonable Comp & IRC § 107 Clergy Housing Guard',
    problem: 'S-Corp owners (>2% shareholders) need health insurance added to Box 1 (exempt from FICA Boxes 3/5), and clergy under IRC § 107 are exempt from income tax withholding on designated housing allowances while subject to SECA.',
    solution: 'Native S-Corp >2% shareholder medical inclusion and IRC § 107 clergy housing allowance rules built directly into the pay-run calculator.'
  }
];
