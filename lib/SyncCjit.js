const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const BaseCJit = require("./BaseCJit");

class SyncCJit extends BaseCJit
{
    constructor(gypBinPath,srcPath,templatePath)
    {
        super(gypBinPath,srcPath,templatePath);
    }

    renderFile(templatePath,newPath,data)
    {
        let templateStr = fs.readFileSync(templatePath).toString();
        let newStr = ejs.render(templateStr,data); 
        fs.writeFileSync(newPath,newStr);
    }

    copyTemplate(codeMd5,codePath,code)
    {
        if (fs.existsSync(codePath)){return false;}
        fs.mkdirSync(codePath);
        let cPath = path.join(this.templatePath,"template.cc");
        let newCPath = path.join(codePath,`${codeMd5}.cc`);
        this.renderFile(cPath,newCPath,{
            codeMd5:codeMd5,
            code:code
        });
        let bindingName = "binding.gyp";
        let bindingGypPath = path.join(this.templatePath,bindingName);
        let newBindingGypPath = path.join(codePath,bindingName);
        this.renderFile(bindingGypPath,newBindingGypPath,{
            codeMd5:codeMd5
        });
        return true;
    }

    execGyp(codePath,command)
    {
        return child_process.execSync(`cd ${codePath} && ${this.gypBinPath} ${command}`);
    }

    configure(codeMd5,codePath)
    {
        if (fs.existsSync(path.join(codePath,"build/Makefile"))){return false;}
        return this.execGyp(codePath,"configure");
    }

    build(codeMd5,codePath)
    {
        if (fs.existsSync(path.join(codePath,`build/Release/${codeMd5}.node`))){return false;}
        return this.execGyp(codePath,"build");
    }

    clean(codeMd5,codePath)
    {
        return this.execGyp(codePath,"clean");
    }

    rebuild(codeMd5,codePath)
    {
        return this.execGyp(codePath,"rebuild");
    }

    install(codeMd5,codePath)
    {
        return this.execGyp(codePath,"install");
    }

    list(codeMd5,codePath)
    {
        return this.execGyp(codePath,"list");
    }

    remove(codeMd5,codePath)
    {
        return this.execGyp(codePath,"remove");
    }

    getCodeByFile(filePath)
    {
        return fs.readFile(filePath).toString();
    }
    

    getRelease(codeMd5,codePath,code)
    {
        this.copyTemplate(codeMd5,codePath,code);
        this.configure(codeMd5,codePath);
        this.build(codeMd5,codePath);
        return require(path.join(codePath,`build/Release/${codeMd5}`))[codeMd5];
    }

    run (code,codeMd5,codePath)
    {
        return this.getRelease(codeMd5,codePath,code);
    }

}

module.exports = SyncCJit;