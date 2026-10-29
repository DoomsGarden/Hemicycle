'use strict';
// Reuse domain-origin account regressions with synthetic auth and isolated reports.
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),file=path.join(__dirname,'domain-auth.cjs');
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(fs.readFileSync(file,'utf8').replaceAll('_dev/reports/domain-migration/accounts','_dev/reports/v31.0.2.6/accounts'),file);
