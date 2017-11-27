{
  "targets": [
    {
      "target_name": "<%- codeMd5 %>",
      "sources": [ "<%- codeMd5 %>.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
