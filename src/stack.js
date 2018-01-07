'use strict'

/**
 * Single stack storing numbers.
 */
class Stack {
	constructor() {
		/**
		 * @type {!Array<number>}
		 * @protected
		 */
		this._items = [];
	}

	/**
	 * Push a number into the stack.
	 * @param {number} value
	 */
	push(value) {
		this._items.push(value);
	}
	/**
	 * Pop a number from the stack. Returns `undefined` if the stack is empty.
	 * @return {number|undefined} Popped value
	 */
	pop() {
		var res = this._items.pop();
		/*if(res === undefined) {
			// throw new StackEmptyException()
			return undefined
		}*/
		return res;
	}

	/**
	 * Loops for each element of this stack. Index orders from the bottom(first-in, last-out) to top(last-in, first-out)
	 * @param {!function(number, number):?boolean} loop Loop function with parameters (element, index), optionally returns false to break, called for every elements.
	 */
	every(loop) {
		for(var i = 0; i < this._items.length; i++) {
			if(loop(this._items[i], i) === false) break;
		}
	}
}

module.exports = Stack;
