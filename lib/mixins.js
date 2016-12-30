const vars = {
	defaultUnit: 'rem'
}

module.exports = {
	mixins: {
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
		 * Display block
		 * 
		 * @param  {Array} [value]
		 * @return {[prop, value]}
		 */
		block(...args) {
			let props = [];

			props.push(prop('display', 'block'));

			if (multiVar(args)) {
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
			return prop('display', 'inline');
		},

		/**
		 * Display inline
		 * 
		 * @param  {string|Object} [value]
		 * @return {[prop, value]}
		 */
		inlineBlock(...args) {
			let props = [];

			props.push(prop('display', 'inline-block'));

			if (multiVar(args)) {
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
		 * Vertical align
		 * 
		 * @param  {string} [value]
		 * @return {[prop, value]}
		 */
		vAlign(value) {
			return prop('vertical-align', unit(value));
		}
	}
}

/**
 * Determine whether supplied arguments represent multiple variable declarations
 * 
 * @param  {Array} args 
 * @return {boolean}
 */
function multiVar(args) {
	// TODO: make sure this is the best way to do this
	return args.length && typeof args[0] == 'object';
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
	return ! isNaN(parseInt(value));
}