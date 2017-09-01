function byId(id) {
	return document.getElementById(id)
}

var scripts = (function() {
	var _scriptarea = byId('scriptarea'),
		_inputs = byId('inputs'),
		_outputs = byId('outputs'),
		_stacks = byId('stacks'),
		_debug = byId("debug")
		_inputText = byId("input-text")

	var output, scriptContent, stacksChanged, stackContents, currentStack
	var debugMode = null
	function setDebug(ah, debug) {
		//if(debug !== debugMode) {
			if(debug) {
				debugMode = true
				scriptContent = ""
				stacksChanged = {}
				stackContents = []
				currentStack = -1
			} else {
				debugMode = false
				scriptContent = null
				stacksChanged = null
				stackContents = null
				currentStack = null
			}
			if(ah) registerCallbacks(ah, debug)
		//}
	}
	var callbacks = {
		'common': {
			'integer': (num) => output += num,
			'character': (char) => output += char,

			'reset': () => {
				setDebug(null, debugMode)
				setupResults()
			},

			'start': () => {
				_scriptarea.classList.add("running")
				_scriptarea.classList.remove("stopped")
				_scriptarea.classList.remove("finished")
			},
			'stop': () => {
				_scriptarea.classList.remove("running")
				_scriptarea.classList.add("stopped")
				_scriptarea.classList.remove("finished")
			},
			'end': () => {
				_scriptarea.classList.remove("running")
				_scriptarea.classList.remove("stopped")
				_scriptarea.classList.add("finished")
			}
		},
		'debug': {
			'step': function() {
				var ahScript = this.script.split(/\r?\n/g)
				scriptContent = ahScript.reduce(
					(prev, line, i) =>
						prev + '\n'
							+ (
								(i == this.y)?
									line.slice(0, this.x) + '<b>' + line.charAt(this.x) + '</b>' + line.slice(this.x + 1)
								:
									line
							)
					, ""
				).slice(1)

				for(var i in aheui.jong) {
					if(!stackContents[i]) stackContents[i] = []

					var lastJ = -1
					this.stacks[i].every((item, j) => {
						if(stackContents[i][j] != item) {
							stacksChanged[i] = true
							stackContents[i][j] = item
						}
						lastJ = j
					})
					if(stackContents[i].length != lastJ + 1) {
						stacksChanged[i] = true
						stackContents[i].length = lastJ + 1
					}
				}
				currentStack = this.currentStack
			}
		},
		'noDebug': {
		}
	}
	function registerCallbacks(ah) {
		removeCallbacks()
		applyCallbacks('common')

		if(debugMode) {
			applyCallbacks('debug')
		} else {
			applyCallbacks('noDebug')
		}

		function removeCallbacks() {
			for(var type in callbacks) {
				if(!callbacks.hasOwnProperty(type)) continue
				for(var event in callbacks[type]) {
					if(!callbacks[type].hasOwnProperty(event)) continue
					ah.off(event, callbacks[type][event])
				}
			}
		}
		function applyCallbacks(type) {
			var cbs = callbacks[type]
			for(var event in cbs) {
				if(!cbs.hasOwnProperty(event)) continue

				ah.on(event, cbs[event])
			}
		}
	}

	function setupResults(keepOutput) {
		if(!keepOutput) output = ""

		// remove styles
		_scriptarea.innerHTML = _scriptarea.innerText

		if(!keepOutput) {
			// clear outputs
			var fc
			while(fc = _outputs.firstChild) {
				_outputs.removeChild(fc)
			}
		}

		var contents = _stacks.getElementsByClassName('stack-content')
		if(contents.length > 0) {
			for(var i = 0; i < contents.length; i++) {
				contents[i].textContent = ""
			}

			var shown = _stacks.getElementsByClassName('show')
			for(var i = shown.length - 1; i >= 0; i--) {
				shown[i].classList.remove('list-group-item-primary')
				shown[i].classList.remove('show')
			}

		} else {
			for(var i = 0; i < aheui.jong.length; i++) {
				var li = document.createElement("li")
				li.className = 'list-group-item px-2 py-1 collapse'

				var title = document.createElement("span")
				title.className = 'stack-title'
				title.textContent = aheui.jong[i] || '_'

				var spacer = document.createTextNode(": ")

				var content = document.createElement("span")
				content.className = 'stack-content'

				li.appendChild(title)
				li.appendChild(spacer)
				li.appendChild(content)
				_stacks.appendChild(li)
			}
		}

		if(!keepOutput) {
			_scriptarea.classList.remove("running")
			_scriptarea.classList.remove("stopped")
			_scriptarea.classList.remove("finished")
		}
	}

	function buildDOMUpdater() {
		var lastOutput = "", lastScript = "", lastStack = -1
		return function updateDOM() {
			if(output !== lastOutput) {
				_outputs.textContent = output
				lastOutput = output
			}

			if(scriptContent && scriptContent !== lastScript) {
				_scriptarea.innerHTML = scriptContent
				lastScript = scriptContent
			}

			if(stackContents) {
				var lis = _stacks.getElementsByTagName('li')

				if(currentStack !== lastStack) {
					if(lastStack >= 0) {
						lis[lastStack].classList.remove('list-group-item-primary')
						if(!stackContents[lastStack] || stackContents[lastStack].length == 0) {
							lis[lastStack].classList.remove('show')
						}
					}

					if(currentStack >= 0) {
						lis[currentStack].classList.add('list-group-item-primary')
						lis[currentStack].classList.add('show')
					} else {
						for(var i = 0; i < lis.length; i++)
							lis[i].classList.remove('show')
					}

					lastStack = currentStack
				}

				for(var i in stacksChanged) {
					if(!stacksChanged.hasOwnProperty(i) || !stacksChanged[i]) continue

					var content = lis[i].getElementsByClassName("stack-content")[0]
					content.textContent = stackContents[i].join(", ")
					
					if(stackContents[i].length > 0) {
						lis[i].classList.add('show')
					} else if(i != currentStack) {
						lis[i].classList.remove('show')
					}

					stacksChanged[i] = false
				}
			}

		}
	}

	var updateDOM

	var updateTimer = 0
	function setInput(script, inText) {
		if(inText) {
			const numberReg = /^\s*?(-?[0-9]+)/
			var position = 0
			script.setIntegerInput(() =>  {
				var text = _inputs.value
				var mat = text.substring(position).match(numberReg)
				if(mat) {
					position += mat[0].length
					return mat[1]|0
				} else {
					return -1
				}
			})
			script.setCharacterInput(() => {
				var text = _inputs.value
				var char = processSurrogatePair(text, position)
				if(char > 0xFFFF) position += 2
				else position++
				return char
			})

			script.on('reset', () => position = 0)
		} else {
			script.setIntegerInput(() => prompt("정수를 입력해주세요.") | 0)
			script.setCharacterInput(() => processSurrogatePair(prompt("문자를 입력해주세요."), 0))
		}

		// unicode surrogate pair(https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs)
		function processSurrogatePair(str, position) {
			if(str.length > position) {
				var char = str.charCodeAt(position)
				if(str.length > position + 1 && 0xD800 <= char && char <= 0xDBFF) {
					var additional = str.charCodeAt(position + 1)
					if(0xDC00 <= additional && additional <= 0xDFFF) {
						char = (char - 0xD800) * 0x400 + additional - 0xDC00 + 0x10000
					}// else unknown, just let go
				}
				return char
			} else {
				return -1
			}
		}
	}
	function initScript() {
		var code = _scriptarea.innerText
		_scriptarea.innerHTML = code.replace(/^./, '<b>$&</b>')
		var script = new aheui.Aheui(code)

		setupResults()
		setDebug(script, _debug.checked)

		setInput(script, _inputText.checked)

		if(window.requestAnimationFrame) {
			if(updateTimer) window.cancelAnimationFrame(updateTimer)
			updateDOM = buildDOMUpdater()
			var lastUpdate = 0
			window.requestAnimationFrame(function update(timestamp) {
				if(timestamp - lastUpdate > 100) {
					updateDOM()
					lastUpdate = timestamp
				}
				window.requestAnimationFrame(update)
			})
		} else {
			if(updateTimer) clearInterval(updateTimer)
			updateDOM = buildDOMUpdater()
			updateTimer = setInterval(updateDOM, 100)
		}

		return script
	}

	return {
		'initScript': initScript, /* initScript() */
		'setInput': setInput, /* setInput(script, inText) */
		'setDebug': setDebug, /* setDebug(doDebug) */
	}
})()

var runner
byId("run").onclick = function() {
	if(!runner) runner = scripts.initScript()
	var batch = byId("batch")
	batch.disabled = true
	runner.run(batch.value|0)
}
byId("stop").onclick = function() {
	if(runner) runner.stop()
	byId("batch").disabled = false
}
byId("step").onclick = function() {
	if(!runner) runner = scripts.initScript()
	runner.step()
}
byId("reset").onclick = function() {
	if(runner) runner.reset()
	else runner = scripts.initScript()
	byId("batch").disabled = false
}
byId("debug").onchange = function() {
	scripts.setDebug(runner, this.checked)
	byId('stack-container').style.display = this.checked? "" : "none"
}
byId("input-text").onchange = function() {
	byId('inputs').disabled = !this.checked
	if(runner) {
		scripts.setInput(runner, this.checked)
	}
}
byId("scriptarea").oninput = function() {
	if(runner) {
		runner.stop()
		runner = null
	}
	this.classList.remove("running")
	this.classList.remove("stopped")
	this.classList.remove("finished")
}
