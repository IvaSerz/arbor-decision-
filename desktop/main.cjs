const {app,BrowserWindow,Menu,session,dialog}=require('electron');
const path=require('node:path');
app.setName('Arbor');
const gotLock=app.requestSingleInstanceLock();
if(!gotLock)app.quit();
let mainWindow;
app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus()}});
function createWindow(){
 mainWindow=new BrowserWindow({width:1440,height:980,minWidth:800,minHeight:600,title:'Arbor — Decision Studio',backgroundColor:'#f5f7f5',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 mainWindow.webContents.on('will-navigate',e=>e.preventDefault());
 mainWindow.loadFile(path.join(__dirname,'Arbor.html'));
 mainWindow.on('closed',()=>{mainWindow=null});
}
app.whenReady().then(()=>{
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 const template=[...(process.platform==='darwin'?[{label:'Arbor',submenu:[{role:'about'},{type:'separator'},{role:'quit'}]}]:[]),{label:'Файл',submenu:[{label:'Сохранить отчёт в PDF…',click:async()=>{if(!mainWindow)return;try{const result=await dialog.showSaveDialog(mainWindow,{defaultPath:'Arbor-report.pdf',filters:[{name:'PDF',extensions:['pdf']}]});if(result.canceled)return;await mainWindow.webContents.executeJavaScript(`new Promise(resolve=>{document.querySelector('nav button:last-child').click();requestAnimationFrame(()=>requestAnimationFrame(resolve))})`);const pdf=await mainWindow.webContents.printToPDF({printBackground:true,pageSize:'A4'});await require('node:fs/promises').writeFile(result.filePath,pdf)}catch(e){dialog.showErrorBox('Не удалось сохранить PDF',e.message)}}},{type:'separator'},process.platform==='darwin'?{role:'close'}:{role:'quit'}]},{label:'Правка',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'Вид',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}];
 Menu.setApplicationMenu(Menu.buildFromTemplate(template));createWindow();
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
