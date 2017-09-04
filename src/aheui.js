"use strict";

(
/**
 * @param {Object} root
 * @param {undefined=} undefined
 */
 function(root, undefined) {
 	/** @type {!Array<!String>} */
	const cCho = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ]
	/** @type {!Array<!String>} */
	const cJung = [ 'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ' ]
	/** @type {!Array<!String>} */
	const cJong = [ '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ]
	/** @type {!Array<!number>} */
	const jongCount = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3]
	
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
		 * Pop a number from the stack. Returns `undefined` if the stack is empty.
		 * @return {number|undefined} Popped value
		 */
		pop() {
			var res = this._items.pop()
			/*if(res === undefined) {
				// throw new StackEmptyException()
				return undefined
			}*/
			return res
		}

		/**
		 * Loops for each element of this stack. Index orders from the bottom(first-in, last-out) to top(last-in, first-out)
		 * @param {!function(number, number):?boolean} loop Loop function with parameters (element, index), optionally returns false to break, called for every elements.
		 */
		every(loop) {
			for(var i = 0; i < this._items.length; i++) {
				if(loop(this._items[i], i) === false) break
			}
		}
	}

	/**
	 * Queue, FIFO data structure storing numbers
	 */
	class Queue {
		constructor() {
			/**
			 * @type {?Array<number|?Array>}
			 * @protected
			 */
			this._head = null
			/**
			 * @type {?Array<number|?Array>}
			 * @protected
			 */
			this._tail = null
		}

		/**
		 * Push a number into the stack.
		 * @param {number} value
		 */
		push(value) {
			var node = [value, null]
			if(this._tail) {
				this._tail[1] = node
				this._tail = node
			} else {
				this._tail = this._head = node
			}
		}
		/**
		 * Pulls a number from the queue. Returns `undefined` if the queue is empty
		 * @return {number|undefined} Pulled value
		 */
		pop() {
			if(this._head) {
				var val = /** @type {number} */ (this._head[0])
				this._head = /** @type {Array<number|?Array>} */ (this._head[1])
				if(!this._head) this._tail = null
				return val
			} else {
				return undefined
			}
		}
		/**
		 * Appends the value to the front of the queue, unlike push() which adds to the last.
		 * @param {number} value
		 */
		append(value) {
			this._head = [value, this._head]
		}

		/**
		 * Loops for each element of this queue. Index orders from the front(first-in, first-out) to back(last-in, last-out)
		 * @param {!function(number, number):?boolean} loop Loop function with parameters (element, index), optionally returns false to break, called for every elements.
		 */
		every(loop) {
			for(var node = this._head, i = 0; node != null; node = node[1], i++) {
				if(loop(/** @type {number} */ (node[0]), i) === false) break
			}
		}
	}

	
	/**
	 * Return an operation which just calls the function given.
	 * @param {!(function((Stack|Queue), ?, number)|function((Stack|Queue), ?, number):boolean)} operation Operation function to execute
	 * @return {(function((Stack|Queue), ?, number)|function((Stack|Queue), ?, number):boolean)} operation
	 */
	function rawOperation(operation) {
		return operation
	}

	/**
	 * Builds a pop operation, which pops certain amount of values from stack and process them.
	 * @param {number} count Number of the items to be popped
	 * @param {!function(...number)} operation Operation to be performed on the popped items
	 * @param {(function((Stack|Queue), ?, number)|function((Stack|Queue), ?, number):boolean)=} resultHandler Handler of the return value of the `operation` function. Pushes into the stack by default.
	 * @return {function((Stack|Queue), number):boolean} Operation function
	 */
	function popOperation(count, operation, resultHandler) {
		var handler = resultHandler || ((stack, result, argument) => stack.push(result))

		if(count == 1) {
			return function pop1Operate(stack, argument) {
				/** @type {number|undefined} */
				var one = stack.pop()
				if(one === undefined) {
					return false
				}
				return handler(stack, operation(one), argument)
			}
		} else if(count == 2) {
			return function pop2Operate(stack, argument) {
				/** @type {number|undefined} */
				var two = stack.pop()
				if(two === undefined) {
					return false
				}
				/** @type {number|undefined} */
				var one = stack.pop()
				if(one === undefined) {
					if(stack.append) stack.append(two)
					else stack.push(two)
					return false
				}
				return handler(stack, operation(one, two), argument)
			}
		} else {
			return function popOperate(stack, argument) {
				/** @type {Array<number>} */
				var args = []
				for(var i = count - 1; i >= 0; i--) {
					args[i] = stack.pop()
					if(args[i] === undefined) {
						var push = stack.append || stack.push // (stack instanceof Queue)? stack.append : stack.push
						for(i++; i < count; i++) {
							push.call(stack, args[i])
						}
						return false
					}
				}
				return handler(stack, operation.apply(this, args), argument)
			}
		}
	}

	class Cell {
		/**
		 * Builds a cell with the given character
		 * @param {string|number|!Array<number>} char Character, parsed or not, representing a cell
		 * @param {!Array<function((Stack|Queue), number)>} operations List of the operations per each 'Choseong'
		 */
		constructor(char, operations) {
			if(typeof char === 'string' || typeof char === 'number')
				char = Cell.parseChar(/** @type {string|number} */ (char))
			/** @private {function((Stack|Queue), number)} */
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
			
			var success = this._op(aheui.stacks[aheui.currentStack], this._argument)
			if(success === false) {
				aheui._updateDirection(19 /* ㅢ, reverse */)
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

	/** @type {!function((Stack|Queue), number)} */
	const NO_OP = rawOperation(() => {})
	/** @type {!Cell} */
	const EMPTY_CELL = new Cell([0, 1, 0], [NO_OP])

	/**
	 * Aheui script interpreter
	 */
	class Aheui {
		constructor(script) {
			/** @type {string} */
			this.script = script

			this._init()

			var that = this
			var operations = [
			/* ㄱ */ NO_OP,
			/* ㄲ */ NO_OP,
			/* ㄴ */ popOperation(2, (a, b) => a / b |0),
			/* ㄷ */ popOperation(2, (a, b) => a + b),
			/* ㄸ */ popOperation(2, (a, b) => a * b),
			/* ㄹ */ popOperation(2, (a, b) => a % b),
			/* ㅁ */ popOperation(1, (a) => a,
						(stack, result, argument) => {
							if(argument === 21 /* ㅇ */) {
								that.emit('integer', result)
							} else if(argument === 27 /* ㅎ */) {
								var char
								if(result <= 0xFFFF || result > 0x10FFFF) {
									char = String.fromCharCode(result)
								} else { // build surrogate pair
									result -= 0x10000
									char = String.fromCharCode((result >> 10) + 0xD800, (result % 0x400) + 0xDC00)
								}
								that.emit('character', char)
							}
						}),
			/* ㅂ */ rawOperation((stack, argument) => {
							if(argument === 21 /* ㅇ */) {
								stack.push(that._intIn.call(that))
							} else if(argument === 27 /* ㅎ */) {
								var char = that._charIn.call(that)
								stack.push(typeof char === 'string'? char.charCodeAt(0) : char)
							} else {
								stack.push(jongCount[argument])
							}
						}),
			/* ㅃ */ popOperation(1, (a) => a,
						(stack, a) => {
							if(stack.append) {
								stack.append(a)
								stack.append(a)
							} else {
								stack.push(a)
								stack.push(a)
							}
						}),
			/* ㅅ */ rawOperation((stack, argument) => {
							that.currentStack = argument
						}),
			/* ㅆ */ popOperation(1, (a) => a,
						(stack, result, argument) => {
							that.stacks[argument].push(result)
						}),
			/* ㅇ */ NO_OP,
			/* ㅈ */ popOperation(2, (a, b) => a >= b? 1 : 0),
			/* ㅉ */ NO_OP,
			/* ㅊ */ popOperation(1, (a) => a != 0,
						(stack, result) => {
							if(!result) {
								that.dx = -that.dx
								that.dy = -that.dy
							}
						}),
			/* ㅋ */ NO_OP,
			/* ㅌ */ popOperation(2, (a, b) => a - b),
			/* ㅍ */ popOperation(2, (a, b) => [b, a],
						(stack, result) => {
							if(stack.append) {
								stack.append(result[0])
								stack.append(result[1])
							} else {
								stack.push(result[0])
								stack.push(result[1])
							}
						}),
			/* ㅎ */ rawOperation((stack) => {
						that.exitCode = stack.pop() || 0
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

			/** @private {!Object<string, Array<function(this:Aheui, ...?)>>} */
			this._callbacks = {}

			// TODO use callbacks instead of return value
			/** @private {!function(this:Aheui):number} */
			this._intIn = () => -1
			/** @private {!function(this:Aheui):(string|number)} */
			this._charIn = () => -1
		}

		/**
		 * @private
		 * Initializes the local variables.
		 */
		_init() {
			/** @type {!Array<Stack|Queue>} */
			this.stacks = []
			for(var i = 0; i < cJong.length; i++) {
				if(i == 21 /* 'ㅇ' */) this.stacks[i] = new Queue()
				else this.stacks[i] = new Stack()
			}

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

		}

		/**
		 * Resets the execution status of the script
		 */
		reset() {
			this._init()
			this.emit('reset')
		}

		/**
		 * Execute a single cell.
		 */
		step() {
			if(this.exitCode !== null) return
			if(!this.running) {
				this.emit('start')
			}
			if(this.plane[this.y] && this.plane[this.y][this.x])
				this.plane[this.y][this.x].run(this)
			else
				EMPTY_CELL.run(this)
			this.stepCount++
			this.emit('step')
			if(!this.running) {
				if(this.exitCode === null) {
					this.emit('stop')
				} else {
					this.emit('end')
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

			that.emit('start')

			if(typeof batchSize === 'number' && batchSize > 0) {
				that._batch(batchSize)
			} else if(batchSize === 0) {
				while(/*that.running &&*/ that.exitCode === null) {
					that.step()
				}
				that.running = false
				that.emit('end')
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
					that.emit('end')
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
				this.emit('stop')
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

		/**
		 * Register a callback for an event.
		 * Aheui object is bound as `this` when the callback is called
		 * @param {!string} event
		 * @param {!function(this:Aheui, ...?)} callback
		 * @return {Aheui} this object, for chaining
		 */
		on(event, callback) {
			if(!this._callbacks[event]) this._callbacks[event] = []
			this._callbacks[event].push(callback)
			return this
		}
		/**
		 * Register a one-shot callback, which is called once and unregistered, for an event.
		 * Aheui object is bound as `this` when the callback is called
		 * @param {!string} event
		 * @param {!function(this:Aheui, ...?)} callback
		 * @return {Aheui} this object, for chaining
		 */
		once(event, callback) {
			if(!this._callbacks[event]) this._callbacks[event] = []
			var realCallback = function() {
				callback.apply(this, arguments)
				this.off(event, realCallback)
			}
			this._callbacks[event].push(realCallback)
			return this
		}
		/**
		 * Unregister callback(s).
		 * If both `event` and `callback` is given, the callback is unregistered.
		 * If `event` is given, unregisters all callbacks of the event.
		 * If none is given, unregisters all callbacks registered.
		 * @param {!string=} event
		 * @param {!function(this:Aheui, ...?)=} callback
		 * @return {Aheui} this object, for chaining
		 */
		off(event, callback) {
			if(event) {
				if(callback) {
					var index = this._callbacks[event]?
									this._callbacks[event].indexOf(callback)
								:
									-1
					if(index >= 0)
						this._callbacks[event].splice(index, 1)
				} else {
					delete this._callbacks[event]
				}
			} else {
				this._callbacks = {}
			}
			return this
		}
		/**
		 * @protected
		 * Emits an event. Calls all callback functions registered for this event.
		 * @param {!string} event Name of event to fire
		 * @param {...?} args Arguments to pass to callback functions
		 * @return {Aheui} this object, for chaining
		 */
		 emit(event, ...args) {
		 	if(this._callbacks[event]) {
		 		// callbacks may be unregistered within callback, so loop backward
		 		for(var i = this._callbacks[event].length - 1; i >= 0; i--) {
		 			this._callbacks[event][i].apply(this, args)
		 		}
		 	}
			return this
		 }

		 /**
		  * Sets input function returning number, which is called on number input
		  * Aheui object is bound as `this` when the function is called.
		  * @param {!function(this:Aheui):number} inputFunc
		  * @return {function(this:Aheui):number} Old input function
		  */
		 setIntegerInput(inputFunc) {
		 	var old = this._intIn
		 	this._intIn = inputFunc
		 	return old
		 }
		 /**
		  * Sets input function returning character, which is called on character input
		  * Aheui object is bound as `this` when the function is called.
		  * @param {!function(this:Aheui):(string|number)} inputFunc
		  * @return {function(this:Aheui):(string|number)} Old input function
		  */
		 setCharacterInput(inputFunc) {
		 	var old = this._charIn
		 	this._charIn = inputFunc
		 	return old
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
		// benefits code minification, instead of 'undefined' literal
		var undefinedStr = typeof undefined
		if(typeof exports !== undefinedStr) {
			if(typeof module !== undefinedStr && module.exports) {
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
