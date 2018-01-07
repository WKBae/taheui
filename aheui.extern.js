/**
 * Extern file for AheuiJS
 * @externs
 */

/**
 * @constructor
 * @param {string} script
 * @return {undefined}
 */
function Aheui(script) {};

/** @param {number=} batchSize */
Aheui.prototype.run = function(batchSize) {};
Aheui.prototype.stop;
Aheui.prototype.reset;
Aheui.prototype.step;
/** @param {number} dir */
Aheui.prototype.updateDirection = function(dir) {};
Aheui.prototype.proceedPlane;

/**
 * @param {!string} events
 * @param {!function(this:Aheui, ...?)} callback
 * @return {Aheui}
 */
Aheui.prototype.on = function(events, callback) {};
/**
 * @param {!string} events
 * @param {!function(this:Aheui, ...?)} callback
 * @return {Aheui}
 */
Aheui.prototype.once = function(events, callback) {};
/**
 * @param {!string=} events
 * @param {!function(this:Aheui, ...?)=} callback
 * @return {Aheui}
 */
Aheui.prototype.off = function(events, callback) {};
/**
 * @param {!function(this:Aheui):number} inputFunc
 * @return {function(this:Aheui):number}
 */
Aheui.prototype.setIntegerInput = function(inputFunc) {};
/**
 * @param {!function(this:Aheui):(string|number)} inputFunc
 * @return {function(this:Aheui):(string|number)}
 */
Aheui.prototype.setCharacterInput = function(inputFunc) {};


/**
 * @constructor
 * See `src/stack.js`, `src/queue.js`
 */
function Stack() {};
Stack.prototype.push;
Stack.prototype.pop;
Stack.prototype.every;


/**
 * @constructor
 * See `src/cell.js`
 * @param {string|number|!Array<number>} char
 * @param {!Array<function(Stack, number)>} operations
 * @param {!Array<number>} directions
 */
function Cell(char, operations, directions) {};
Cell.prototype.run;


/** @type {string} */
Aheui.prototype.script;
/** @type {Array<Array<Cell>>} */
Aheui.prototype.plane;
/** @type {Array<Stack>} */
Aheui.prototype.stacks;
/** @type {number} */
Aheui.prototype.currentStack;
/** @type {number|null} */
Aheui.prototype.exitCode;
/** @type {number} */
Aheui.prototype.stepCount;
/** @type {boolean} */
Aheui.prototype.running;
/** @type {number} */
Aheui.prototype.x;
/** @type {number} */
Aheui.prototype.y;
/** @type {number} */
Aheui.prototype.dx;
/** @type {number} */
Aheui.prototype.dy;


function aheui() {}

/** @type {Aheui} */
aheui.Aheui;

/** @type {!Array<!string>} */
aheui.cho;
/** @type {!Array<!string>} */
aheui.jung;
/** @type {!Array<!string>} */
aheui.jong;
