if (require) {
  var library = require("nrtv-library")(require)

  module.exports = library.export(
    "make-it-editable",
    ["nrtv-element", "add-html", "function-call", "tap-away"],
    generator
  )
} else {
  var makeItEditable = generator(element, addHtml)
}

function generator(element, addHtml, functionCall, tapAway) {

  var stylesheetIsAdded = false

  function makeEditable(button, getValue, setValue, options) {
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

    var singletonSource = options.singleton ? options.singleton.evalable() : "makeItEditable"
    
    button.onclick(
      functionCall(singletonSource+".startEditing")
      .withArgs(
        button.id,
        getValue,
        setValue
      )
    )
  }

  var onBottom = false

  makeEditable.onBottomOfScreen =
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
      functionCall("makeItEditable.stopEditing").withArgs(editable.id)
    )

  }

  makeEditable.startEditing = startEditing

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

  makeEditable.stopEditing = stopEditing

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
      var input = humanWords()

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

  makeEditable.onFreshHumanData = onFreshHumanData

  var editableTemplate =
    element.template(
      ".editable",
      element.style({
        cursor: "text"
      })
    )
   
  var humanWords = element.template(
    "input.human-words-and-stuff",
    element.style({
      "z-index": "2",
      "width": "80%",
      "display": "block",
      "margin": "0 auto",
      "margin-top": onBottom ? "200px" : "400px",
      "text-align": "center",
      "font-size": "40px",
      "border": "none",
      "border-top": "20px solid red",
      "background": "white",
      "padding": "0px 0 20px 0"
    }),
    {
      onKeyUp: "makeItEditable.onFreshHumanData(this.value)"
    }
  )


  var beingEdited = element.template(
    ".being-edited-by-human",
    element.style({
      "padding-top": "2px !important",
      "border-color": "0px !important",
      "border-top": "6px solid red !important",
      "color": "black !important",
      "background": "white !important",
      "opacity": "0.7 !important"
    })
  )

  return makeEditable
}
