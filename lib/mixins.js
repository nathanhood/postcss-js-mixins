const vars = require('./variables');

module.exports = {
	mixins: {
		/**
		 * Absolute positioning
		 * 
		 * @param  {Array|mixed} [args.top] top
		 * @param  {Array|mixed} [args.right] right
		 * @param  {Array|mixed} [args.bottom] bottom
		 * @param  {Array|mixed} [args.left] left
		 * @return {[prop, value]}
		 */
		absolute(...args) {
			props = [
				prop('position', 'absolute')
			];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args)) {
				props = props.concat(buildSingleProps([
					'top',
					'right',
					'left',
					'bottom'
				], args));
			}

			return props;
		},

		/**
		 * Text align
		 *
		 * @param  {string} [value]
		 * @return {[prop, value]}
		 */
		align(value) {
			return prop('text-align', value);
		},

		/**
		 * A block level element, centerd with margin
		 *
		 * @param  {width} value [description]
		 * @return {[type]}       [description]
		 */
		centeredBlock(...args) {
			let block = this.block(...args);

			block.push(prop('margin', '0 auto'));

			return block;
		},

		/**
		 * Clear left, right, or both
		 *
		 * @param  {string} [value|'both']
		 * @return {[prop, value]}
		 */
		clear(value = 'both') {
			return prop('clear', value);
		},

		/**
		 * Set display
		 *
		 * @param  {string} value
		 * @return {[prop, value]}
		 */
		display(value) {
			return prop('display', value);
		},

		/**
		 * Display block
		 *
		 * @param  {Array} [value]
		 * @return {[prop, value]}
		 */
		block(...args) {
			let props = [];

			props.push(this.display('block'));

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args[0]) && args.length === 1) {
				props.push(prop('width', unit(args[0])));
			} else if (args.length === 2) {
				props.push(prop('height', unit(args[1])));
				props.push(prop('width', unit(args[0])));
			}

			return props;
		},

		/**
		 * Display inline
		 *
		 * @param  {string} [value]
		 * @return {[prop, value]}
		 */
		inline() {
			return this.display('inline');
		},

		/**
		 * Display inline block
		 *
		 * @param  {Array} [args]
		 * @return {Array}
		 */
		inlineBlock(...args) {
			let props = [
					this.display('inline-block')
				];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args)) {
				props.push(prop('width', unit(args[0])));

				if (args[1]) {
					props.push(prop('height', unit(args[1])));
				}
			}

			return props;
		},

		/**
		 * Float left or position left
		 *
		 * @param {string} [value]
		 * @return {[prop, value]}
		 */
		left(value) {
			if (empty(value)) {
				return prop('float', 'left');
			}

			return prop('left', unit(value));
		},

		/**
		 * Show element
		 *
		 * @return {[prop, value]}
		 */
		hidden() {
			return this.visibility('hidden');
		},

		/**
		 * Hide element
		 *
		 * @return {[prop, value]}
		 */
		hide() {
			return this.display('none');
		},

		/**
		 * Margin
		 *
		 * @param  {string} value
		 * @param  {string} direction
		 * @return {[prop, value]}
		 */
		margin(value, direction = false) {
			if (direction) {
				return prop(`margin-${direction}`, unit(value));
			} else {
				return prop('margin', unit(value));
			}
		},

		/**
		 * Float right or position right
		 *
		 * @param {string} [value]
		 * @return {[prop, value]}
		 */
		right(value) {
			if (empty(value)) {
				return prop('float', 'right');
			}

			return prop('right', unit(value));
		},

		/**
		 * Show element
		 *
		 * @return {[prop, value]}
		 */
		show() {
			return this.display('inherit');
		},

		/**
		 * Add a specified margin bottom
		 *
		 * @return {[prop, value]}
		 */
		spaced(value = 2) {
			return this.margin(unit(value), 'bottom');
		},

		/**
		 * Vertical align
		 *
		 * @param  {string} [value]
		 * @return {[prop, value]}
		 */
		vAlign(value) {
			return prop('vertical-align', unit(value));
		},

		/**
		 * Show element
		 *
		 * @param  {string} [value]
		 * @return {[prop, value]}
		 */
		visible() {
			return this.visibility('visible');
		},

		/**
		 * Visibility
		 *
		 * @param  {string} [value]
		 * @return {[prop, value]}
		 */
		visibility(value) {
			return prop('visibility', value);
		}
	}
}

/**
 * Determine whether supplied arguments represent multiple variable declarations
 *
 * @param  {Array} args
 * @return {boolean}
 */
function isObject(obj) {
	return type(obj) === 'object';
}

// TODO: This is replication of Wee's $type. Can we use that instead once integrated?
function type(obj) {
	return obj === undefined ? 'undefined' :
		Object.prototype.toString.call(obj)
			.replace(/^\[object (.+)]$/, '$1')
			.toLowerCase();
}

/**
 * Build properties from array
 *
 * @param  {Array} properties
 * @return {Array}
 */
function buildProps(properties) {
	let props = [];

	for (var property in properties) {
		props.push(
			prop(property, unit(properties[property]))
		);
	}

	return props;
}

/**
 * Determine if value is empty
 *
 * @param  {mixed} value
 * @return {boolean}
 */
function empty(value) {
	if (Array.isArray(value)) {
		// If first item in array is undefined, we assume there are no parameters
		// This happens as a result of using the rest operator in a mixin
		return value.length === 0 || value[0] === undefined;
	}

	return value === undefined;
}

/**
 * Append default unit to value if value is a unit
 *
 * @param  {string} value
 * @return {string}
 */
function unit(value) {
	if (! isUnit(value) && isNumber(value)) {
		value += vars.defaultUnit;
	}

	return value;
}

/**
 * Format property and value into correct syntax for parser to process
 *
 * @param  {string} prop - css property
 * @param  {string} value
 * @return {Object}
 */
function prop(prop, value) {
	return { prop, value };
}

/**
 * Determine if supplied argument includes a unit
 *
 * @param  {string}
 * @return {boolean}
 */
function isUnit(value) {
	return /(%|cm|rem|em|ex|in|mm|pc|px|pt|vh|vw|vmin)$/g.test(value);
}

/**
 * Determine if supplied argument is a number
 *
 * @param  {mixed}
 * @return {boolean}
 */
function isNumber(value) {
	return ! isNaN(parseInt(value)) && ! /[a-z]+/g.test(value);
}