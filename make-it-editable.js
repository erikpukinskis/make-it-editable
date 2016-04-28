var makeItEditable = (function () {

  var stylesheetIsAdded = false

  function makeEditable(button, getValue, setValue, options) {
    button.assignId()

    makeSureStylesheetIsThere()

    if (options) {
      var updateElement = options.updateElement
    } else {
      var updateElement = button
    }

    updateElement.classes.push("editable-"+button.id+"-target")

    button.classes.push("editable-"+button.id)

    button.onclick(
      functionCall("makeItEditable.startEditing")
      .withArgs(
        button.id,
        getValue,
        setValue
      )
    )
  }

  function makeSureStylesheetIsThere() {
    if (!stylesheetIsAdded) {
      var sheet = element.stylesheet(humanWords, beingEdited)
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

    toUpdate.innerHTML = value
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

      var catcher = humanInputListener.catcher = tapCatcher(input, done)

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

  var humanWords = element.template(
    "input.human-words-and-stuff",
    element.style({
      "z-index": "2",
      "width": "80%",
      "display": "block",
      "margin": "0 auto",
      "margin-top": "20%",
      "text-align": "center",
      "font-size": "40px",
      "border": "none",
      "border-top": "20px solid red",
      "background": "white",
      "padding": "0px 0 20px 0"
    }),
    {
      onKeyUp: "onFreshHumanData(this.value)"
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








  // CATCH DEM TAPS

  function tapCatcher(child, callback) {

    var catcher = element(
      ".tap-catcher",
      {
        onclick: tapOutScript(callback)
      },
      element.style({
        "position": "fixed",
        "top": "0",
        "left": "0",
        "width": "100%",
        "height": "100%",
        "z-index": "1000"
      }),
      child
    )

    function tapOutScript(callback) {
      return functionCall("makeItEditable.onTapOut").withArgs(functionCall.raw("event"), callback).evalable()
    }

    catcher.assignId()

    catcher.onTapOut =
      function(callback) {
        document.getElementById(this.id).setAttribute("onclick", tapOutScript(callback))
      }

    catcher.show =
      function() {
        document.getElementById(this.id).style.display = "block"
      }

    return catcher
  }

  function onTapOut(event, callback) {
    var catcherElement = event.target
    
    if (!catcherElement.classList.contains("tap-catcher")) {
      return
    }

    catcherElement.style.display = "none"

    callback && callback()
  }

  makeEditable.onTapOut = onTapOut

  return makeEditable
})()