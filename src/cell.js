'use strict'

module.exports = (function() {
	const Stack = require('./stack.js')
	const Queue = require('./queue.js')

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
			Cell.updateDirection(aheui, this._dir)
			
			var success = this._op(aheui.stacks[aheui.currentStack], this._argument)
			if(success === false) {
				Cell.updateDirection(aheui, 19 /* ㅢ, reverse */)
			}

			Cell.followDirection(aheui)
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


		/**
		 * @private
		 * Update the direction vector according to the given Jungseong directive.
		 * @param {Aheui} aheui Aheui object to update
		 * @param {number} jung 0-based Jungseong of an instruction
		 */
		static updateDirection(aheui, jung) {
			switch(jung) {
			case 0: /* ㅏ */
				aheui.dx = 1
				aheui.dy = 0
				break
			case 4: /* ㅓ */
				aheui.dx = -1
				aheui.dy = 0
				break
			case 13: /* ㅜ */
				aheui.dx = 0
				aheui.dy = 1
				break
			case 8: /* ㅗ */
				aheui.dx = 0
				aheui.dy = -1
				break
			
			case 2: /* ㅑ */
				aheui.dx = 2
				aheui.dy = 0
				break
			case 6: /* ㅕ */
				aheui.dx = -2
				aheui.dy = 0
				break
			case 17: /* ㅠ */
				aheui.dx = 0
				aheui.dy = 2
				break
			case 12: /* ㅛ */
				aheui.dx = 0
				aheui.dy = -2
				break

			case 20: /* ㅣ */
				aheui.dx = -aheui.dx
				break;
			case 18: /* ㅡ */
				aheui.dy = -aheui.dy
				break
			case 19: /* ㅢ */
				aheui.dx = -aheui.dx
				aheui.dy = -aheui.dy
				break
			// default: break
			}
		}

		/**
		 * @private
		 * Moves along the plane by the direction vector.
		 * @param {Aheui} aheui Aheui object to update
		 */
		static followDirection(aheui) {
			aheui.x += aheui.dx
			if(aheui.x < 0) {
				aheui.x = aheui.plane[aheui.y].length - 1
			} else if(aheui.x >= aheui.plane[aheui.y].length && aheui.dx !== 0) {
				aheui.x = 0
			}

			aheui.y += aheui.dy
			if(aheui.y < 0) {
				aheui.y = aheui.plane.length - 1
			} else if(aheui.y >= aheui.plane.length) {
				aheui.y = 0
			}
		}
	}
	return Cell
})()
