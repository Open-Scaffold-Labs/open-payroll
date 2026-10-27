# Open Payroll OS (`@openscaffold/payroll` v1.0)

**White-Label ADP, Gusto, Paychex & Rippling Replacement across all 17 Open Scaffold Labs Verticals**

Live Production URLs:
- `https://open-payroll-os.vercel.app`
- `https://www.openscaffoldlabs.com/products/open-payroll/`

## Architectural Overview

Legacy payroll bureaus (ADP, Gusto, Paychex, Rippling, Restaurant365/Ctuit) charge small businesses `$2,500 to $12,000+/year` (`$40–$150/month` base plus `$6–$18 per employee per month`, plus add-on fees for timecards, W-2/1099 e-filing, multi-state tax, and workers' comp sync) for what is strictly:
1. **Deterministic Tax-Table Math (`$0.00` In-House Software):** Federal income tax (IRS Pub 15-T), FICA (`6.2%` OASDI + `1.45%` Medicare + `0.9%` Additional Medicare), FUTA (`0.6%`), and 50-state SIT/SUI/SDI withholding.
2. **Direct Sponsor Bank NACHA PPD/CCD & FedNow Payouts (`$0.15` flat ACH / `$0.045` FedNow):** Originates employee direct deposits and contractor 1099 payouts straight from the employer's bank account via our Sponsor Bank ODFI (`Column`, `Increase`, `Cross River`) without holding float or charging per-head rent.
3. **Automated IRS EFTPS & 50-State XML E-Filing:** Generates and transmits quarterly IRS Form 941, annual Form 940, SSA Form W-2/W-3, IRS Form 1099-NEC, and state unemployment/withholding returns (e.g., California EDD `DE-9` and `DE-9C`).
4. **Vertical Labor Intelligence & Wage-Hour Shield:** Built-in California Labor Code § 226.7 meal/rest break premium auto-detection, restaurant tip-pooling & Form 8027 / § 45B FICA Tip Tax Credit calculation, dental associate collection/production splits, and prevailing-wage / job-cost allocation.
5. **Instant `$0.00`-Variance `@openscaffold/books` v3.3 Journal Sync:** Every pay run writes balanced multi-dimensional journal entries (Gross Wages, Employer Payroll Taxes, Benefits, Tax Liabilities, and Net Direct Deposit Clearing) directly into Open Books.
