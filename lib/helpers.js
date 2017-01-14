let units = {
	default: 'rem',
	lineHeight: 'em'
};

function setDefaultUnits(overrides) {
	units = Object.assign(units, overrides);
}

/**
 * Calculate opacity
 *
 * @param  {string|int} opacity
 * @return {number}
 */
function calcOpacity(opacity) {
	if (isPercentage(opacity)) {
		opacity = opacity.replace('%', '') / 100;
	} else if (opacity > 1) {
		opacity = opacity / 100;
	}

	return opacity;
}

/**
 * Convert hex values to RGBa.  Can accept both three and
 * size letter hex.
 *
 * @param  {string}  color
 * @param  {string|boolean} opacity
 * @return {string}
 */
function hexToRgba(color, opacity = false) {
	color = color.replace('#', '');

	if (opacity !== false) {
		opacity = calcOpacity(opacity);
	}

	if (color.length === 3) {
		color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
	}

	let r = parseInt(color.substring(0,2), 16),
		g = parseInt(color.substring(2,4), 16),
		b = parseInt(color.substring(4,6), 16);

	if (opacity) {
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}

	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Determine if supplied argument is a color (hex, hsl(a) rgb(a))
 *
 * @param  {string}  value
 * @return {boolean}
 */
function isColor(value) {
	return /(#[\d\w]+|\w+\((?:\d+%?(?:,\s)*){3}(?:\d*\.?\d+)?\))/gi.test(value);
}

/**
 * Determine if value is empty
 *
 * @param  {*} value
 * @return {boolean}
 */
function isEmpty(value) {
	if (Array.isArray(value)) {
		// If first item in array is undefined, we assume there are no parameters
		// This happens as a result of using the rest operator in a mixin
		return value.length === 0 || value[0] === undefined;
	}

	return value === undefined;
}

/**
 * Determine if supplied argument is a number
 *
 * @param  {*} value
 * @return {boolean}
 */
function isNumber(value) {
	value = parseFloat(value);

	return ! isNaN(value) && isFinite(value);
}

/**
 * Determine whether supplied arguments represent multiple variable declarations
 *
 * @param  {Array} obj
 * @return {boolean}
 */
function isObject(obj) {
	return type(obj) === 'object';
}

/**
 * Determine if supplied argument is a percentage
 *
 * @param  {value}  value
 * @return {boolean}
 */
function isPercentage(value) {
	return /^\d+%$/g.test(value);
}

/**
 * Determine if supplied argument is a string
 *
 * @param  {string}  value
 * @return {boolean}
 */
function isString(value) {
	return typeof value === 'string' || value instanceof String;
}

/**
 * Determine if supplied argument includes a unit
 *
 * @param  {*} value
 * @return {boolean}
 */
function isUnit(value) {
	return /(%|cm|rem|em|ex|in|mm|pc|px|pt|vh|vw|vmin)$/g.test(value);
}

/**
 * Prefixes properties with supplied prefix
 *
 * @param {string} value  un-prefixed string
 * @param {string} prefix prefix
 * @param {Array} ignored
 * @return {[string]}
 */
function prefix(value, prefix, ignored = []) {
	if (prefix === false) {
		return value;
	}

	if (ignored.includes(prefix)) {
		return toDashCase(value);
	}

	return prefix + '-' + toDashCase(value);
}

/**
 * From camel case to dash
 *
 * @return {String} camel case version of supplied string
 */
function toDashCase(value) {
	return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// TODO: This is replication of Wee's $type. Can we use that instead once integrated?
function type(obj) {
	return obj === undefined ? 'undefined' :
		Object.prototype.toString.call(obj)
			.replace(/^\[object (.+)]$/, '$1')
			.toLowerCase();
}

/**
 * Append default unit to value if value is a unit
 *
 * @param {string|number} value
 * @param {string|number} property
 * @return {string}
 */
function unit(value, property) {
	let ignored = ['font-weight', 'opacity', 'content', 'columns'];

	if (ignored.includes(property) || property === false || value === 0 || /\s/.test(value)) {
		return value;
	}

	if (! isUnit(value) && isNumber(value)) {
		if (property === 'line-height') {
			value += units.lineHeight;
		} else {
			value += units.default;
		}
	}

	return value;
}

module.exports = {
	calcOpacity: calcOpacity,
	hexToRgba: hexToRgba,
	isColor: isColor,
	isEmpty: isEmpty,
	isNumber: isNumber,
	isObject: isObject,
	isPercentage: isPercentage,
	isString: isString,
	isUnit: isUnit,
	prefix: prefix,
	setDefaultUnits: setDefaultUnits,
	toDashCase: toDashCase,
	type: type,
	unit: unit
};