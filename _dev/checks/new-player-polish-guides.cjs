'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),file=path.join(__dirname,'stabilization-browser.cjs'),m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(fs.readFileSync(file,'utf8').replace("const out='_dev/reports/v31.0.2.6'","const out='_dev/reports/new-player-polish/guides'"),file);
