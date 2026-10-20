const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context=vm.createContext({});
vm.runInContext(html.match(/function slug\(s\)\{[^\n]+/)[0]+'\n'+html.slice(html.indexOf('var DOCS='),html.indexOf("var LS='"))+'\n'+html.match(/var PACKS=\[[\s\S]*?\];/)[0],context);
module.exports={root,cards:JSON.parse(vm.runInContext('JSON.stringify(CARDS)',context)),packs:JSON.parse(vm.runInContext('JSON.stringify(PACKS)',context))};
