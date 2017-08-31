"use strict";

/**
 * @param {Object} root
 * @param {undefined=} undefined
 */
(function(root, undefined) {
	const cCho = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ],
		cJung = [ 'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ' ],
		cJong = [ '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ];
	const jongCount = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3]
	
	function parseChar(c) {
		if(c < 0xAC00 || c > 0xD7A3) return [11, 1, 0] // default, no-op character
		c -= 0xAC00
		return [c/28/21 | 0, (c/28 | 0) % 21, c % 28]
	}

	var aheui = (function() {
		const STACK_EMPTY = "STACK EMPTY"

		function Op(argCount, operation, handler) {
			if(typeof argCount === 'function') {
				this.run = argCount; // run(function(stack)) = argCount(stack)
			} else {
				this.count = argCount
				this.operation = operation
				this.handler = handler || ((stack, result, argument) => stack.push(result))
			}
		}
		Op.prototype.run = function(stack, argument) {
			var args = []
			for(var i = 0; i < this.count; i++) {
				try {
					args.push(stack.pop())
				} catch (e) {
					for(var j = i - 1; j >= 0; j--) {
						stack.push(args.pop())
					}
					throw e
				}
			}
			args.reverse()
			this.handler(stack, this.operation.apply(this, args), argument)
		}
		const NO_OP = new Op(() => {})

		function Stack() {
			this.items = []
		}
		Stack.prototype.push = function(value) { return this.items.push(value) }
		Stack.prototype.pop = function() {
			var res = this.items.pop()
			if(res === undefined) {
				throw STACK_EMPTY
			}
			return res
		}
		function Queue() {
			this.items = []
		}
		Queue.prototype.push = function(value) { return this.items.push(value) }
		Queue.prototype.pop = function() {
			var res = this.items.shift()
			if(res === undefined) {
				throw STACK_EMPTY
			}
			return res
		}
		Queue.prototype.append = function(value) { return this.items.unshift(value) }

		function Cell(operations, char) {
			this.op = operations[char[0]]
			this.dir = char[1]
			this.argument = char[2]
		}
		Cell.prototype.run = function(aheui) {
			aheui._updateDirection(this.dir)
			try {
				this.op.run(aheui.stacks[aheui.currentStack], this.argument)
			} catch (e) {
				if(e === STACK_EMPTY) {
					aheui._updateDirection(19 /* ㅢ, reverse */)
				} else {
					throw e
				}
			}
			aheui._followDirection()
		}
		const EMPTY_CELL = new Cell([NO_OP], [0, 1, 0])

		function Aheui(script) {
			var that = this

			that.script = script

			that.reset(true)

			var operations = [
			/* ㄱ */ NO_OP,
			/* ㄲ */ NO_OP,
			/* ㄴ */ new Op(2, (a, b) => a / b |0),
			/* ㄷ */ new Op(2, (a, b) => a + b),
			/* ㄸ */ new Op(2, (a, b) => a * b),
			/* ㄹ */ new Op(2, (a, b) => a % b),
			/* ㅁ */ new Op(1, (a) => a,
						(stack, result, argument) => {
							if(argument === 21 /* ㅇ */) {
								that.callbacks.output.integer(that, result)
							} else if(argument === 27 /* ㅎ */) {
								var char
								if(result <= 0xFFFF || result > 0x10FFFF) {
									char = String.fromCharCode(result)
								} else { // build surrogate pair
									result -= 0x10000
									char = String.fromCharCode((result >> 10) + 0xD800, (result % 0x400) + 0xDC00)
								}
								that.callbacks.output.character(that, char)
							}
						}),
			/* ㅂ */ new Op((stack, argument) => {
							if(argument === 21 /* ㅇ */) {
								stack.push(that.callbacks.input.integer(that))
							} else if(argument === 27 /* ㅎ */) {
								var char = that.callbacks.input.character(that)
								stack.push(typeof char === 'string'? char.charCodeAt(0) : char)
							} else {
								stack.push(jongCount[argument])
							}
						}),
			/* ㅃ */ new Op(1, (a) => a,
						(stack, a) => {
							if(stack instanceof Queue) {
								stack.append(a)
								stack.append(a)
							} else {
								stack.push(a)
								stack.push(a)
							}
						}),
			/* ㅅ */ new Op((stack, argument) => {
							that.currentStack = argument
						}),
			/* ㅆ */ new Op(1, (a) => a,
						(stack, result, argument) => {
							that.stacks[argument].push(result)
						}),
			/* ㅇ */ NO_OP,
			/* ㅈ */ new Op(2, (a, b) => a >= b? 1 : 0),
			/* ㅉ */ NO_OP,
			/* ㅊ */ new Op(1, (a) => a != 0,
						(stack, result) => {
							if(!result) {
								that.dx = -that.dx
								that.dy = -that.dy
							}
						}),
			/* ㅋ */ NO_OP,
			/* ㅌ */ new Op(2, (a, b) => a - b),
			/* ㅍ */ new Op(2, (a, b) => [b, a],
						(stack, result) => {
							if(stack instanceof Queue) {
								stack.append(result[0])
								stack.append(result[1])
							} else {
								stack.push(result[0])
								stack.push(result[1])
							}
						}),
			/* ㅎ */ new Op((stack) => {
						var res
						try {
							res = stack.pop()
						} catch (e) {
							res = 0
						}
						that.exitCode = res
					})
			]

			var lines = that.script.split(/\r?\n/)
			that.plane = []
			lines.forEach((line, i) => {
				that.plane[i] = []
				for(var j = 0; j < line.length; j++) {
					that.plane[i][j] = new Cell(operations, parseChar(line.charCodeAt(j)))
				}
			})

			that.callbacks = {
				'input': {
					'integer': () => prompt("정수를 입력해주세요.") | 0,
					'character': () => prompt("문자를 입력해주세요.")
				},
				'output': {
					'integer': (ah, int) => alert(int),
					'character': (ah, chr) => alert(chr)
				},
				'event': {
					'reset': () => console.log("[Aheui] Resetted"),
					'start': () => console.log("[Aheui] Run started"),
					'step': (ah) => console.log("[Aheui] Step# " + ah.stepCount),
					'stop': () => console.log("[Aheui] Run stopped"),
					'end': (ah) => console.log("[Aheui] Run finished with code:", ah.exitCode)
				}
			}
		}
		Aheui.prototype.setCallbacks = function(cbObj) {
			(function recur(callback, cbObj) {
				for(var i in cbObj) {
					if(callback.hasOwnProperty(i)) {
						if(typeof cbObj[i] === 'object') {
							recur(callback[i], cbObj[i])
						} else if(typeof cbObj[i] === 'function') {
							callback[i] = cbObj[i]
						}
					}
				}
			})(this.callbacks, cbObj)
		}
		Aheui.prototype.reset = function(_suppressEvent) {
			var that = this

			that.stacks = {}
			cJong.forEach((c, i) => {
				if(c === 'ㅇ') that.stacks[i] = new Queue()
				else that.stacks[i] = new Stack()
			})

			that.currentStack = 0
			that.exitCode = null
			that.stepCount = 0
			that.running = false
			that._interval = 0

			that.x = 0
			that.y = 0

			that.dx = 0
			that.dy = 1

			if(!_suppressEvent) {
				that.callbacks.event.reset(that)
			}
		}
		Aheui.prototype.step = function() {
			if(this.exitCode !== null) return
			if(!this.running) {
				this.callbacks.event.start(this)
			}
			if(this.plane[this.y] && this.plane[this.y][this.x])
				this.plane[this.y][this.x].run(this)
			else
				EMPTY_CELL.run(this)
			this.stepCount++
			this.callbacks.event.step(this)
			if(!this.running) {
				if(this.exitCode === null) {
					this.callbacks.event.stop(this)
				} else {
					this.callbacks.event.end(this)
				}
			}
		}
		Aheui.prototype.run = function(batchSize) {
			var that = this
			if(that.running) return
			that.running = true

			that.callbacks.event.start(that)

			if(typeof batchSize === 'number' && batchSize > 0) {
				that._batch(batchSize)
			} else if(batchSize === 0) {
				while(/*that.running &&*/ that.exitCode === null) {
					that.step()
				}
				that.running = false
				that.callbacks.event.end(that)
			} else {
				that._batch(10000)
			}
		}
		/** @private */
		Aheui.prototype._batch = function(count) {
			var that = this
			if(that.running) clearInterval(that._interval)
			that._interval = setInterval(function runLoop() {
				if(!that.running) return

				for(var i = 0; i < count && that.exitCode === null; i++) {
					that.step()
				}

				if(that.exitCode !== null) {
					that.running = false
					clearInterval(that._interval)
					that._interval = 0
					that.callbacks.event.end(that)
				}
			}, 0)

		}
		Aheui.prototype.stop = function() {
			if(this.running) {
				clearInterval(this._interval)
				this.running = false
				this.callbacks.event.stop(this)
			}
		}
		Aheui.prototype._updateDirection = function(jung) {
			switch(jung) {
			case 0: /* ㅏ */
				this.dx = 1
				this.dy = 0
				break
			case 4: /* ㅓ */
				this.dx = -1
				this.dy = 0
				break
			case 13: /* ㅜ */
				this.dx = 0
				this.dy = 1
				break
			case 8: /* ㅗ */
				this.dx = 0
				this.dy = -1
				break
			
			case 2: /* ㅑ */
				this.dx = 2
				this.dy = 0
				break
			case 6: /* ㅕ */
				this.dx = -2
				this.dy = 0
				break
			case 17: /* ㅠ */
				this.dx = 0
				this.dy = 2
				break
			case 12: /* ㅛ */
				this.dx = 0
				this.dy = -2
				break

			case 20: /* ㅣ */
				this.dx = -this.dx
				break;
			case 18: /* ㅡ */
				this.dy = -this.dy
				break
			case 19: /* ㅢ */
				this.dx = -this.dx
				this.dy = -this.dy
				break
			// default: break
			}
		}
		Aheui.prototype._followDirection = function() {
			this.x += this.dx
			if(this.x < 0)
				this.x = this.plane[this.y].length - 1
			else if(this.x >= this.plane[this.y].length && this.dx !== 0)
				this.x = 0

			this.y += this.dy
			if(this.y < 0) {
				/*var newY
				for(newY = this.plane.length - 1; newY > 0; newY--) {
					if(this.plane[newY].length > this.x) break
				}
				this.y = newY*/
				this.y = this.plane.length - 1
			} else if(this.y >= this.plane.length)
				this.y = 0
		}


		return {
			'Aheui': Aheui,

			'cho': cCho,
			'jung': cJung,
			'jong': cJong
		}
	})();
	
	/** @suppress {checkVars} */
	(function register() {
		if(typeof exports !== 'undefined') {
			if(typeof module !== 'undefined' && module.exports) {
				exports = module.exports = aheui
			}
			exports['aheui'] = aheui
		} else if (typeof define === 'function' && define.amd) {
			define([], function() {
				return aheui;
			});
		} else {
			root['aheui'] = aheui
		}
	})()
})(this);
