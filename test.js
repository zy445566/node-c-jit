const CJit = require("./index");
const path = require("path");

let cJit  = new CJit();

let code = `
if (info.Length() < 2) {
  Nan::ThrowTypeError("Wrong number of arguments");
  return;
}

if (!info[0]->IsNumber() || !info[1]->IsNumber()) {
  Nan::ThrowTypeError("Wrong arguments");
  return;
}

double arg0 = info[0]->NumberValue();
double arg1 = info[1]->NumberValue();
v8::Local<v8::Number> num = Nan::New(arg0 + arg1);

info.GetReturnValue().Set(num);
`;

let filePath = path.join(__dirname,'test.cc');

// run by c code sync
let funcByrunSync = cJit.runSync(code);
console.log("This should be eight(by run sync):"+funcByrunSync(3,5));
/**
 * [Function delete]
 * Do not use it unnecessarily. This can lead to recompiling and spending a lot of time
 * 非必要请勿使用，这会清除编译缓存，导致每次执行重新编译耗费大量时间
 */
cJit.getToolsSync(code).delete();

//run by file sync
let funcByfileSync = cJit.runByFileSync(filePath);
console.log("This should be twelve(by file sync):"+funcByfileSync(6,6));
/**
 * [Function delete]
 * Do not use it unnecessarily. This can lead to recompiling and spending a lot of time
 * 非必要请勿使用，这会清除编译缓存，导致每次执行重新编译耗费大量时间
 */
cJit.getToolsByFileSync(filePath).delete();

//run by c code
let funcByrun = cJit.run(code,(err,func)=>{
  if (err){console.log(err);return;}
  console.log("This should be eight(by run):"+func(3,5));
  /**
   * [Function delete]
   * Do not use it unnecessarily. This can lead to recompiling and spending a lot of time
   * 非必要请勿使用，这会清除编译缓存，导致每次执行重新编译耗费大量时间
   */
  cJit.getTools(code).delete((err,res)=>{
    if (err){console.log(err);return;}
  });
});




// run by file
let funcByfile = cJit.runByFile(filePath,(err,func)=>{
  if (err){console.log(err);return;}
  console.log("This should be twelve(by file):"+func(6,6));
  /**
   * [Function delete]
   * Do not use it unnecessarily. This can lead to recompiling and spending a lot of time
   * 非必要请勿使用，这会清除编译缓存，导致每次执行重新编译耗费大量时间
   */
  cJit.getToolsByFile(filePath).delete((err,res)=>{
    if (err){console.log(err);return;}
  });
});







