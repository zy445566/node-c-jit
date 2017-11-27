const CJit = require("./index");
const path = require("path");

let cJit  = new CJit();
// run by c code sync
let funcByrunSync = cJit.runSync(' \
  if (info.Length() < 2) { \
    Nan::ThrowTypeError("Wrong number of arguments"); \
    return; \
  } \
 \
  if (!info[0]->IsNumber() || !info[1]->IsNumber()) { \
    Nan::ThrowTypeError("Wrong arguments"); \
    return; \
  } \
 \
  double arg0 = info[0]->NumberValue(); \
  double arg1 = info[1]->NumberValue(); \
  v8::Local<v8::Number> num = Nan::New(arg0 + arg1); \
 \
  info.GetReturnValue().Set(num); \
');
console.log("This should be eight(by run sync):"+funcByrunSync(3,5));

//run by file sync
let funcByfileSync = cJit.runByFileSync(path.join(__dirname,'test.cc'));
console.log("This should be twelve(by file sync):"+funcByfileSync(6,6));

//run by c code
let funcByrun = cJit.run(' \
  if (info.Length() < 2) { \
    Nan::ThrowTypeError("Wrong number of arguments"); \
    return; \
  } \
 \
  if (!info[0]->IsNumber() || !info[1]->IsNumber()) { \
    Nan::ThrowTypeError("Wrong arguments"); \
    return; \
  } \
 \
  double arg0 = info[0]->NumberValue(); \
  double arg1 = info[1]->NumberValue(); \
  v8::Local<v8::Number> num = Nan::New(arg0 + arg1); \
 \
  info.GetReturnValue().Set(num); \
',(err,func)=>{
  if (err){console.log(err);return;}
  console.log("This should be eight(by run):"+func(3,5));
});


// run by file
let funcByfile = cJit.runByFile(path.join(__dirname,'test.cc'),(err,func)=>{
  if (err){console.log(err);return;}
  console.log("This should be twelve(by file):"+func(6,6));
});






