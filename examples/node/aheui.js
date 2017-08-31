#!/usr/bin/env node

const fs = require('fs'),
	aheui = require('./aheuijs')

var script = ""
var input = ""
var scriptInput = true

var scriptStarted = false
function startScript() {
	if(scriptStarted) return
	scriptStarted = true

	var ah = setupScript(script, input)
	ah.run(0)
}

process.stdin.setEncoding('utf8')

if(process.argv.length > 2) {
	scriptInput = false
	fs.readFile(process.argv[2], 'utf8', (err, data) => {
		if(err) throw err
		script = data
		startScript()
	})
}

process.stdin.on('readable', () => {
	if(scriptInput) {
		const chunk = process.stdin.read()
		if (chunk !== null) {
			if(chunk.indexOf('\0') === -1) {
				script += chunk
			} else {
				scriptInput = false

				var spl = chunk.split('\0')
				script += spl[0]
				input += spl[1]
				startScript()
			}
		}
	}
})

process.stdin.on('end', () => {
	startScript()
})


const numberReg = /^\s*?(-?[0-9]+)/
function Input(stream, buffer) {
	var that = this
	that.buffer = ""
	that.finished = false
	if(buffer) that.buffer += buffer

	if(!stream) stream = process.stdin
	that.stream = stream
	that.stream.on('data', (chunk) => {
		that.buffer += chunk
	}).on('end', () => {
		that.finished = true
	})
}
Input.prototype.readInt = function() {
	var mat = this.buffer.match(numberReg)
	if(!mat) {
		if(this.finished) {
			return -1
		} else {
			// TODO
			return -1
		}
	} else {
		if(this.finished) {
			this.buffer = this.buffer.slice(mat[0].length)
			return mat[1]|0
		} else {
			// TODO
			this.buffer = this.buffer.slice(mat[0].length)
			return mat[1]|0
		}
	}
}
Input.prototype.readChar = function() {
	if(this.buffer.length > 0) {
		var char = this.buffer.charAt(0)
		this.buffer = this.buffer.slice(1)
		return char
	} else if(this.finished) {
		return -1
	} else {
		// TODO
		return -1
	}
}


function setupScript(scr, lastInput) {
	var script = new aheui.Aheui(scr)
	var input = new Input(null, lastInput)
	script.setCallbacks({
		'input': {
			'integer': () => input.readInt(),
			'character': () => input.readChar()
		},
		'output': {
			'integer': (ah, int) => process.stdout.write(int+''),
			'character': (ah, chr) => process.stdout.write(chr)
		},
		'event': {
			'reset': () => {},
			'step': () => {},
			'end': (ah) => process.exit(ah.exitCode)
		}
	})
	return script
}
