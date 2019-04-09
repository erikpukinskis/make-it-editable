var library = require("module-library")(require)

module.exports = library.export(
  "make-it-editable",
  ["web-element", "add-html", "function-call", "tap-away"],
  function(element, addHtml, functionCall, tapAway) {

    var stylesheetIsAdded = false

    var makeItInBrowser

    function makeItEditable(button, makeItInBrowser, getValue, setValue, options) {

      button.assignId()

      if (typeof window != "undefined") {
        makeSureStylesheetIsThere()
      }

      if (options && options.updateElement) {
        var updateElement = options.updateElement
      } else {
        var updateElement = button
      }

      updateElement.classes.push("editable")
      updateElement.classes.push("editable-"+button.id+"-target")

      button.classes.push("editable-"+button.id)
      
      var startEditing = makeItInBrowser.methodCall(
          "startEditing")
        .withArgs(
          button.id,
          getValue,
          setValue)

      button.onclick(
        startEditing.evalable())
    }

    var onBottom = false

    makeItEditable.onBottomOfScreen =
      function() {
        onBottom = true
      }

    function makeSureStylesheetIsThere() {
      if (!stylesheetIsAdded) {
        var sheet = element.stylesheet(humanWords, beingEdited, editableTemplate)
        addHtml(sheet.html())
        stylesheetIsAdded = true
      }
    }

    function startEditing(id, getValue, callback) {

      var el = document.querySelector(
        ".editable-"+id)

      el.classList.add("being-edited-by-human")

      editable = {
        id: id,
        oldValue: getValue()
      }

      streamHumanInput(
        editable.oldValue,
        updateEditable.bind(null, callback),
        makeItInBrowser.methodCall("stopEditing").withArgs(editable.id))

    }

    makeItEditable.startEditing = startEditing

    var editable

    function updateEditable(callback, value) {

      var toUpdate = document.querySelector(
          ".editable-"
          +editable.id
          +"-target")

      toUpdate.innerHTML = value.replace(/\</g, "&lt;").replace(/\>/g, "&gt;")
      callback(value, editable.oldValue)
      editable.oldValue = value
    }

    function stopEditing(id) {
      var el = document.querySelector(".editable-"+id)
      el.classList.remove("being-edited-by-human")
    }

    makeItEditable.stopEditing = stopEditing

    var humanInputListener = {}

    // It's pretty weird that callback is a function and done is a functionCall. Maybe they should both be functionCalls and we should actually modify the onChange

    function streamHumanInput(startingText, callback, done) {

      humanInputListener.oldText = startingText
      humanInputListener.callback = callback

      var catcher = humanInputListener.catcher

      if (catcher) {
        catcher.onTapOut(done)
        catcher.show()
      } else {
        var input = humanWords(makeItInBrowser)

        humanInputListener.inputId = input.assignId()

        var catcher = humanInputListener.catcher = tapAway.catcher(input, done)

        addHtml(catcher.html())
      }

      var input = document.getElementById(humanInputListener.inputId)

      input.value = startingText
      input.focus()
    }

    function onFreshHumanData(newText) {
      if (newText == humanInputListener.oldText) { return }
      humanInputListener.oldText = newText
      humanInputListener.callback(newText)
    }

    makeItEditable.onFreshHumanData = onFreshHumanData

    makeItEditable.seeCall = function seeCall(makeIt) {
      makeItInBrowser = makeIt }

    makeItEditable.prepareBridge =
      function prepareBridge(bridge, makeItInBrowser) {

        bridge.asap([
          makeItInBrowser,
          makeItInBrowser.asCall()],
          function(makeItEditable, makeItInBrowser) {
            makeItEditable.seeCall(makeItInBrowser)})

        bridge.addToHead(
          element.stylesheet(humanWords, beingEdited, editableTemplate).html())
      }

    var editableTemplate =
      element.template(
        ".editable",
        element.style({
          cursor: "text"
        })
      )

    var humanWords = element.template(
      "textarea.human-words-and-stuff",
      element.style({
        "z-index": "2",
        "width": "80%",
        "display": "block",
        "background-color": "white !important",
        "margin": "0 auto",
        "margin-top": onBottom ? "200px" : "400px",
        "font-size": "40px",
        "border": "none",
        "border-top": "0.2em solid red",
        "padding": "0px 0 20px 0"
      }),
      {"rows": "3"},
      function(makeItInBrowser) {
        var onData = makeItEditable.onFreshHumanData
        var makeIt = makeItInBrowser.methodCall("onFreshHumanData")
        this.addAttribute(
          "onkeyup",
          makeIt.withArgs(functionCall.raw("event.target.value")).evalable())})

    var beingEdited = element.style(
      ".being-edited-by-human", {
      "border-color": "0px !important",
      "color": "black !important",
      "background-color": "white !important",
      "opacity": "0.5 !important",
      "border-top": "0.2em solid red",
      "box-sizing": "border-box",
    })

    return makeItEditable
  }
)
