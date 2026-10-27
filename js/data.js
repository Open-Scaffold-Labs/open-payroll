export const clone = value => JSON.parse(JSON.stringify(value));

export const architectureLayers = [
  {
    id: 'layer-1',
    number: 'Layer 1',
    title: 'Gross-to-Net Tax Math, Timecards & Multi-State Withholding Engine',
    replacement: '100% In-House Open Scaffold Tax & Time Engine ($0.00 Per-Employee Fee)',
    legacyTax: '$40–$150/mo base + $6 to $18 per employee/month (ADP, Gusto, Paychex, Rippling)',
    openPayrollCost: '$0.00 per-employee fee — included in Open Payroll OS ($299/yr standalone or embedded)',
    summary: 'Eliminates per-head SaaS rent by running IRS Publication 15-T federal brackets, FICA (6.2% OASDI + 1.45% Medicare), FUTA (0.6%), and 50-state SIT/SDI/SUI withholding tables natively inside @openscaffold/payroll.',
    modules: ['@openscaffold/payroll', '@openscaffold/schedule v0.1', '@openscaffold/books v3.3'],
    savingMetric: '$2,400–$9,600/yr saved in per-head payroll fees'
  },
  {
    id: 'layer-2',
    number: 'Layer 2',
    title: 'Direct Sponsor Bank NACHA PPD/CCD & FedNow Instant Wage Rails',
    replacement: 'Direct ODFI Sponsor Bank Origination (Column, Increase, Cross River)',
    legacyTax: '3-to-4 day artificial float holds + $1.50–$3.00 per contractor payout or same-day fee',
    openPayrollCost: '$0.15 flat NACHA PPD/CCD direct deposit · $0.045 FedNow instant earned-wage payout',
    summary: 'Originates employee W-2 direct deposits (PPD) and contractor 1099 payouts (CCD) directly through regulated Sponsor Bank ODFI rails without seizing 4-day float on employer payroll cash.',
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
    legacyTax: 'Generic payroll apps miss CA Labor Code § 226.7 break rules and § 45B FICA tip credits',
    openPayrollCost: 'Built-in CA meal/rest break guard, Form 8846 (§ 45B) FICA Tip Credit, and associate splits',
    summary: 'Protects employers from PAGA/wage-hour class actions with real-time meal-break alerts while automatically generating IRS Form 8846 so restaurants recover 7.65% FICA taxes paid on tipped wages above minimum wage.',
    modules: ['CA § 226.7 Meal-Break Guard', 'IRS Form 8846 (§ 45B) Tip Credit', 'Dental Associate Net-Collection Split', 'Prevailing Wage & Certified Payroll'],
    savingMetric: '$8,000–$35,000/yr in § 45B tip tax credits & penalty prevention'
  },
  {
    id: 'layer-5',
    number: 'Layer 5',
    title: 'Instant $0.00-Variance @openscaffold/books v3.3 Multi-Dimensional GL Sync',
    replacement: 'Native Double-Entry Posting by Department, Job, Fund & Location',
    legacyTax: '$500–$3,400/mo in outsourced bookkeeping to re-key payroll journals & accrue PTO/labor',
    openPayrollCost: 'Instant balanced journal entry into @openscaffold/books v3.3 on every pay run',
    summary: 'Every pay run automatically posts Gross Wages, Employer FICA/FUTA/SUI, Workers Comp accrual, Employee Withholding Liabilities, and Net Direct Deposit Clearing across departments (e.g., BOH vs FOH, Hygiene vs Doctor, Crew A vs Crew B).',
    modules: ['@openscaffold/books v3.3 Bridge', 'Workers Comp Pay-As-You-Go Accrual', 'Zero-PBC CPA Audit Package'],
    savingMetric: 'Eliminates manual payroll journal entry & reconciliations'
  }
];

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
    legacyProvider: 'Mise En Place / Ctuit + ADP',
    legacyAnnualFee: 7431,
    suiRate: 0.034,
    wcRate: 0.0214,
    highlight: 'Replaces $7,431/yr payroll fees + claims $38,420/yr in IRS Form 8846 (§ 45B) FICA Tip Credits + cuts $34,503 meal-break penalties',
    employees: [
      {id: 'EMP-101', name: 'Marco Bellini', role: 'Executive Chef (BOH Mgmt)', dept: 'Kitchen Management', type: 'W-2 Salary', rate: 4230.77, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 250},
      {id: 'EMP-102', name: 'Elena Martinez', role: 'Lead Line Cook (BOH Hourly)', dept: 'Kitchen Hourly', type: 'W-2 Hourly', rate: 26.50, hours: 80, overtimeHours: 4, tips: 0, mealPenalties: 1, preTax401k: 80},
      {id: 'EMP-103', name: 'Devon Brooks', role: 'Lead Sommelier & Server (FOH)', dept: 'Front of House', type: 'W-2 Tipped', rate: 16.50, hours: 72, overtimeHours: 0, tips: 2480.00, mealPenalties: 0, preTax401k: 180},
      {id: 'EMP-104', name: 'Chloe Nguyen', role: 'Bartender (FOH Bar)', dept: 'Bar Staff', type: 'W-2 Tipped', rate: 16.50, hours: 68, overtimeHours: 2, tips: 1920.00, mealPenalties: 0, preTax401k: 120},
      {id: 'CON-201', name: 'Bay Area Hood & Duct Cleaning LLC', role: 'Nightly Exhaust Maintenance', dept: 'Repairs & Maintenance', type: '1099-NEC', rate: 850.00, hours: 1, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 0}
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
    legacyProvider: 'Gusto Complete + Manual Associate Excel Splits',
    legacyAnnualFee: 4680,
    suiRate: 0.024,
    wcRate: 0.0085,
    highlight: 'Replaces $4,680/yr Gusto fees + automates 32% Associate Doctor net-adjusted-production commission splits with lab-bill deduction',
    employees: [
      {id: 'EMP-201', name: 'Dr. Priya Nair, DDS', role: 'Associate Dentist (32% Net Prod)', dept: 'Clinical Doctor', type: 'W-2 Commission', rate: 9840.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 950},
      {id: 'EMP-202', name: 'Hannah Lindqvist, RDH', role: 'Registered Dental Hygienist', dept: 'Hygiene Production', type: 'W-2 Hourly', rate: 64.00, hours: 72, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 360},
      {id: 'EMP-203', name: 'Maya Lin, RDA', role: 'Lead Dental Assistant', dept: 'Chairside Clinical', type: 'W-2 Hourly', rate: 31.00, hours: 80, overtimeHours: 2, tips: 0, mealPenalties: 0, preTax401k: 125},
      {id: 'EMP-204', name: 'Jordan Vance', role: 'Treatment Coordinator', dept: 'Front Office Admin', type: 'W-2 Salary', rate: 3125.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 200},
      {id: 'CON-301', name: 'Dr. Marcus Sterling, DDS (Endo Specialist)', role: 'Visiting Endodontist (1099)', dept: 'Specialist Production', type: '1099-NEC', rate: 4200.00, hours: 1, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 0}
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
    legacyProvider: 'ADP Run + ExakTime GPS Timecards',
    legacyAnnualFee: 8920,
    suiRate: 0.038,
    wcRate: 0.0640,
    highlight: 'Replaces $8,920/yr ADP + ExakTime fees + allocates every crew hour & workers-comp dollar directly to customer job costing & DIR certified payroll',
    employees: [
      {id: 'EMP-301', name: 'Carlos Mendoza', role: 'Account Manager & Estimator', dept: 'Commercial Maintenance', type: 'W-2 Salary', rate: 1950.00, hours: 40, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 150},
      {id: 'EMP-302', name: 'Miguel Angel Reyes', role: 'Crew Foreman — Route 1 (Lucas Ranch)', dept: 'Field Crew Operations', type: 'W-2 Hourly', rate: 32.00, hours: 40, overtimeHours: 5, tips: 0, mealPenalties: 0, preTax401k: 80},
      {id: 'EMP-303', name: 'Luis Fernando Ortiz', role: 'Irrigation Technician', dept: 'Water & Irrigation', type: 'W-2 Hourly', rate: 28.50, hours: 40, overtimeHours: 2, tips: 0, mealPenalties: 0, preTax401k: 60},
      {id: 'CON-401', name: 'Sierra Arborist Crane Services LLC', role: 'Subcontractor Tree Rigging', dept: 'Arborist Subcontract', type: '1099-NEC', rate: 1850.00, hours: 1, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 0}
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
    legacyProvider: 'Paychex Flex + Clubessential Time',
    legacyAnnualFee: 9840,
    suiRate: 0.019,
    wcRate: 0.0245,
    highlight: 'Replaces $9,840/yr Paychex fees + tracks 6 USGA course departments (Agronomy, Pro Shop, Carts, F&B, Banquets, G&A) + PGA lesson commission splits',
    employees: [
      {id: 'EMP-401', name: 'Grant Callahan, GCSAA', role: 'Golf Course Superintendent', dept: '6100 Course & Grounds (Agronomy)', type: 'W-2 Salary', rate: 4615.38, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 350},
      {id: 'EMP-402', name: 'brett Holloway, PGA', role: 'Head Golf Professional (85% Lesson Split)', dept: '6200 Golf Operations & Pro Shop', type: 'W-2 Salary', rate: 3461.54, hours: 80, overtimeHours: 0, tips: 1250.00, mealPenalties: 0, preTax401k: 250},
      {id: 'EMP-403', name: 'Mateo Silva', role: 'Lead Greenskeeper & Mechanic', dept: '6100 Course & Grounds (Agronomy)', type: 'W-2 Hourly', rate: 25.00, hours: 80, overtimeHours: 6, tips: 0, mealPenalties: 0, preTax401k: 90}
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
    legacyProvider: 'ADP Wholesale Accountant Payroll',
    legacyAnnualFee: 5400,
    suiRate: 0.018,
    wcRate: 0.0042,
    highlight: 'Lets CPA firms run both their own firm payroll and wholesale CAS client payroll runs in 1 click with automatic S-Corp Officer W-2 reasonable-comp guardrails',
    employees: [
      {id: 'EMP-501', name: 'Senior Tax Manager, CPA', role: 'Tax Controversy & 1120S Review', dept: 'Tax Advisory Practice', type: 'W-2 Salary', rate: 6250.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 850},
      {id: 'EMP-502', name: 'CAS Client Controller', role: 'Multi-Entity Client Close Lead', dept: 'Client Accounting Services', type: 'W-2 Salary', rate: 4375.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 450}
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
    legacyProvider: 'Paycor / MinistryWorks',
    legacyAnnualFee: 5120,
    suiRate: 0.000,
    wcRate: 0.0110,
    highlight: 'Native IRC § 107 Clergy Housing Allowance exclusion (SECA vs FICA exemption) + automatic multi-fund allocation across Parish Operating vs School Fund',
    employees: [
      {id: 'EMP-601', name: 'Rev. Thomas Morales', role: 'Senior Pastor (IRC § 107 Housing Allowance)', dept: '100 General Parish Fund', type: 'W-2 Clergy (§107)', rate: 3400.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 300},
      {id: 'EMP-602', name: 'Claire Donovan', role: 'Parish Music & Liturgy Director', dept: '100 General Parish Fund', type: 'W-2 Salary', rate: 2450.00, hours: 80, overtimeHours: 0, tips: 0, mealPenalties: 0, preTax401k: 150}
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
    problem: 'California employers must pay 1.0 hour of regular rate of pay (including shift differentials/non-discretionary bonuses) whenever a 5+ hour shift misses a timely 30-minute uninterrupted meal break before the end of the 5th hour. Legacy systems only catch this at payroll time after the penalty is already owed (e.g., $34,503/yr at a single bistro).',
    solution: 'Open Payroll OS + @openscaffold/schedule alerts the floor manager at Hour 4:15 via POS/watch before the violation occurs, and when a penalty is owed, calculates the exact regular-rate-of-pay premium under Ferra v. Loews Hollywood Hotel.'
  },
  {
    id: 'fica-tip-credit',
    vertical: 'Open Restaurant / Open Golf Course OS / Open Caterer',
    title: 'IRS § 45B (Form 8846) Employer FICA Tip Tax Credit Engine',
    problem: 'Restaurants and clubs pay 7.65% employer FICA on every dollar of credit-card tips, yet many bookkeepers fail to compute the exact per-employee minimum-wage baseline required for IRS Form 8846.',
    solution: 'Every pay run automatically computes creditable tips above the § 45B statutory baseline and exports the exact Form 8846 schedule directly to OpenCPA 2.0 and the owners K-1s.'
  },
  {
    id: 'dental-associate-split',
    vertical: 'Open Dentist / OpenChiropractor / OpenSalon',
    title: 'Clinical Associate Net-Collection vs. Production Split + Lab Deduction',
    problem: 'Dental practices spend hours in spreadsheets calculating 30%–35% associate pay net of insurance write-offs, patient refunds, and 50% crown/bridge dental lab invoices.',
    solution: 'Pulls settled procedure collections and matched dental lab AP bills directly from @openscaffold/books to compute exact associate W-2 or 1099 compensation with a 1-click audit trail.'
  },
  {
    id: 'job-cost-dir',
    vertical: 'Open Landscape Business / Open Property Developer',
    title: 'GPS Crew Job-Cost Allocation & DIR Certified Payroll (WH-347)',
    problem: 'Contractors pay $8–$12/tech/mo for ExakTime/ClockShark and still have to manually split crew wages and high workers-comp rates (6%–12%) across commercial maintenance contracts.',
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
