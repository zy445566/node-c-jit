"use strict";
const crypto = require('crypto');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const Tools = require('./lib/Tools');

class CJit
{
    constructor(gypBinPath = "",srcPath="")
    {
        this.gypBinPath = gypBinPath===""?"node-gyp":gypBinPath;
        this.srcPath = srcPath===""?path.join(__dirname,"srcPath"):srcPath;
        this.templatePath = path.join(__dirname,'template');
    }

    md5 (text) 
    {
        return crypto.createHash('md5').update(text).digest('hex')
    }

    renderFileSync(templatePath,newPath,data)
    {
        let templateStr = fs.readFileSync(templatePath).toString();
        let newStr = ejs.render(templateStr,data); 
        fs.writeFileSync(newPath,newStr);
    }

    renderFile(templatePath,newPath,data,func)
    {
        fs.readFile(templatePath, (err, fileData)=> {
            if (err) {func(err);return;}
            let templateStr = fileData.toString();
            let newStr = ejs.render(templateStr,data); 
            fs.writeFile(newPath,newStr,func);
        });
    }

    copyTemplateSync(codeMd5,codePath,code)
    {
        if (fs.existsSync(codePath)){return false;}
        fs.mkdirSync(codePath);
        let cPath = path.join(this.templatePath,"template.cc");
        let newCPath = path.join(codePath,`${codeMd5}.cc`);
        this.renderFileSync(cPath,newCPath,{
            codeMd5:codeMd5,
            code:code
        });
        let bindingName = "binding.gyp";
        let bindingGypPath = path.join(this.templatePath,bindingName);
        let newBindingGypPath = path.join(codePath,bindingName);
        this.renderFileSync(bindingGypPath,newBindingGypPath,{
            codeMd5:codeMd5
        });
        return true;
    }

    copyTemplate(codeMd5,codePath,code,func)
    {
        fs.exists(codePath,(exists)=>{
            if (exists){func(null,false);return false;}
            fs.mkdir(codePath,(err)=>{
                if (err){func(err);return false;}
                let cPath = path.join(this.templatePath,"template.cc");
                let newCPath = path.join(codePath,`${codeMd5}.cc`);
                this.renderFile(cPath,newCPath,{
                    codeMd5:codeMd5,
                    code:code
                },(err,data)=>{
                    if (err){func(err,false);return;}
                    let bindingName = "binding.gyp";
                    let bindingGypPath = path.join(this.templatePath,bindingName);
                    let newBindingGypPath = path.join(codePath,bindingName);
                    this.renderFile(bindingGypPath,newBindingGypPath,{
                        codeMd5:codeMd5
                    },func);
                });
            });
        })
    }

    execGypSync(codePath,command)
    {
        return child_process.execSync(`cd ${codePath} && ${this.gypBinPath} ${command}`);
    }

    execGyp(codePath,command,func)
    {
        child_process.exec(`cd ${codePath} && ${this.gypBinPath} ${command}`,(err, stdout, stderr)=>{
            func(err, stdout, stderr);
        });
    }

    configureSync(codeMd5,codePath)
    {
        if (fs.existsSync(path.join(codePath,"build/Makefile"))){return false;}
        return this.execGypSync(codePath,"configure");
    }

    buildSync(codeMd5,codePath)
    {
        if (fs.existsSync(path.join(codePath,`build/Release/${codeMd5}.node`))){return false;}
        return this.execGypSync(codePath,"build");
    }

    configure(codeMd5,codePath,func)
    {
        fs.exists(path.join(codePath,"build/Makefile"),(exists)=>{
            if (exists){func(null,false);return;}
            this.execGyp(codePath,"configure",func);
        });
    }

    build(codeMd5,codePath,func)
    {
        fs.exists(path.join(codePath,`build/Release/${codeMd5}.node`),(exists)=>{
            if (exists){func(null,false);return;}
            this.execGyp(codePath,"build",func);
        });
    }

    getCodeMd5(code)
    {
        return "codeMd5"+this.md5(code);
    }

    getCodePath(codeMd5)
    {
        return path.join(this.srcPath,codeMd5);
    }

    getCodeByFileSync(filePath)
    {
        return fs.readFileSync(filePath).toString();
    }
    

    getReleaseSync(codeMd5,codePath,code)
    {
        this.copyTemplateSync(codeMd5,codePath,code);
        this.configureSync(codeMd5,codePath);
        this.buildSync(codeMd5,codePath);
        return require(path.join(codePath,`build/Release/${codeMd5}`))[codeMd5];
    }

    runSync (code)
    {
        let codeMd5 = this.getCodeMd5(code);
        let codePath = this.getCodePath(codeMd5);
        return this.getReleaseSync(codeMd5,codePath,code);
    }

    runByFileSync (filePath)
    {
        let code = this.getCodeByFileSync(filePath);
        return this.runSync (code)
    }

    getToolsSync (code)
    {
        let codeMd5 = this.getCodeMd5(code);
        let codePath = this.getCodePath(codeMd5);
        let cfunc = this.getReleaseSync(codeMd5,codePath,code);
        return new Tools(codeMd5,codePath,cfunc);
    }

    getToolsByFileSync (filePath)
    {
        let code = this.getCodeByFileSync(filePath);
        return this.getToolsSync(code);
    }

    getRelease(codeMd5,codePath,code,func)
    {
        this.copyTemplate(codeMd5,codePath,code,(err)=>{
            if (err){func(err); return;}
            this.configure(codeMd5,codePath,(err, stdout, stderr)=>{
                if (err){func(err); return;}
                this.build(codeMd5,codePath,(err, stdout, stderr)=>{
                    if (err){func(err); return;}
                    func(null,require(path.join(codePath,`build/Release/${codeMd5}`))[codeMd5]);
                });
            });
        });
    }

    run (code,func)
    {
        let codeMd5 = this.getCodeMd5(code);
        let codePath = this.getCodePath(codeMd5);
        this.getRelease(codeMd5,codePath,code,func);
    }

    getCodeByFile(filePath,func)
    {
        fs.readFile(filePath,func);
    }

    runByFile (filePath,func)
    {
        this.getCodeByFile(filePath,(err,data)=>{
            if (err){func(err); return;}
            this.run (data,func);
        });
    }

    getTools (code,func)
    {
        let codeMd5 = this.getCodeMd5(code);
        let codePath = this.getCodePath(codeMd5);
        this.getRelease(codeMd5,codePath,code,(err,cfunc)=>{
            if (err){func(err); return;}
            func(null,new Tools(codeMd5,codePath,cfunc));
        })
        
    }

    getToolsByFile (filePath,func)
    {
        this.getCodeByFile(filePath,(err,data)=>{
            if (err){func(err); return;}
            this.getTools(data,func);
        });
    }

}
module.exports = CJit;