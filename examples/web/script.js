function byId(id) {
	return document.getElementById(id)
}

var output, scriptContent, stackContents, currentStack
function setupResults(debug, keepOutput) {
	if(!keepOutput) output = ""
	if(debug) {
		scriptContent = ""
		stackContents = []
		currentStack = -1
	} else {
		scriptContent = null
		stackContents = null
		currentStack = null
	}

	const stacks = byId('stacks'),
		outputs = byId('outputs'),
		scriptarea = byId('scriptarea')

	// remove styles
	scriptarea.innerHTML = scriptarea.innerText

	if(!keepOutput) {
		// clear outputs
		var fc
		while(fc = outputs.firstChild) {
			elen.removeChild(fc)
		}
	}

	var contents = stacks.getElementsByClassName('stack-content')
	if(contents.length > 0) {
		for(var i = 0; i < contents.length; i++) {
			contents[i].textContent = ""
		}

		var shown = stacks.getElementsByClassName('show')
		for(var i = 0; i < shown.length; i++) {
			shown[i].classList.remove('list-group-item-primary')
			shown[i].classList.remove('show')
		}

	} else {
		for(var i in aheui.jong) {
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
			stacks.appendChild(li)
		}
	}

	if(!keepOutput) {
		scriptarea.classList.remove("running")
		scriptarea.classList.remove("stopped")
		scriptarea.classList.remove("finished")
	}
}

function buildDOMUpdater() {
	const stacks = byId('stacks'),
		outputs = byId('outputs'),
		scriptarea = byId('scriptarea')

	var lastOutput = "", lastScript = "", lastStacks = [], lastStack = -1
	return function updateDOM() {
		if(output !== lastOutput) {
			outputs.textContent = output
			lastOutput = output
		}

		if(scriptContent && scriptContent !== lastScript) {
			scriptarea.innerHTML = scriptContent
			lastScript = scriptContent
		}

		if(stackContents) {
			var lis = stacks.getElementsByTagName('li')

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
				}
				lastStack = currentStack
			}
			for(var i in stackContents) {
				if(i != currentStack) {
					if((!lastStacks[i] || lastStacks[i].length === 0) && stackContents[i].length > 0) {
						lis[i].classList.add('show')
					} else if(lastStacks[i] && lastStacks[i].length > 0 && stackContents[i].length === 0) {
						lis[i].classList.remove('show')
					}
				}
				if(lastStacks[i] && stackContents[i].length === lastStacks[i].length) {
					var equals = true
					for(var j = 0; j < stackContents[i].length; j++) {
						if(lastStacks[i][j] !== stackContents[i][j]) {
							equals = false
							break
						}
					}
					if(equals) continue
				}
				var content = lis[i].getElementsByClassName("stack-content")[0]
				content.textContent = stackContents[i].reduce((prev, e) => prev + ', ' + e, "").slice(2)

				// safe, stackContents[i] is not modified, it is replaced with a new array
				lastStacks[i] = stackContents[i]
			}
		}

	}
}

var updateDOM

function setCallbacks(script, debug) {
	if(!debug) {
		const scriptarea = byId('scriptarea')
		script.setCallbacks({
			'output': {
				'integer': (aheui, num) => output += num,
				'character': (aheui, char) => output += char
			},
			'event': {
				'reset': (ah) => setupResults(debug),
				'step': () => {},
				'start': () => {
					scriptarea.classList.add("running")
					scriptarea.classList.remove("stopped")
					scriptarea.classList.remove("finished")
				},
				'stop': () => {
					scriptarea.classList.remove("running")
					scriptarea.classList.add("stopped")
					scriptarea.classList.remove("finished")
				},
				'end': () => {
					scriptarea.classList.remove("running")
					scriptarea.classList.remove("stopped")
					scriptarea.classList.add("finished")
				}
			}
		})
	} else {
		const stacks = byId('stacks'),
			outputs = byId('outputs'),
			scriptarea = byId('scriptarea')
		var ahScript = script.script.split(/\r?\n/g)

		script.setCallbacks({
			'output': {
				'integer': (aheui, num) => output += num,
				'character': (aheui, char) => output += char
			},
			'event': {
				'reset': (ah) => setupResults(debug),
				'step': (ah) => {
					scriptContent = ahScript.reduce(
						(prev, line, i) =>
							prev + '<br>'
								+ (
									(i === ah.y)?
										line.slice(0, ah.x) + '<b>' + line.charAt(ah.x) + '</b>' + line.slice(ah.x + 1)
									:
										line
								)
						, ""
					).slice(4)

					for(var i in aheui.jong) {
						stackContents[i] = ah.stacks[i].items.slice()
					}
					currentStack = ah.currentStack
				},
				'start': () => {
					scriptarea.classList.add("running")
					scriptarea.classList.remove("stopped")
					scriptarea.classList.remove("finished")
				},
				'stop': () => {
					scriptarea.classList.remove("running")
					scriptarea.classList.add("stopped")
					scriptarea.classList.remove("finished")
				},
				'end': () => {
					scriptarea.classList.remove("running")
					scriptarea.classList.remove("stopped")
					scriptarea.classList.add("finished")
				}
			}
		})
	}
}

var updateTimer = 0
function setInput(script, inText) {
	if(inText) {
		const numberReg = /^\s*?(-?[0-9]+)/
		const inputs = byId('inputs')
		var position = 0 // TODO rework on event system, should listen to reset event to rewind position
		script.setCallbacks({
			'input': {
				'integer': () =>  {
					var text = inputs.value
					var mat = text.substring(position).match(numberReg)
					if(!mat) {
						return -1
					} else {
						position += mat[0].length
						return mat[1]|0
					}
				},
				'character': () => {
					var text = inputs.value
					if(position >= text.length) {
						return -1
					} else {
						var char = text.charCodeAt(position)
						// unicode surrogate pair(https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs)
						if(position + 1 < text.length && 0xD800 <= char && char <= 0xDBFF) {
							var additional = text.charCodeAt(position + 1)
							if(0xDC00 <= additional && additional <= 0xDFFF) {
								char = (char - 0xD800) * 0x400 + additional - 0xDC00 + 0x10000
								position++
							}// else unknown, just let go
						}
						position++
						return char
					}
				}
			}
		})
	} else {
		script.setCallbacks({
			'input': {
				'integer': () => prompt("정수를 입력해주세요.") | 0,
				'character': () => {
					var str = prompt("문자를 입력해주세요.")
					if(str.length > 0) {
						var char = str.charCodeAt(0)
						if(str.length > 1 && 0xD800 <= char && char <= 0xDBFF) {
							var additional = str.charCodeAt(1)
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
		})
	}
}
function initScript() {
	var area = byId("scriptarea")
	var code = area.innerText
	area.innerHTML = code.replace(/^./, '<b>$&</b>')
	var script = new aheui.Aheui(code)

	const debug = byId("debug").checked
	setupResults(debug)
	setCallbacks(script, debug)

	setInput(script, byId("input-text").checked)

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

var runner
byId("run").onclick = function() {
	if(!runner) runner = initScript()
	var batch = byId("batch")
	batch.disabled = true
	runner.run(batch.value|0)
}
byId("stop").onclick = function() {
	if(runner) runner.stop()
	byId("batch").disabled = false
}
byId("step").onclick = function() {
	if(!runner) runner = initScript()
	runner.step()
}
byId("reset").onclick = function() {
	if(runner) runner.reset()
	else runner = initScript()
	byId("batch").disabled = false
}
byId("debug").onchange = function() {
	if(runner) {
		setupResults(this.checked, true)
		setCallbacks(runner, this.checked)
	}
	byId('stack-container').style.display = this.checked? "" : "none"
}
byId("input-text").onchange = function() {
	byId('inputs').disabled = !this.checked
	if(runner) {
		setInput(runner, this.checked)
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
