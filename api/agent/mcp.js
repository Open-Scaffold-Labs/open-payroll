export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(JSON.stringify({
    protocol: 'openscaffold-mcp/v1',
    service: '@openscaffold/payroll',
    version: '1.1.0',
    doors: ['human-ui', 'agent-mcp'],
    tools: [
      {name: 'payroll.calculate_pay_run', description: 'Calculate gross-to-net W-2 & 1099 pay run with FICA, FUTA, SUI, federal/state withholding, tip credit, and CA meal-break penalty compliance.'},
      {name: 'payroll.originate_ach_batch', description: 'Originate $0.15 NACHA PPD/CCD direct-deposit batch or $0.045 FedNow instant earned-wage payout via Sponsor Bank ODFI.'},
      {name: 'payroll.provision_worker_wallet', description: 'Provision bilingual (Español/English) $0-fee FDIC-insured FBO account & instant Apple/Google Wallet Visa debit card or connect Cash App/Comun/Seis/Chime/Venmo under CA Labor Code §§ 212/213(d) & CFPB Reg E.'},
      {name: 'payroll.push_instant_shift_tips', description: 'Push instant (<5s) end-of-shift tips or earned wages via Visa Direct OCT / FedNow with automatic W-2 Box 7 logging and IRS Form 8846 (§ 45B) FICA tip tax credit calculation.'},
      {name: 'payroll.configure_split_deposit', description: 'Configure automated Split Direct Deposit (Dividir Mi Pago) across daily spending, cross-border family remittance reserve (Félix Pago WhatsApp / Comun / Remitly / Wise), and emergency savings.'},
      {name: 'payroll.generate_tax_filings', description: 'Generate IRS Form 941, Form 940, Form W-2, Form 1099-NEC, and State DE-9 / DE-9C e-file XML packets + EFTPS tax deposit.'},
      {name: 'payroll.post_books_journal', description: 'Post balanced double-entry payroll & tip-clearing journals to @openscaffold/books v3.3 with $0.00 variance across department/fund/job dimensions.'}
    ]
  }));
}
