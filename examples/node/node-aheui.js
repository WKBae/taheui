#!/usr/bin/env node

const fs = require('fs'),
	aheui = require('../../dist/aheui.min')

class Input {
	constructor(stream) {
		this.buffer = ""
		this.finished = false
		this.pendingReads = []

		if(!stream) stream = process.stdin
		this.stream = stream
		stream.setEncoding('utf8')

		this.stream.on('readable', () => {
			const chunk = this.stream.read()
			if (chunk !== null) {
				this.buffer += chunk
				this._processPendingReads()
			}
		}).on('end', () => {
			this.finished = true
			this._processPendingReads()
		})
	}

	_processPendingReads() {
		while (this.pendingReads.length > 0) {
			const success = this.pendingReads[0]()
			if (!success) {
				break
			}
			this.pendingReads = this.pendingReads.slice(1)
		}
	}

	// Execute fn and return the result. If the return value of fn is null, which means the value is not available in stream, returns Promise yielding non-null result once the value is available.
	_asyncRead(fn) {
		const value = fn()
		if (value === null) {
			return new Promise((resolve) => {
				this.pendingReads.push(() => {
					const newResult = fn()
					if (newResult === null) {
						return false
					}
					resolve(newResult)
					return true
				})
			})
		}
		return value
	}

	_readScript() {
		const sep = this.buffer.indexOf('\0')
		if (sep === -1) {
			return null
		}
		const script = this.buffer.slice(0, sep)
		this.buffer = this.buffer.slice(sep + 1)
		return script
	}

	readScript() {
		return this._asyncRead(() => this._readScript())
	}

	_readInt() {
		if (this.finished) {
			const mat = this.buffer.match(/^\s*?(-?[0-9]+)/)
			if (!mat) {
				return -1
			} else {
				this.buffer = this.buffer.slice(mat[0].length)
				return mat[1]|0
			}
		}
		const nonNumber = this.buffer.search(/^\s*?[^\-0-9]/)
		if (nonNumber >= 0) {
			return -1
		}
		// input is not ready
		return null
	}

	readInt() {
		return this._asyncRead(() => this._readInt())
	}

	_readChar() {
		if (this.buffer.length > 0) {
			let char = this.buffer.charCodeAt(0)
			// unicode surrogate pair(https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs)
			if (0xD800 <= char && char <= 0xDBFF) {
				if (this.buffer.length < 2) {
					if (this.finished) {
						return -1
					}
					// input is not ready
					return null
				}
				const additional = this.buffer.charCodeAt(1)
				if(0xDC00 <= additional && additional <= 0xDFFF) {
					char = (char - 0xD800) * 0x400 + additional - 0xDC00 + 0x10000
					this.buffer = this.buffer.slice(1)
				}// else unknown, just let go
			}
			this.buffer = this.buffer.slice(1)
			return char
		} else if (this.finished) {
			return -1
		}
		// input is not ready
		return null
	}

	readChar() {
		return this._asyncRead(() => this._readChar())
	}
}

const input = new Input(process.stdin)

function startScript(scriptText) {
	const script = new aheui.Aheui(scriptText)
	script.setIntegerInput(() => input.readInt())
	script.setCharacterInput(() => input.readChar())

	script.on('integer', (int) => process.stdout.write(int+''))
		.on('character', (chr) => process.stdout.write(chr))
		.on('end', (exitCode) => process.exit(exitCode))

	script.run(0)
}

if(process.argv.length > 2) {
	fs.readFile(process.argv[2], 'utf8', (err, data) => {
		if(err) throw err
		startScript(data)
	})
} else {
	Promise.resolve(input.readScript()).then(data => startScript(data))
}
