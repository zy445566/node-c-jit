"use strict";
class Tools
{
    constructor(codeMd5,codePath,cfunc)
    {
        this.codeMd5 = codeMd5;
        this.codePath = codePath;
        this.cfunc = cfunc;
    }

    run(...params)
    {
        return func(...params);
    }

    cleanCache()
    {

    }

    cleanCacheSync()
    {

    }
}

module.exports = Tools;