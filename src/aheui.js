"use strict";

(
/**
 * @param {Object} root
 * @param {undefined=} undefined
 */
 function(root, undefined) {
	const cCho = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ],
		cJung = [ 'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ' ],
		cJong = [ '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ];
	const jongCount = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3]
	
	/**
	 * @private
	 * The exception identifying that the stack is empty.
	 */
	class StackEmptyException {

	}

	/**
	 * Single stack storing numbers.
	 */
	class Stack {
		constructor() {
			/**
			 * @type {!Array<number>}
			 * @protected
			 */
			this._items = []
		}

		/**
		 * Push a number into the stack.
		 * @param {number} value
		 */
		push(value) {
			this._items.push(value)
		}
		/**
		 * Pop a number from the stack. Throws StackEmptyException if the stack is empty.
		 * @return {number} Popped value
		 * @throws {StackEmptyException}
		 */
		pop() {
			var res = this._items.pop()
			if(res === undefined) {
				throw new StackEmptyException()
			}
			return res
		}
	}

	/**
	 * Queue, FIFO data structure storing numbers
	 */
	class Queue extends Stack {
		/**
		 * Pulls a number from the queue. Throws StackEmptyException if the queue is empty
		 * @return {number} Pulled value
		 * @throws {StackEmptyException}
		 */
		pop() {
			var res = this._items.shift()
			if(res === undefined) {
				throw new StackEmptyException()
			}
			return res
		}
		/**
		 * Appends the value to the front of the queue, unlike push() which adds to the last.
		 * @param {number} value
		 */
		append(value) {
			this._items.unshift(value)
		}
	}

	/**
	 * Interface of various operations
	 */
	class Operation {
		/**
		 * Initialize the operation. Happens once when the script is loaded.
		 */
		constructor() {}
		/**
		 * Performs the operation based on the state (of a stack)
		 * @param {Stack} stack Currently selected Stack instance
		 * @param {number} argument Integer given in the instruction
		 */
		run(stack, argument) {}
	}
	/**
	 * Operation which just calls the function given.
	 */
	class RawOperation extends Operation {
		/**
		 * Initialize with the function to be called.
		 * @param {!function(Stack, number)} operation
		 */
		constructor(operation) {
			super()
			/** @private {function(Stack, number)} */
			this._operation = operation
		}
		
		run(stack, argument) {
			this._operation(stack, argument)
		}
	}

	/**
	 * Utility operation which pops certain amount of values from stack and process them.
	 */
	class PopOperation extends Operation {
		/**
		 * Initializes the PopOperation
		 * @param {number} count Number of the items to be popped
		 * @param {!function(...number)} operation Operation to be performed on the popped items
		 * @param {function(Stack, ?, number)=} resultHandler Handler of the return value of the `operation` function. Pushes into the stack by default.
		 */
		constructor(count, operation, resultHandler) {
			super()
			/** @private {number} */
			this._count = count
			/** @private {function(...number)} */
			this._operation = operation
			/** @private {function(Stack, ?, number)} */
			this._handler = resultHandler || ((stack, result, argument) => stack.push(result))
		}
		run(stack, argument) {
			/** @type {Array<number>} */
			var args = []
			for(var i = 0; i < this._count; i++) {
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
			this._handler(stack, this._operation.apply(this, args), argument)
		}
	}

	class Cell {
		/**
		 * Builds a cell with the given character
		 * @param {string|number|!Array<number>} char Character, parsed or not, representing a cell
		 * @param {!Array<Operation>} operations List of the operations per each 'Choseong'
		 */
		constructor(char, operations) {
			if(typeof char === 'string' || typeof char === 'number')
				char = Cell.parseChar(/** @type {string|number} */ (char))
			/** @private {Operation} */
			this._op = operations[char[0]]
			/** @private {number} */
			this._dir = char[1]
			/** @private {number} */
			this._argument = char[2]
		}

		/** Execute the cell, performs operation execution, direction update, moving the plane
		 * @param {!Aheui} aheui
		 */
		run(aheui) {
			aheui._updateDirection(this._dir)
			try {
				this._op.run(aheui.stacks[aheui.currentStack], this._argument)
			} catch (e) {
				if(e instanceof StackEmptyException) {
					aheui._updateDirection(19 /* ㅢ, reverse */)
				} else {
					throw e
				}
			}
			aheui._followDirection()
		}

		/**
		 * Parse a Korean character to the array of [Choseong(number), Jungseong(number), Jongseong(number)]
		 * Any non-Korean or not-complete characters are treated as "애", a no-op character in Aheui
		 * @param {string|number} c A string(only the first one is used) or a number representing the character code
		 * @return {!Array<number>}
		 */
		static parseChar(c) {
			if(typeof c === 'string') c = c.charCodeAt(0)
			if(c < 0xAC00 || c > 0xD7A3) return [11, 1, 0] // default, no-op character
			c -= 0xAC00
			return [c/28/21 | 0, (c/28 | 0) % 21, c % 28]
		}
	}

	/** @type {!Operation} */
	const NO_OP = new Operation()
	/** @type {!Cell} */
	const EMPTY_CELL = new Cell([NO_OP], [0, 1, 0])

	/**
	 * Aheui script interpreter
	 */
	class Aheui {
		constructor(script) {
			var that = this

			/** @type {string} */
			this.script = script

			/** @export {!Array<Stack>} */
			this.stacks = []
			cJong.forEach((c, i) => {
				if(c === 'ㅇ') that.stacks[i] = new Queue()
				else that.stacks[i] = new Stack()
			})

			/** @type {number} */
			this.currentStack = 0
			/** @type {?number} */
			this.exitCode = null
			/** @type {number} */
			this.stepCount = 0
			/** @type {boolean} */
			this.running = false
			/** @private {?number} */
			this._interval = 0

			/** @type {number} */
			this.x = 0
			/** @type {number} */
			this.y = 0

			/** @type {number} */
			this.dx = 0
			/** @type {number} */
			this.dy = 1

			var operations = [
			/* ㄱ */ NO_OP,
			/* ㄲ */ NO_OP,
			/* ㄴ */ new PopOperation(2, (a, b) => a / b |0),
			/* ㄷ */ new PopOperation(2, (a, b) => a + b),
			/* ㄸ */ new PopOperation(2, (a, b) => a * b),
			/* ㄹ */ new PopOperation(2, (a, b) => a % b),
			/* ㅁ */ new PopOperation(1, (a) => a,
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
			/* ㅂ */ new RawOperation((stack, argument) => {
							if(argument === 21 /* ㅇ */) {
								stack.push(that.callbacks.input.integer(that))
							} else if(argument === 27 /* ㅎ */) {
								var char = that.callbacks.input.character(that)
								stack.push(typeof char === 'string'? char.charCodeAt(0) : char)
							} else {
								stack.push(jongCount[argument])
							}
						}),
			/* ㅃ */ new PopOperation(1, (a) => a,
						(stack, a) => {
							if(stack instanceof Queue) {
								stack.append(a)
								stack.append(a)
							} else {
								stack.push(a)
								stack.push(a)
							}
						}),
			/* ㅅ */ new RawOperation((stack, argument) => {
							that.currentStack = argument
						}),
			/* ㅆ */ new PopOperation(1, (a) => a,
						(stack, result, argument) => {
							that.stacks[argument].push(result)
						}),
			/* ㅇ */ NO_OP,
			/* ㅈ */ new PopOperation(2, (a, b) => a >= b? 1 : 0),
			/* ㅉ */ NO_OP,
			/* ㅊ */ new PopOperation(1, (a) => a != 0,
						(stack, result) => {
							if(!result) {
								that.dx = -that.dx
								that.dy = -that.dy
							}
						}),
			/* ㅋ */ NO_OP,
			/* ㅌ */ new PopOperation(2, (a, b) => a - b),
			/* ㅍ */ new PopOperation(2, (a, b) => [b, a],
						(stack, result) => {
							if(stack instanceof Queue) {
								stack.append(result[0])
								stack.append(result[1])
							} else {
								stack.push(result[0])
								stack.push(result[1])
							}
						}),
			/* ㅎ */ new RawOperation((stack) => {
						var res
						try {
							res = stack.pop()
						} catch (e) {
							res = 0
						}
						that.exitCode = res
					})
			]

			var lines = this.script.split(/\r?\n/)
			/** @type {Array<Array<Cell>>} */
			this.plane = []
			lines.forEach((line, i) => {
				that.plane[i] = []
				for(var j = 0; j < line.length; j++) {
					that.plane[i][j] = new Cell(line.charCodeAt(j), operations)
				}
			})

			/** @type {Object} */
			this.callbacks = {
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

		/**
		 * Registers callbacks to the script.
		 * Note that, at this moment, only one callback can be registered.
		 * @param {Object} cbObj
		 */
		setCallbacks(cbObj) {
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

		/**
		 * @private
		 * Initializes the local variables.
		 */
		_init() {
			var that = this

			that.stacks = []
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
		}

		/**
		 * Resets the execution status of the script
		 */
		reset() {
			this._init()
			this.callbacks.event.reset(this)
		}

		/**
		 * Execute a single cell.
		 */
		step() {
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

		/**
		 * Start execution from the last stopped position(or the beginning)
		 * @param {number=} batchSize Size of the batch, the number of cells to execute per timer tick. 0 to run synchronously.
		 */
		run(batchSize) {
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

		/**
		 * @private
		 * Setup batches with the given count
		 * @param {number} count Number of cell runs in a batch
		 */
		_batch(count) {
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

		/**
		 * Stop the running script.
		 * But, due to the nature of Javascript, a script running synchronously cannot be stopped.
		 */
		stop() {
			if(this.running) {
				clearInterval(this._interval)
				this.running = false
				this.callbacks.event.stop(this)
			}
		}

		/**
		 * @private
		 * Update the direction vector according to the given Jungseong directive.
		 * @param {number} jung 0-based Jungseong of an instruction
		 */
		_updateDirection(jung) {
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

		/**
		 * @private
		 * Moves along the plane by the direction vector.
		 */
		_followDirection() {
			this.x += this.dx
			if(this.x < 0) {
				this.x = this.plane[this.y].length - 1
			} else if(this.x >= this.plane[this.y].length && this.dx !== 0) {
				this.x = 0
			}

			this.y += this.dy
			if(this.y < 0) {
				this.y = this.plane.length - 1
			} else if(this.y >= this.plane.length) {
				this.y = 0
			}
		}
	};

	var aheui = {
		'Aheui': Aheui,

		'cho': cCho,
		'jung': cJung,
		'jong': cJong
	};
	
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
