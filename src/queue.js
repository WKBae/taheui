'use strict'

const Stack = require('./stack.js');

/**
 * Queue, FIFO data structure storing numbers
 * @extends {Stack}
 */
class Queue {
	constructor() {
		/**
		 * @type {Array<number>}
		 * @protected
		 * The ring queue array.
		 */
		this._array = [];
		/**
		 * @type {number}
		 * @protected
		 * Size of the ring queue. Although the arrays in JS are dynamic, we use fixed size array for better performance & space.
		 */
		this._size = 4;
		/**
		 * @type {number}
		 * @protected
		 * The head position of the ring queue.
		 */
		this._head = 0;
		/**
		 * @type {number}
		 * @protected
		 * The tail position, the location to insert, of the ring queue.
		 */
		this._tail = 0;
	}

	/**
	 * Double the size of array.
	 */
	_expand() {
		var sliced = this._array.slice(this._head);
		
		this._size *= 2;
		this._array.length = this._size - sliced.length;
		this._array = this._array.concat(sliced);

		var newHead = this._size - sliced.length;
		if(this._tail >= this._head) {
			this._tail = (newHead + (this._tail - this._head)) % this._size;
		}
		this._head = newHead;
	}

	/**
	 * @override
	 * Pushes a value into this queue, at last.
	 * @param {number} value The value to put on this queue
	 */
	push(value) {
		var newTail = (this._tail + 1) % this._size;
		if(newTail == this._head) {
			this._expand();
			newTail = (this._tail + 1) % this._size;
		}
		this._array[this._tail] = value;
		this._tail = newTail;
	}
	/**
	 * @override
	 * Pulls a number from the queue. Returns `undefined` if the queue is empty
	 * @return {number|undefined} Pulled value
	 */
	pop() {
		if(this._head == this._tail) {
			return undefined;
		} else {
			var val = this._array[this._head];
			this._head = (this._head + 1) % this._size;
			// TODO reduce array size
			return val;
		}
	}
	/**
	 * Appends the value to the front of the queue, unlike push() which adds to the last.
	 * @param {number} value
	 */
	append(value) {
		var newHead = (this._head - 1 + this._size) % this._size;
		if(newHead == this._tail) {
			this._expand();
			newHead = (this._head - 1 + this._size) % this._size;
		}
		this._head = newHead;
		this._array[newHead] = value;
	}

	/**
	 * @override
	 * Loops for each element of this queue. Index orders from the front to back(first-in first-out)
	 * @param {!function(number, number):?boolean} loop Loop function with parameters (element, index), optionally returns false to break, called for every elements.
	 */
	every(loop) {
		for(var idx = this._head, i = 0; idx != this._tail; idx = (idx + 1) % this._size, i++) {
			if(loop(this._array[idx], i) === false) break;
		}
	}
}

module.exports = Queue
