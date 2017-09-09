'use strict'

const Stack = require('./stack.js')

/**
 * Queue, FIFO data structure storing numbers
 * @extends {Stack}
 */
class Queue {
	constructor() {
		/**
		 * @type {?Array<number|?Array>}
		 * @protected
		 * The head of the linked list. Using the linked list for better performance on pop() operation.
		 * Data in the list is represented as an array, [value, next].
		 */
		this._head = null
		/**
		 * @type {?Array<number|?Array>}
		 * @protected
		 * The tail to push the values beyond.
		 */
		this._tail = null
	}

	/**
	 * @override
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
	 * @override
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
	 * @override
	 */
	every(loop) {
		for(var node = this._head, i = 0; node != null; node = node[1], i++) {
			if(loop(/** @type {number} */ (node[0]), i) === false) break
		}
	}
}

module.exports = Queue
