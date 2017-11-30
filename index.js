"use strict";
const AsyncCJit = require("./lib/AsyncCJit");
const SyncCJit = require("./lib/SyncCJit");
const Tools = require("./lib/Tools");
const path = require('path');

class CJit
{
    constructor(gypBinPath = "",srcPath="")
    {
        this.gypBinPath = gypBinPath===""?"node-gyp":gypBinPath;
        this.srcPath = srcPath===""?path.join(__dirname,"srcPath"):srcPath;
        this.templatePath = path.join(__dirname,'template');
        this.asyncCJit = new AsyncCJit(this.gypBinPath,this.srcPath,this.templatePath);
        this.syncCJit = new SyncCJit(this.gypBinPath,this.srcPath,this.templatePath);
    }

    run(code,func)
    {
        return (new Tools(this.asyncCJit)).init(code).run(func);
    }

    runByFile(filePath,func)
    {
        return (new Tools(this.asyncCJit)).initByfile(filePath).run(func);
    }

    getTools(code,func)
    {
        return (new Tools(this.asyncCJit)).init(code);
    }

    getToolsByFile(filePath,func)
    {
        return (new Tools(this.asyncCJit)).initByfile(filePath);
    }

    runSync(code)
    {
        return (new Tools(this.syncCJit)).init(code).run();
    }
    
    runByFileSync(filePath)
    {
        return (new Tools(this.syncCJit)).initByfile(filePath).run();
    }

    getToolsSync(code)
    {
        return (new Tools(this.syncCJit)).init(code);
    }

    getToolsByFileSync(filePath)
    {
        return (new Tools(this.syncCJit)).initByfile(filePath);
    }

}
module.exports = CJit;