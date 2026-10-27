export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(JSON.stringify({
    protocol: 'openscaffold-mcp/v1',
    service: '@openscaffold/payroll',
    version: '1.0.0',
    doors: ['human-ui', 'agent-mcp'],
    tools: [
      {name: 'payroll.calculate_pay_run', description: 'Calculate gross-to-net W-2 & 1099 pay run with FICA, FUTA, SUI, federal/state withholding, tip credit, and CA meal-break penalty compliance.'},
      {name: 'payroll.originate_ach_batch', description: 'Originate $0.15 NACHA PPD/CCD direct-deposit batch or $0.045 FedNow instant earned-wage payout via Sponsor Bank ODFI.'},
      {name: 'payroll.generate_tax_filings', description: 'Generate IRS Form 941, Form 940, Form W-2, Form 1099-NEC, and State DE-9 / DE-9C e-file XML packets + EFTPS tax deposit.'},
      {name: 'payroll.post_books_journal', description: 'Post balanced double-entry payroll journal to @openscaffold/books v3.3 with $0.00 variance across department/fund/job dimensions.'}
    ]
  }));
}
