#include <nan.h>

void <%- codeMd5 %>(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  <%- code %>
}

void Init(v8::Local<v8::Object> exports) {
  exports->Set(Nan::New("<%- codeMd5 %>").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(<%- codeMd5 %>)->GetFunction());
}

NODE_MODULE(<%- codeMd5 %>, Init)
