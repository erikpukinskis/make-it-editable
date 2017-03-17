var runTest = require("run-test")(require)

runTest(
  "adds an onclick",
  ["./", "web-element"],
  function(expect, done, makeItEditable, element) {
    var button = element("button", "hi")
    makeItEditable(button)
    expect(button.attributes).to.have.property("onclick")
    done()
  }
)