const vars = require('./variables');

module.exports = {
	/**
	 * Append default unit to value if value is a unit
	 *
	 * @param {string|number} value
	 * @param {string|number} property
	 * @return {string}
	 */
	unit(value, property) {
		let ignored = ['font-weight', 'opacity', 'content', 'columns'];

		if (ignored.includes(property) || property === false || value === 0 || /\s/.test(value)) {
			return value;
		}

		if (! this.isUnit(value) && this.isNumber(value)) {
			if (property === 'line-height') {
				value += vars.unit.lineHeight;
			} else {
				value += vars.unit.default;
			}
		}

		return value;
	},

	/**
	 * Determine if supplied argument is a number
	 *
	 * @param  {*} value
	 * @return {boolean}
	 */
	isNumber(value) {
		value = parseFloat(value);

		return ! isNaN(value) && isFinite(value);
	},

	/**
	 * Determine if supplied argument includes a unit
	 *
	 * @param  {*} value
	 * @return {boolean}
	 */
	isUnit(value) {
		return /(%|cm|rem|em|ex|in|mm|pc|px|pt|vh|vw|vmin)$/g.test(value);
	}
};