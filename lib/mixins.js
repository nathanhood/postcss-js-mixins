const vars = {
	defaultUnit: 'rem'
}

module.exports = {
	mixins: {
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
		 * Clear left, right, or both
		 * 
		 * @param  {string} [value|'both']
		 * @return {[prop, value]}
		 */
		clear(value = 'both') {
			return prop('clear', value);
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

function empty(value) {
	return value === undefined;
}

function unit(value) {
	if (! isUnit(value) && isNumber(value)) {
		value += vars.defaultUnit;
	}

	return value;
}

function prop(prop, value) {
	return { prop, value };
}

function isUnit(value) {
	return /(%|cm|rem|em|ex|in|mm|pc|px|pt|vh|vw|vmin)$/g.test(value);
}

function isNumber(value) {
	return ! isNaN(parseInt(value));
}