'use strict'

goog.provide('aheui')

aheui = (function() {
	const Stack = require('./stack.js')
	const Queue = require('./queue.js')

	const Cell = require('./cell.js')

	const operation = require('./operation.js')

	const rawOperation = operation.rawOperation,
		popOperation = operation.popOperation

	/** @type {!function(Stack, number)} */
	const NO_OP = rawOperation(() => {})

	const EMPTY_CELL = new Cell([0, 1, 0], [NO_OP])

 	/** @type {!Array<!String>} */
	const cCho = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ]
	/** @type {!Array<!String>} */
	const cJung = [ 'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ' ]
	/** @type {!Array<!String>} */
	const cJong = [ '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ]
	/** @type {!Array<!number>} */
	const jongCount = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3]
	

	/**
	 * Aheui script interpreter
	 */
	class Aheui {
		/**
		 * Build an Aheui interpreter with the given script string.
		 * @param {string} script The Aheui script
		 */
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
		 * Register a callback for an event.
		 * Aheui object is bound as `this` when the callback is called
		 * @param {!string} events Space-separated list of events to subscribe
		 * @param {!function(this:Aheui, ...?)} callback
		 * @return {Aheui} this object, for chaining
		 */
		on(events, callback) {
			var eventSplit = events.split(' ')
			eventSplit.forEach((event) => {
				if(!this._callbacks[event]) this._callbacks[event] = []

				this._callbacks[event].push(callback)
			})
			return this
		}
		/**
		 * Register a one-shot callback, which is called once and unregistered, for an event.
		 * Aheui object is bound as `this` when the callback is called
		 * @param {!string} events Space-separated list of events to subscribe
		 * @param {!function(this:Aheui, ...?)} callback
		 * @return {Aheui} this object, for chaining
		 */
		once(events, callback) {
			var eventSplit = events.split(' ')

			var realCallback = function() {
				callback.apply(this, arguments)

				eventSplit.forEach((event) => this.off(event, realCallback))
			}

			eventSplit.forEach((event) => {
				if(!this._callbacks[event]) this._callbacks[event] = []

				this._callbacks[event].push(realCallback)
			})
			return this
		}
		/**
		 * Unregister callback(s).
		 * If both `event` and `callback` is given, the callback is unregistered.
		 * If `event` is given, unregisters all callbacks of the event.
		 * If none is given, unregisters all callbacks registered.
		 * @param {!string=} events Space-separated list of events to unsubscribe
		 * @param {!function(this:Aheui, ...?)=} callback
		 * @return {Aheui} this object, for chaining
		 */
		off(events, callback) {
			if(events) {
				var eventSplit = events.split(' ')
				eventSplit.forEach((event) => {
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
				})
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

	return {
		'Aheui': Aheui,

		'cho': cCho,
		'jung': cJung,
		'jong': cJong
	}
})()
