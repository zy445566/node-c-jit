const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const BaseCJit = require("./BaseCJit");

class AsyncCJit extends BaseCJit
{
    constructor(gypBinPath,srcPath,templatePath)
    {
        super(gypBinPath,srcPath,templatePath);
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



    execGyp(codePath,command,func)
    {
        child_process.exec(`cd ${codePath.replace(' ','\\ ')} && ${this.gypBinPath.replace(' ','\\ ')} ${command}`,(err, stdout, stderr)=>{
            func(err, stdout, stderr);
        });
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

    clean(codeMd5,codePath,func)
    {
        this.execGyp(codePath,"clean",func);
    }

    rebuild(codeMd5,codePath,func)
    {
        this.execGyp(codePath,"rebuild",func);
    }

    install(codeMd5,codePath,func)
    {
        this.execGyp(codePath,"install",func);
    }

    list(codeMd5,codePath,func)
    {
        this.execGyp(codePath,"list",func);
    }

    remove(codeMd5,codePath,func)
    {
        this.execGyp(codePath,"remove",func);
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

    run (code,codeMd5,codePath,func)
    {
        this.getRelease(codeMd5,codePath,code,func);
    }

    delete(codeMd5,codePath,func)
    {
        
        fs.readdir(codePath,(err,files)=>{
            if (err){func(err); return;}
            let filesNum = files.length;
            for(let filename of files)
            {
                let filePath = path.join(codePath,filename);
                fs.stat(filePath,(err,stats)=>{
                    if (err){func(err); return;}
                    if (stats.isDirectory())
                    {
                        this.delete(codeMd5,filePath,(err,res)=>{
                            if (err){func(err); return;}
                            filesNum--;
                            if (filesNum<=0)
                            {
                                fs.rmdir(codePath,(err)=>{
                                    if (err){func(err); return;}
                                    func(err,true);
                                });
                            }
                        });
                    } else {
                        fs.unlink(filePath,(err)=>{
                            if (err){func(err); return;}
                            filesNum--;
                            if (filesNum<=0)
                            {
                                fs.rmdir(codePath,(err)=>{
                                    if (err){func(err); return;}
                                    func(err,true);
                                });
                            }
                        });
                    }
                });
            }
            
        });
    }

}

module.exports = AsyncCJit;