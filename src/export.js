/**
 * File to register the 'aheui' module to root.
 */

goog.require('aheui');
/** @suppress {checkVars} */
(function register(root) {
	if(typeof exports !== 'undefined') {
		if(typeof module !== 'undefined' && module.exports) {
			exports = module.exports = aheui;
		}
		exports['aheui'] = aheui;
	} else if (typeof define === 'function' && define.amd) {
		define([], function() {
			return aheui;
		});
	} else {
		root['aheui'] = aheui;
	}
})(this);
