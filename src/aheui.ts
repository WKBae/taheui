const cho = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const jung = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const jong = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const jongCount = [0, 2, 4, 4, 2, 5, 5, 3, 5, 7, 9, 9, 7, 9, 9, 8, 4, 4, 6, 2, 4, 1, 3, 4, 3, 4, 4, 3]

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

type Operation = (storage: Storage, argument: number) => boolean

/**
 * Return an operation which just calls the function given.
 * @param operation Operation function to execute
 * @returns Operation
 */
function rawOperation(operation: (storage: Storage, argument: number) => (boolean | void)): Operation {
	return (storage: Storage, argument: number) => operation(storage, argument) ?? true
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

function popOperation<T>(count: number, operation: (...args: number[]) => T, resultHandler: (storage: Storage, argument: T, value: number) => (boolean | void) = pushNumberHandler): Operation {
	// Fast path for frequent count values
	if (count == 1) {
		return function pop1Operate(stack, argument) {
			const one = stack.pop()
			if (one === undefined) {
				return false
			}
			return resultHandler(stack, operation(one), argument) ?? true
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
			return resultHandler(stack, operation(one, two), argument) ?? true
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
			return resultHandler(stack, operation.apply(null, args), argument) ?? true
		}
	}
}

class Cell {
	private readonly _op: (storage: Storage, value: number) => boolean;
	private readonly _dir: number
	private readonly _argument: number

	/**
	 * Builds a cell with the given character
	 * @param char Character representing a cell. If string or number(unicode codepoint) is passed, it will be parsed using Cell.parseChar
	 * @param operations List of the operations per each 'Choseong'
	 */
	constructor(char: string | number | [number, number, number], operations: Operation[]) {
		if (typeof char === 'string' || typeof char === 'number')
			char = Cell.parseChar(char)
		this._op = operations[char[0]]
		this._dir = char[1]
		this._argument = char[2]
	}

	/**
	 * Execute the cell, performs operation execution, direction update, moving the plane.
	 * This is not intended to run outside this library.
	 * @param aheui Script plane to run on
	 */
	_run(aheui: Aheui) {
		aheui._updateDirection(this._dir)

		const success = this._op(aheui.stacks[aheui.currentStack], this._argument)
		if (!success) {
			aheui._updateDirection(19 /* ㅢ, reverse */)
		}

		aheui._followDirection()
	}

	/**
	 * Parse a Korean character to the array of [Choseong(number), Jungseong(number), Jongseong(number)]
	 * Any non-Korean or not-complete characters are treated as "애", a no-op character in Aheui
	 * @param c A character or unicode codepoint to parse
	 * @returns Tuple of [Choseong, Jungseong, Jongseong]
	 */
	static parseChar(c: string | number): [number, number, number] {
		if (typeof c === 'string') c = c.charCodeAt(0)
		if (c < 0xAC00 || c > 0xD7A3) return [11, 1, 0] // default, no-op character
		c -= 0xAC00
		return [c / 28 / 21 | 0, (c / 28 | 0) % 21, c % 28]
	}
}

const NO_OP = () => true
const EMPTY_CELL = new Cell([0, 1, 0], [NO_OP])

type NoArgEventHandler = (this: Aheui) => void
type NumberEventHandler = (this: Aheui, value: number) => void
type CharEventHandler = (this: Aheui, char: string) => void

type AheuiEvents = {
	'start': NoArgEventHandler
	'step': NoArgEventHandler
	'stop': NoArgEventHandler
	'end': NoArgEventHandler
	'reset': NoArgEventHandler
	'integer': NumberEventHandler
	'character': CharEventHandler
}

/**
 * Aheui script interpreter
 */
class Aheui {
	readonly script: string
	plane: Cell[][]
	private _callbacks: { [Event in keyof AheuiEvents]?: AheuiEvents[Event][] }

	private _intIn: (this: Aheui) => number
	private _charIn: (this: Aheui) => (string | number)

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

	/**
	 * Build an Aheui interpreter with the given script string.
	 * @param script The Aheui script
	 */
	constructor(script: string) {
		this.script = script

		this._init()

		const operations: Operation[] = [
			/* ㄱ */ NO_OP,
			/* ㄲ */ NO_OP,
			/* ㄴ */ popOperation(2, (a, b) => a / b | 0),
			/* ㄷ */ popOperation(2, (a, b) => a + b),
			/* ㄸ */ popOperation(2, (a, b) => a * b),
			/* ㄹ */ popOperation(2, (a, b) => a % b),
			/* ㅁ */ popOperation(1, (a) => a,
				(stack, result, argument) => {
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
			/* ㅂ */ rawOperation((stack, argument) => {
				if (argument === 21 /* ㅇ */) {
					stack.push(this._intIn())
				} else if (argument === 27 /* ㅎ */) {
					const char = this._charIn()
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
			/* ㅅ */ rawOperation((stack, argument) => {
				this.currentStack = argument
			}),
			/* ㅆ */ popOperation(1, (a) => a,
				(stack, result, argument) => {
					this.stacks[argument].push(result)
				}),
			/* ㅇ */ NO_OP,
			/* ㅈ */ popOperation(2, (a, b) => a >= b ? 1 : 0),
			/* ㅉ */ NO_OP,
			/* ㅊ */ popOperation(1, (a) => a != 0,
				(stack, result) => {
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
			/* ㅎ */ rawOperation((stack) => {
				this.exitCode = stack.pop() || 0
			})
		]

		const lines = this.script.split(/\r?\n/)
		this.plane = []
		lines.forEach((line, i) => {
			this.plane[i] = []
			for (let j = 0; j < line.length; j++) {
				this.plane[i][j] = new Cell(line.charCodeAt(j), operations)
			}
		})

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
	step() {
		if (this.exitCode !== null) return
		if (!this.running) {
			this.emit('start')
		}
		if (this.plane[this.y] && this.plane[this.y][this.x])
			this.plane[this.y][this.x]._run(this)
		else
			EMPTY_CELL._run(this)
		this.stepCount++
		this.emit('step')
		if (!this.running) {
			if (this.exitCode === null) {
				this.emit('stop')
			} else {
				this.emit('end')
			}
		}
	}

	/**
	 * Start execution from the last stopped position(or the beginning)
	 * @param batchSize Size of the batch, the number of cells to execute per timer tick. 0 to run synchronously.
	 */
	run(batchSize?: number) {
		if (this.running) return
		this.running = true

		this.emit('start')

		if (typeof batchSize === 'number' && batchSize > 0) {
			this._batch(batchSize)
		} else if (batchSize === 0) {
			while (/*this.running &&*/ this.exitCode === null) {
				this.step()
			}
			this.running = false
			this.emit('end')
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
		this._interval = setInterval(() => {
			if (!this.running) return

			for (let i = 0; i < count && this.exitCode === null; i++) {
				this.step()
			}

			if (this.exitCode !== null) {
				this.running = false
				if (this._interval) clearInterval(this._interval)
				this._interval = null
				this.emit('end')
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
	_updateDirection(jung: number) {
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
	_followDirection() {
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
	setIntegerInput(inputFunc: (this: Aheui) => number) {
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
	setCharacterInput(inputFunc: (this: Aheui) => (string | number)) {
		const old = this._charIn
		this._charIn = inputFunc
		return old
	}
}

export default Aheui;
export {cho, jung, jong};
