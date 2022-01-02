const cho = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const
const jung = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'] as const
const jong = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const
const jongCount = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3] as const

interface Storage {
	push(value: number): void

	pop(): number | undefined

	append(value: number): void

	every(loop: (element: number, index: number) => (boolean | void)): void
}

/**
 * Single stack storing numbers.
 */
class Stack implements Storage {
	private readonly _items: number[] = []

	/**
	 * Push a number into the stack.
	 */
	push(value: number) {
		this._items.push(value)
	}

	/**
	 * Pop a number from the stack. Returns `undefined` if the stack is empty.
	 * @returns Popped value
	 */
	pop(): number | undefined {
		return this._items.pop()
	}

	/**
	 * Same as push(number)
	 */
	append(value: number) {
		this.push(value)
	}

	/**
	 * Loops for each element of this stack. Index orders from the bottom(first-in, last-out) to top(last-in, first-out)
	 * @param loop Loop function with parameters (element, index), optionally returns false to break, called for every elements.
	 */
	every(loop: (element: number, index: number) => (boolean | void)) {
		for (let i = 0; i < this._items.length; i++) {
			if (loop(this._items[i], i) === false) break
		}
	}
}

type QueueNode = [number, QueueNode | null];

/**
 * Queue, FIFO data structure storing numbers
 */
class Queue implements Storage {
	/**
	 * The head of the linked list. Using the linked list for better performance on pop() operation.
	 * Data in the list is represented as an array, [value, next].
	 */
	private _head: QueueNode | null = null;

	/**
	 * The tail to push the values beyond.
	 */
	private _tail: QueueNode | null = null

	/**
	 * Push a number into the stack.
	 */
	push(value: number) {
		const node: QueueNode = [value, null]
		if (this._tail) {
			this._tail[1] = node
			this._tail = node
		} else {
			this._tail = this._head = node
		}
	}

	/**
	 * Pulls a number from the queue. Returns `undefined` if the queue is empty
	 * @return Pulled value
	 */
	pop(): number | undefined {
		if (this._head) {
			const val = this._head[0]
			this._head = this._head[1]
			if (!this._head) this._tail = null
			return val
		} else {
			return undefined
		}
	}

	/**
	 * Appends the value to the front of the queue, unlike push() which adds to the last.
	 */
	append(value: number) {
		this._head = [value, this._head]
	}

	/**
	 * Loops for each element of this queue. Index orders from the front(first-in, first-out) to back(last-in, last-out)
	 * @param loop Loop function with parameters (element, index), optionally returns false to break, called for every elements.
	 */
	every(loop: (element: number, index: number) => (boolean | void)) {
		for (let node = this._head, i = 0; node != null; node = node[1], i++) {
			if (loop(/** @type {number} */ (node[0]), i) === false) break
		}
	}
}

type Operation = (this: Aheui, storage: Storage, argument: number) => Promise<boolean> | boolean

/**
 * Simple Operation wrapper allowing void returns.
 * @param operation Operation function to execute
 * @returns Operation
 */
function rawOperation(operation: (this: Aheui, storage: Storage, argument: number) => (boolean | void)): Operation {
	return function(this: Aheui, storage: Storage, argument: number) {
		return operation.call(this, storage, argument) ?? true
	}
}

/**
 * Operation wrapper with Promise(async) support allowing void returns.
 * @param operation Operation function to execute
 * @returns Operation
 */
function asyncOperation(operation: (this: Aheui, storage: Storage, argument: number) => (Promise<boolean | void> | boolean | void)): Operation {
	return function(this: Aheui, storage: Storage, argument: number) {
		const result = operation.call(this, storage, argument)
		if (typeof result === 'object') {
			return result.then(value => value ?? true)
		}
		return result ?? true
	}
}

/**
 * Push result, if the type is number, into the storage.
 * @param storage Target storage to push into.
 * @param result Value of unknown type; push into storage if it is a number.
 */
function pushNumberHandler(storage: Storage, result: unknown) {
	if (typeof result === 'number') {
		storage.push(result)
	}
}

// N-length tuple of type T, taken from https://stackoverflow.com/a/52490977
type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

/**
 * Utility function to build an operation which pops certain amount of values from storage, process, and push back the result into the storage.
 * @param count Number of items to pop from storage.
 * @param operation Manipulator function which takes `count` number of arguments and returns a number to push into storage.
 */
function popOperation<N extends number>(count: N, operation: (...args: Tuple<number, N>) => number): Operation
/**
 * Utility function to build an operation which pops certain amount of values from storage, process, and handle the result.
 * @param count Number of items to pop from storage.
 * @param operation Manipulator function which takes `count` number of arguments and returns a number to pass to resultHandler.
 * @param resultHandler Handle the operation result(=>argument) along with character's parameter(Jongseong;=>value). Return true (or void) to continue in forward direction, or false to proceed in reverse direction.
 */
function popOperation<T, N extends number>(count: N, operation: (...args: Tuple<number, N>) => T, resultHandler: (storage: Storage, argument: T, value: number) => (boolean | void)): Operation

function popOperation<T>(count: number, operation: (...args: number[]) => T, resultHandler: (this: Aheui, storage: Storage, argument: T, value: number) => (boolean | void) = pushNumberHandler): Operation {
	// Fast path for frequent count values
	if (count == 1) {
		return function pop1Operate(stack, argument) {
			const one = stack.pop()
			if (one === undefined) {
				return false
			}
			return resultHandler.call(this, stack, operation(one), argument) ?? true
		}
	} else if (count == 2) {
		return function pop2Operate(stack, argument) {
			const two = stack.pop()
			if (two === undefined) {
				return false
			}
			const one = stack.pop()
			if (one === undefined) {
				stack.append(two)
				return false
			}
			return resultHandler.call(this, stack, operation(one, two), argument) ?? true
		}
	} else {
		return function popOperate(stack, argument) {
			const args: number[] = []
			for (let i = count - 1; i >= 0; i--) {
				const value = stack.pop()
				if (value === undefined) {
					for (i++; i < count; i++) {
						stack.append(args[i])
					}
					return false
				}
				args[i] = value
			}
			return resultHandler.call(this, stack, operation.apply(null, args), argument) ?? true
		}
	}
}

/**
 * Tuple of [Choseong, Jungseong, Jongseong] indices, or [Operation, Direction, Argument].
 * Can be mapped into character with exported variables `cho`, `jung`, `jong`.
 */
type Syllable = [operation: number, direction: number, argument: number]

/**
 * Parse a Hangul character into Syllable tuple.
 * If the given character is not a Hangul syllable, null is returned.
 * @param c A character or unicode codepoint to parse
 * @returns Tuple of [Choseong, Jungseong, Jongseong], or `null` if not a full Hangul syllable
 */
function parseChar(c: string | number): Syllable | null {
	if (typeof c === 'string') c = c.charCodeAt(0)
	if (c < 0xAC00 || c > 0xD7A3) return null
	c -= 0xAC00
	return [c / 28 / 21 | 0, (c / 28 | 0) % 21, c % 28]
}

const NO_OP = () => true

type NoArgEventHandler = (this: Aheui) => void
type NumberEventHandler = (this: Aheui, value: number) => void
type CharEventHandler = (this: Aheui, char: string) => void

type AheuiEvents = {
	'start': NoArgEventHandler
	'step': NoArgEventHandler
	'stop': NoArgEventHandler
	'end': NumberEventHandler
	'reset': NoArgEventHandler
	'integer': NumberEventHandler
	'character': CharEventHandler
}

/**
 * Aheui script interpreter
 */
class Aheui {
	/**
	 * Original script text
	 */
	readonly script: string
	/**
	 * Parsed `script` in [y][x] order. null if the character is not a Hangul syllable.
	 */
	readonly plane: readonly (readonly (Syllable | null)[])[]
	private _callbacks: { [Event in keyof AheuiEvents]?: AheuiEvents[Event][] }

	private _intIn: (this: Aheui) => number | Promise<number>
	private _charIn: (this: Aheui) => string | number | Promise<string | number>

	stacks: Storage[] = []

	currentStack: number = 0
	exitCode: number | null = null
	stepCount: number = 0
	running = false
	private _interval: ReturnType<typeof setTimeout> | null = null

	x: number = 0
	y: number = 0

	dx: number = 0
	dy: number = 1

	private static readonly _operations: readonly Operation[] = [
		/* ㄱ */ NO_OP,
		/* ㄲ */ NO_OP,
		/* ㄴ */ popOperation(2, (a, b) => a / b | 0),
		/* ㄷ */ popOperation(2, (a, b) => a + b),
		/* ㄸ */ popOperation(2, (a, b) => a * b),
		/* ㄹ */ popOperation(2, (a, b) => a % b),
		/* ㅁ */ popOperation(1, (a) => a,
			function(this: Aheui, stack, result, argument) {
				if (argument === 21 /* ㅇ */) {
					this.emit('integer', result)
				} else if (argument === 27 /* ㅎ */) {
					let char
					if (result <= 0xFFFF || result > 0x10FFFF) {
						char = String.fromCharCode(result)
					} else { // build surrogate pair
						result -= 0x10000
						char = String.fromCharCode((result >> 10) + 0xD800, (result % 0x400) + 0xDC00)
					}
					this.emit('character', char)
				}
				return true
			}),
		/* ㅂ */ asyncOperation(function(this: Aheui, stack, argument) {
			// Minimize use of async/await, which always wrap function in Promise, for performance concern
			if (argument === 21 /* ㅇ */) {
				const num = this._intIn();
				if (typeof num === 'object') {
					return num.then((value) => {
						stack.push(value)
					})
				}
				stack.push(num)
			} else if (argument === 27 /* ㅎ */) {
				const char = this._charIn()
				if (typeof char === 'object') {
					return char.then((value) => {
						stack.push(typeof value === 'string' ? value.charCodeAt(0) : value)
					})
				}
				stack.push(typeof char === 'string' ? char.charCodeAt(0) : char)
			} else {
				stack.push(jongCount[argument])
			}
		}),
		/* ㅃ */ popOperation(1, (a) => a,
			(stack, a) => {
				if (stack.append) {
					stack.append(a)
					stack.append(a)
				} else {
					stack.push(a)
					stack.push(a)
				}
			}),
		/* ㅅ */ rawOperation(function(this: Aheui, stack, argument) {
			this.currentStack = argument
		}),
		/* ㅆ */ popOperation(1, (a) => a,
			function(this: Aheui, stack, result, argument) {
				this.stacks[argument].push(result)
			}),
		/* ㅇ */ NO_OP,
		/* ㅈ */ popOperation(2, (a, b) => a >= b ? 1 : 0),
		/* ㅉ */ NO_OP,
		/* ㅊ */ popOperation(1, (a) => a != 0,
			function(this: Aheui, stack, result) {
				if (!result) {
					this.dx = -this.dx
					this.dy = -this.dy
				}
			}),
		/* ㅋ */ NO_OP,
		/* ㅌ */ popOperation(2, (a, b) => a - b),
		/* ㅍ */ popOperation(2, (a, b) => [b, a],
			(stack, [b, a]) => {
				stack.append(b)
				stack.append(a)
			}),
		/* ㅎ */ rawOperation(function(this: Aheui, stack) {
			this.exitCode = stack.pop() || 0
		})
	]

	/**
	 * Build an Aheui interpreter with the given script string.
	 * @param script The Aheui script
	 */
	constructor(script: string) {
		this.script = script

		this._init()

		const lines = this.script.split(/\r?\n/)
		const plane: (Syllable | null)[][] = []
		lines.forEach((line, i) => {
			plane[i] = []
			for (let j = 0; j < line.length; j++) {
				plane[i][j] = parseChar(line.charCodeAt(j))
			}
		})
		this.plane = plane;

		this._callbacks = {}

		// TODO use callbacks instead of return value
		this._intIn = () => -1
		this._charIn = () => -1
	}

	/**
	 * Initializes(clears) the local variables.
	 */
	private _init() {
		this.stacks = []
		for (let i = 0; i < jong.length; i++) {
			if (i == 21 /* 'ㅇ' */) this.stacks[i] = new Queue()
			else this.stacks[i] = new Stack()
		}

		this.currentStack = 0
		this.exitCode = null
		this.stepCount = 0
		this.running = false
		this._interval = null

		this.x = 0
		this.y = 0

		this.dx = 0
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
	step(): void | Promise<void> {
		if (this.exitCode !== null) return
		if (!this.running) {
			this.emit('start')
		}

		const cell = this.plane[this.y]?.[this.x]
		if (cell) {
			this._updateDirection(cell[1])
			let success = Aheui._operations[cell[0]].call(this, this.stacks[this.currentStack], cell[2])
			if (typeof success === 'object') {
				return success.then((asyncSuccess) => {
					if (!asyncSuccess) {
						this._updateDirection(19 /* ㅢ, reverse */)
					}
					this._followDirection()

					this.stepCount++
					this.emit('step')
					if (!this.running) {
						if (this.exitCode === null) {
							this.emit('stop')
						} else {
							this.emit('end', this.exitCode)
						}
					}
				})
			}
			if (!success) {
				this._updateDirection(19 /* ㅢ, reverse */)
			}
		}
		this._followDirection()

		this.stepCount++
		this.emit('step')
		if (!this.running) {
			if (this.exitCode === null) {
				this.emit('stop')
			} else {
				this.emit('end', this.exitCode)
			}
		}
	}

	/**
	 * Start execution from the last stopped position(or the beginning)
	 * @param batchSize Size of the batch, the number of cells to execute per timer tick. 0 to run synchronously.
	 */
	async run(batchSize?: number) {
		if (this.running) return
		this.running = true

		this.emit('start')

		if (typeof batchSize === 'number' && batchSize > 0) {
			this._batch(batchSize)
		} else if (batchSize === 0) {
			while (this.running && this.exitCode === null) {
				const ret = this.step()
				if (typeof ret === 'object') await ret
			}
			if (this.running) {
				this.running = false
				this.emit('end', this.exitCode!)
			}
		} else {
			this._batch(10000)
		}
	}

	/**
	 * Setup batches with the given count
	 * @param count Number of cell runs in a batch
	 */
	private _batch(count: number) {
		if (this.running && this._interval) clearInterval(this._interval)
		this._interval = setInterval(async () => {
			if (!this.running) return

			for (let i = 0; i < count && this.exitCode === null; i++) {
				const ret = this.step()
				if (typeof ret === 'object') await ret
			}

			if (this.exitCode !== null) {
				this.running = false
				if (this._interval) clearInterval(this._interval)
				this._interval = null
				this.emit('end', this.exitCode)
			}
		}, 0)
	}

	/**
	 * Stop the running script.
	 * Note: It cannot be stopped if a script is running synchronously.
	 */
	stop() {
		if (this.running) {
			if (this._interval) clearInterval(this._interval)
			this.running = false
			this.emit('stop')
		}
	}

	/**
	 * Update the direction vector according to the given Jungseong directive.
	 * @param jung 0-based Jungseong of an instruction
	 */
	private _updateDirection(jung: number) {
		switch (jung) {
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
	 * Moves along the plane by the direction vector.
	 */
	private _followDirection() {
		this.x += this.dx
		if (this.x < 0) {
			this.x = this.plane[this.y].length - 1
		} else if (this.x >= this.plane[this.y].length && this.dx !== 0) {
			this.x = 0
		}

		this.y += this.dy
		if (this.y < 0) {
			this.y = this.plane.length - 1
		} else if (this.y >= this.plane.length) {
			this.y = 0
		}
	}

	/**
	 * Register a callback for an event.
	 * @param event Name of event
	 * @param callback Function to run if the event has occured
	 * @returns `this` for chaining
	 */
	on<Event extends keyof AheuiEvents>(event: Event, callback: AheuiEvents[Event]): Aheui {
		if (!this._callbacks[event]) {
			this._callbacks[event] = []
		}

		this._callbacks[event]!.push(callback as any)
		return this
	}

	/**
	 * Unregister all callbacks registered.
	 * @returns `this` for chaining
	 */
	off<Event extends keyof AheuiEvents>(): Aheui
	/**
	 * Unregister all callbacks registered to the `event`.
	 * @param event Event name to unregister all callbacks.
	 * @returns `this` for chaining
	 */
	off<Event extends keyof AheuiEvents>(event: Event): Aheui
	/**
	 * Unregister the given `callback` function from the `event`.
	 * @param event Event name to unregister the callback.
	 * @param callback Callback function to unregister.
	 * @returns `this` for chaining
	 */
	off<Event extends keyof AheuiEvents>(event: Event, callback: AheuiEvents[Event]): Aheui
	off<Event extends keyof AheuiEvents>(event?: Event, callback?: AheuiEvents[Event]): Aheui {
		if (event) {
			if (callback) {
				const callbacks = this._callbacks[event];
				if (callbacks) {
					this._callbacks[event] = (callbacks! as any[]).filter((cb) => cb !== callback);
				}
			} else {
				delete this._callbacks[event]
			}
		} else {
			this._callbacks = {}
		}
		return this
	}

	/**
	 * Emits an event. Calls all callback functions registered for this event.
	 * @param event Name of event to fire
	 * @param args Arguments to pass to callback functions
	 * @returns `this` for chaining
	 */
	private emit<Event extends keyof AheuiEvents>(event: Event, ...args: Parameters<AheuiEvents[Event]>) {
		let listeners = this._callbacks[event];
		if (listeners) {
			// callbacks may unregister themselves within callback, so loop backward
			for (let i = listeners.length - 1; i >= 0; i--) {
				// @ts-ignore
				listeners[i].apply(this, args)
			}
		}
		return this
	}

	/**
	 * Sets input function returning number, which is called on number input
	 * Aheui object is bound as `this` when the function is called.
	 * @param inputFunc Function returning integer
	 * @returns Old integer input function
	 */
	setIntegerInput(inputFunc: (this: Aheui) => number | Promise<number>) {
		const old = this._intIn
		this._intIn = inputFunc
		return old
	}

	/**
	 * Sets input function returning character, which is called on character input
	 * Aheui object is bound as `this` when the function is called.
	 * @param inputFunc Function returning a character, or a unicode codepoint
	 * @returns Old character input function
	 */
	setCharacterInput(inputFunc: (this: Aheui) => string | number | Promise<string | number>) {
		const old = this._charIn
		this._charIn = inputFunc
		return old
	}
}

export default Aheui;
export {
	Aheui,
	cho,
	jung,
	jong,
};
