import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
export function createAppServer(){return createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(path==='/api/agent/mcp'){
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
  res.end(JSON.stringify({
   protocol:'openscaffold-mcp/v1',
   service:'@openscaffold/payroll',
   version:'1.0.0',
   doors:['human-ui','agent-mcp'],
   tools:[
    {name:'payroll.calculate_pay_run',description:'Calculate gross-to-net W-2 & 1099 pay run with FICA, FUTA, SUI, federal/state withholding, tip credit, and CA meal-break penalty compliance.'},
    {name:'payroll.originate_ach_batch',description:'Originate $0.15 NACHA PPD/CCD direct-deposit batch or $0.045 FedNow instant earned-wage payout via Sponsor Bank ODFI.'},
    {name:'payroll.generate_tax_filings',description:'Generate IRS Form 941, Form 940, Form W-2, Form 1099-NEC, and State DE-9 / DE-9C e-file XML packets + EFTPS tax deposit.'},
    {name:'payroll.post_books_journal',description:'Post balanced double-entry payroll journal to @openscaffold/books v3.3 with $0.00 variance across department/fund/job dimensions.'}
   ]
  }));
  return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
 if(path!=='/'&&path!=='/index.html'&&!/^\/(js\/[a-z-]+\.js|css\/styles\.css)$/.test(path)){res.writeHead(404);res.end('Not found');return;}
 const file=resolve(root,'.'+(path==='/'?'/index.html':path));
 const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)],'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Not found');}});}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createAppServer();server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`Open Payroll OS: http://localhost:${server.address().port}`));
}
