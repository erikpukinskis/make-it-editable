var makeEditable = (function () {

  function makeEditable(button, getValue, setValue, options) {
    button.assignId()

    if (options) {
      var updateElement = options.updateElement
    } else {
      var updateElement = button
    }

    updateElement.classes.push("editable-"+button.id+"-target")

    button.classes.push("editable-"+button.id)

    button.onclick(
      functionCall(startEditing)
      .withArgs(
        button.id,
        getValue,
        setValue
      )
    )
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
      functionCall(stopEditing).withArgs(editable.id)
    )

  }

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

      addToDom(catcher.html())
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
    {
      onKeyUp: "onFreshHumanData(this.value)"
    }
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
      return functionCall(onTapOut).withArgs(functionCall.raw("event"), callback).evalable()
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
})()