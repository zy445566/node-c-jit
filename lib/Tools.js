const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class Tools
{
    constructor(cJit)
    {
        this.cJit = cJit;
        this.code = null;
        this.codeMd5 = null;
        this.codePath = null;
    }

    init(code)
    {
        this.code = code;
        this.codeMd5 = "codeMd5"+this.md5(code);
        this.codePath = path.join(this.cJit.srcPath,this.codeMd5);
        return this;
    }

    initByfile(filePath)
    {
        return this.init(fs.readFileSync(filePath).toString());
    }

    md5 (text) 
    {
        return crypto.createHash('md5').update(text).digest('hex')
    }

    run(func)
    {
        return this.cJit.run(this.code,this.codeMd5,this.codePath,func);
    }

    build(func)
    {
        return this.cJit.build(this.codeMd5,this.codePath,func);
    }

    clean(func)
    {
        return this.cJit.clean(this.codeMd5,this.codePath,func);
    }

    configure(func)
    {
        return this.cJit.configure(this.codeMd5,this.codePath,func);
    }

    rebuild(func)
    {
        return this.cJit.rebuild(this.codeMd5,this.codePath,func);
    }

    install(func)
    {
        return this.cJit.install(this.codeMd5,this.codePath,func);
    }

    list(func)
    {
        return this.cJit.list(this.codeMd5,this.codePath,func);
    }

    remove(func)
    {
        return this.cJit.remove(this.codeMd5,this.codePath,func);
    }

    delete(func)
    {
        return this.cJit.delete(this.codeMd5,this.codePath,func);
    }
}

module.exports = Tools;