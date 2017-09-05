'use strict'

module.exports = (function() {
	const Stack = require('./stack.js')
	const Queue = require('./queue.js')

	/**
	 * Return an operation which just calls the function given.
	 * @param {!(function((Stack|Queue), number)|function((Stack|Queue), number):boolean)} operation Operation function to execute
	 * @return {(function((Stack|Queue), number)|function((Stack|Queue), number):boolean)} operation
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


	return {
		'rawOperation': rawOperation,
		'popOperation': popOperation,
	}
})()
