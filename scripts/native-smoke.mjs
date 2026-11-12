import {_electron as electron} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const executable=path.resolve(process.argv[2]);
const out=process.argv[3]??'diagnostics/native';
await mkdir(out,{recursive:true});
let application;const report={executable,platform:process.platform,arch:process.arch,startedAt:new Date().toISOString(),checks:[],errors:[]};
try{
 application=await electron.launch({executablePath:executable,timeout:30000});
 const window=await application.firstWindow({timeout:20000});
 window.on('pageerror',e=>report.errors.push(e.message));
 await window.getByRole('heading',{name:'Как обследовать лес?'}).waitFor({timeout:20000});report.checks.push('main window rendered');
 await window.getByRole('button',{name:'Критерии и данные',exact:true}).click();
 const field=window.getByRole('spinbutton',{name:'RGB-видео: Стоимость обследования',exact:true});
 const original=await field.inputValue();await field.fill('851');await window.reload();
 await window.getByRole('button',{name:'Критерии и данные',exact:true}).click();
 if(await window.getByRole('spinbutton',{name:'RGB-видео: Стоимость обследования',exact:true}).inputValue()!=='851')throw Error('Autosave failed');
 await window.getByRole('spinbutton',{name:'RGB-видео: Стоимость обследования',exact:true}).fill(original);report.checks.push('edit and autosave/reload');
 await window.getByRole('button',{name:'Плагины',exact:true}).click();
 await window.locator('input[accept=".wasm"]').setInputFiles({name:'identity.wasm',mimeType:'application/wasm',buffer:Buffer.from('0061736d0100000001060160017c017c030201000709010573636f726500000a0601040020000b','hex')});
 await window.getByText('identity.wasm',{exact:true}).waitFor();report.checks.push('external WASM plugin');
 await window.getByRole('button',{name:'Отчёт',exact:true}).click();
 await window.getByRole('heading',{name:'Технология обследования деревьев',exact:true}).waitFor();
 const bytes=await application.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.printToPDF({printBackground:true,pageSize:'A4'})).length);
 if(bytes<1000)throw Error('Empty PDF');report.checks.push(`PDF generated (${bytes} bytes)`);
 await window.screenshot({path:path.join(out,'window.png'),fullPage:true});
 if(report.errors.length)throw Error(report.errors.join('\n'));report.success=true;
}catch(e){report.success=false;report.error=e.stack??e.message;if(application)try{report.processStderr='See runner logs';await application.firstWindow({timeout:2000}).then(w=>w.screenshot({path:path.join(out,'failure.png')}))}catch{}}
finally{if(application)await application.close().catch(()=>{});await writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
if(!report.success)process.exitCode=1;
