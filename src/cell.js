'use strict'

const Stack = require('./stack.js');
const Queue = require('./queue.js');

/**
 * Object representing a single cell in the Aheui script plane.
 */
class Cell {
	/**
	 * Builds a cell with the given character
	 * @param {string|number|!Array<number>} char Character, parsed or not, representing a cell
	 * @param {!Array<function(Stack, number)>} operations List of the operations per each 'Choseong'
	 * @param {!Array<number>} directions Direction ints with bit masks for each 'Jungseong'
	 */
	constructor(char, operations, directions) {
		if(typeof char === 'string' || typeof char === 'number') {
			char = Cell.parseChar(/** @type {string|number} */ (char));
		}
		/** @private {function(Stack, number)} */
		this._op = operations[char[0]];
		/** @private {number} */
		this._dir = directions[char[1]];
		/** @private {number} */
		this._argument = char[2];
	}

	/** Execute the cell, performs operation execution, direction update, moving the plane
	 * @param {!Aheui} aheui
	 */
	run(aheui) {
		aheui.updateDirection(this._dir);
		
		var success = this._op(aheui.stacks[aheui.currentStack], this._argument);
		if(success === false) {
			const DIR_KEEP = 0;
			const DIR_X = 0b100, DIR_Y = 0b010;
			const DIR_MINUS = 0b10000;
			aheui.updateDirection(DIR_MINUS | DIR_KEEP | DIR_X | DIR_Y); // reverse
		}

		aheui.proceedPlane();
	}

	/**
	 * Parse a Korean character to the array of [Choseong(number), Jungseong(number), Jongseong(number)]
	 * Any non-Korean or not-complete characters are treated as "애", a no-op character in Aheui
	 * @param {string|number} c A string(only the first one is used) or a number representing the character code
	 * @return {!Array<number>}
	 */
	static parseChar(c) {
		if(typeof c === 'string') c = c.charCodeAt(0);
		if(c < 0xAC00 || c > 0xD7A3) return [11, 1, 0]; // default, no-op character
		c -= 0xAC00;
		return [c/28/21 | 0, (c/28 | 0) % 21, c % 28];
	}
}

module.exports = Cell;
