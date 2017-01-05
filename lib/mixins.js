const vars = require('./variables');

module.exports = {
	mixins: {
		/**
		 * Absolute positioning
		 *
		 * @param {string|number|Object} [args[]] - top or object of positions
		 *	 @param {string|number} [args[].top]
		 *	 @param {string|number} [args[].right]
		 *	 @param {string|number} [args[].bottom]
		 *	 @param {string|number} [args[].left]
		 * @param {string|number} [args[]] - right
		 * @param {string|number} [args[]] - bottom
		 * @param {string|number} [args[]] - left
		 * @return {Array}
		 */
		absolute(...args) {
			let props = [
				prop('position', 'absolute')
			];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args)) {
				props = props.concat(buildOrderedProps([
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
		 * @param value
		 * @returns {Object}
		 */
		align(value) {
			return prop('text-align', value);
		},

		/**
		 * Background
		 *
		 * @param  {Array} args
		 *	 @param {string} [args[]] - color
		 *	 @param {string} [args[]] - opacity or URL
		 *	 @param {number|string} [args[]] - repeat or attachment
		 *	 @param {number|string} [args[]] - attachment or position x
		 *	 @param {number|string} [args[]] - position x or position y
		 *	 @param {number|string} [args[]] - position y
		 * @return {Array}
		 */
		background(...args) {
			let props = [
					prop('background', '')
				],
				color = args[0];

			// TODO: Allow for object params? Shorthand needs to be in specific order.
			if (color) {
				if (args[1]) {
					if (isNumber(args[1])) {
						args[0] = hexToRgba(color, args[1]);
						args.splice(1, 1);
					}
				}

				args.forEach(function(arg, i) {
					if (i) {
						arg = ' ' + arg;
					}

					props[0].value += arg;
				});
			}

			return props;
		},

		/**
		 * Display block
		 *
		 * @param {Array} args
		 * @param {string|number|Object} [args[]] - width or object of properties
		 *	 @param {string|number} [args[].width]
		 *	 @param {string|number} [args[].height]
		 * @param {string|number} [args[]] - height
		 * @returns {Array}
		 */
		block(...args) {
			let props = [
					this.display('block')
				];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args)) {
				props.push(prop('width', args[0]));

				if (args[1]) {
					props.push(prop('height', args[1]));
				}
			}

			return props;
		},

		/**
		 * Font weight bold
		 *
		 * @returns {Object}
		 */
		bold() {
			return prop('font-weight', vars.font.weight.bold);
		},

		// TODO: Review border mixin
		/**
		 * Border
		 *
		 * @param args
		 * @returns {*}
		 */
		border(...args) {
			let keywords = [
				'top',
				'right',
				'bottom',
				'left',
				'vertical',
				'horizontal'
			];

			if (empty(args)) {
				return prop('border', '1px solid ' + vars.colors.default.border)
			}

			if (args.length === 1) {
				let arg = args[0];

				if (! keywords.includes(arg)) {
					if (arg == '0' || arg == 'none') {
						return prop('border', 'none');
					}

					if (isColor(arg)) {
						return prop('border', '1px solid ' + arg);
					}

					return prop('border', arg);
				} else {
					if (arg == 'vertical') {
						return buildOrderedProps([
								'border-left',
								'border-right'
							], '1px solid ' + vars.colors.default.border);
					} else if (arg == 'horizontal') {
						return buildOrderedProps([
								'border-top',
								'border-bottom'
							], '1px solid ' + vars.colors.default.border);
					} else {
						return prop(prefixer(arg, 'border'), '1px solid ' + vars.colors.default.border);
					}
				}
			} else {
				let value = isColor(args[1]) ? '1px solid ' + args[1] : args[1];

				if (args[0] === 'vertical') {
					return buildOrderedProps([
							'border-left',
							'border-right'
						], value);
				} else if (args[0] == 'horizontal') {
					return buildOrderedProps([
							'border-top',
							'border-bottom'
						], value);
				} else {
					return prop(prefixer(args[0], 'border'), value);
				}
			}
		},

		/**
		 * A block level element, centered with margin
		 *
		 * @param  {Array} [args] - Reference 'block' function for param details
		 * @return {Array}
		 */
		centeredBlock(...args) {
			let props = this.block(...args);

			props = props.concat(this.margin(
				{ left: 'auto', right: 'auto' }
			));

			return props;
		},

		/**
		 * Clear left, right, or both
		 *
		 * @param {string} [value=both]
		 * @returns {Object}
		 */
		clear(value = 'both') {
			return prop('clear', value);
		},

		/**
		 * Clearfix
		 *
		 * @return {Object}
		 */
		clearfix() {
			return prop('rule', `&:after {
				clear: both;
				content: '';
				display: block;
			}`);
		},

		/**
		 * Color
		 *
		 * @param  {string} value
		 * @return {Object}
		 */
		color(value) {
			return prop('color', value);
		},

		/**
		 * Grid column
		 *
		 * @param {Array} args
		 * @param {Array} [args[]] - spaced key word or column share
		 * @param {Array} [args[]] - column share or grid columns
		 * @param {Array} [args[]] - grid columns
		 * @return {Array}
		 */
		column(...args) {
			let props = [
				prop('float', 'left')
			];

			if (! empty(args)) {
				if (isPercentage(args[0])) {
					props.push(prop('width', args[0]));
				} else if (args[0] === 'spaced') {
					let columns = empty(args[2]) ? vars.grid.columns : args[2],
						margin = empty(args[3]) ? vars.grid.margin : args[3];

					props.push(prop('width', (100 / columns) * args[1] + '%'));

					props = props.concat(this.margin({ left: margin }));
				} else {
					let columns = empty(args[1]) ? vars.grid.columns : args[1];

					props.push(prop('width', (100 / columns) * args[0] + '%'));
				}
			} else {
				props.push(prop('width', '100%'));
			}

			return props;
		},

		/**
		 * Set display
		 *
		 * @param  {string} value
		 * @return {Object}
		 */
		display(value) {
			return prop('display', value);
		},

		/**
		 * Fixed positioning
		 *
		 * @param {string|number|Object} [args[]] - top or object of positions
		 *	 @param {string|number} [args[].top]
		 *	 @param {string|number} [args[].right]
		 *	 @param {string|number} [args[].bottom]
		 *	 @param {string|number} [args[].left]
		 * @param {string|number} [args[]] - right
		 * @param {string|number} [args[]] - bottom
		 * @param {string|number} [args[]] - left
		 * @return {Array}
		 */
		fixed(...args) {
			props = [
				prop('position', 'fixed')
			];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args)) {
				props = props.concat(buildOrderedProps([
					'top',
					'right',
					'left',
					'bottom'
				], args));
			}

			return props;
		},

		/**
		 * Font
		 *
		 * @param {Array} [args]
		 * @param {string|number|Object} [args[]] - font-family or object of properties
		 *	 @param {string|number} [args[].family]
		 *	 @param {string|number} [args[].size]
		 *	 @param {string|number} [args[].weight]
		 *	 @param {string|number} [args[].lineHeight]
		 *	 @param {string|number} [args[].style]
		 * @param {string|number} [args[]] - font-size
		 * @param {string|number} [args[]] - font-weight
		 * @param {string|number} [args[]] - line-height
		 * @param {string|number} [args[]] - font-style
		 * @return {Array}
		 */
		font(...args) {
			props = [];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0], 'font', ['lineHeight']));
			} else if (! empty(args)) {
				props.push(prop('font-family', args[0]));

				if (args[1]) {
					props.push(prop('font-size', args[1]));
				}

				if (args[2]) {
					props.push(prop('font-weight', args[2]));
				}

				if (args[3]) {
					props.push(prop('line-height', args[3]));
				}

				if (args[4]) {
					props.push(prop('font-style', args[4]));
				}
			}

			return props;
		},

		/**
		 * Display inline
		 *
		 * @return {Object}
		 */
		inline() {
			return this.display('inline');
		},

		/**
		 * Display inline block
		 *
		 * @param  {Array} [args[]] - width
		 * @param  {Array} [args[]] - height
		 * @return {Array}
		 */
		inlineBlock(...args) {
			let props = [
					this.display('inline-block')
				];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			} else if (! empty(args)) {
				props.push(prop('width', args[0]));

				if (args[1]) {
					props.push(prop('height', args[1]));
				}
			}

			return props;
		},

		/**
		 * Font style italic
		 *
		 * @return {Object}
		 */
		italic() {
			return prop('font-style', 'italic');
		},

		/**
		 * Float left or position left
		 *
		 * @param {string} [value]
		 * @return {Object}
		 */
		left(value) {
			if (empty(value)) {
				return prop('float', 'left');
			}

			return prop('left', value);
		},

		/**
		 * Show element
		 *
		 * @return {Object}
		 */
		hidden() {
			return this.visibility('hidden');
		},

		/**
		 * Hide element
		 *
		 * @return {Object}
		 */
		hide() {
			return this.display('none');
		},

		/**
		 * Margin
		 *
		 * @param args
		 * @returns {Array}
		 */
		margin(...args) {
			let props = [];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0], 'margin'));
			} else if (! empty(args)) {
				if (args.length > 1) {
					props = props.concat(buildOrderedProps([
						'margin-top',
						'margin-right',
						'margin-left',
						'margin-bottom'
					], args));
				} else if (isString(args[0])) {
					props.push(prop('margin', args[0]));
				}
			}

			return props;
		},

		/**
		 * Output min-width and/or min-height
		 *
		 * @param {string} width
		 * @param {string} height
		 * @return {Array}
		 */
		minSize(width, height) {
			let props = [
				prop('min-width', width)
			];

			if (! height) {
				props.push(prop('min-height', width));
			} else {
				props.push(prop('min-height', height));
			}

			return props;
		},

		/**
		 * Opacity
		 *
		 * @param  {string} value
		 * @return {Object}
		 */
		opacity(value) {
			return prop('opacity', calcOpacity(value));
		},

		/**
		 * Set opacity to 1
		 *
		 * @return {Object}
		 */
		opaque() {
			return this.opacity(1);
		},

		/**
		 * Float right or position right
		 *
		 * @param {string} [value]
		 * @return {Object}
		 */
		right(value) {
			if (empty(value)) {
				return prop('float', 'right');
			}

			return prop('right', value);
		},

		/**
		 * Grid row
		 *
		 * @param  {string|number} margin
		 * @return {Array}
		 */
		row(margin) {
			margin = margin || vars.grid.margin.replace('%', '');
			margin = parseInt(margin);

			return [
				this.margin({ left: (margin * -1) + '%' })[0],
				prop('max-width', (100 + margin) + '%'),
				this.clearfix()
			]
		},

		/**
		 * Grid row modify
		 *
		 * @param  {string|number} margin
		 * @return {Array}
		 */
		rowModify(margin) {
			margin = margin || vars.grid.margin.replace('%', '');
			margin = parseInt(margin);

			return this.margin({ left: (margin * -1) + '%' })
				.concat(prop('max-width', (100 + margin) + '%'));
		},

		/**
		 * Grid row reset
		 *
		 * @return {Array}
		 */
		rowReset() {
			return this.margin({ left: 0 })
				.concat(prop('max-width', 'none'));
		},

		/**
		 * Output width and/or height
		 *
		 * @param  {string} width
		 * @param  {string} height
		 * @return {Array}
		 */
		size(width, height) {
			let props = [
				prop('width', width)
			];

			if (! height) {
				props.push(prop('height', width));
			} else {
				props.push(prop('height', height));
			}

			return props;
		},

		/**
		 * Show element
		 *
		 * @return {Object}
		 */
		show() {
			return this.display('inherit');
		},

		/**
		 * Add a specified margin bottom.
		 *
		 * @return {Array}
		 */
		spaced(value) {
			if (empty(value) || isObject(value)) {
				value = vars.block.margin.bottom;
			}

			return this.margin({ bottom: unit(value) });
		},

		/**
		 * Add a specified margin bottom, width, height, and display block
		 *
		 * @param {Array} [args]
		 * @param {string|number|Object} [args[]] - spaced value or object of width/height
		 *	 @param {string|number} [args[].width]
		 *	 @param {string|number} [args[].height]
		 * @param {string|number} [args[]] - width
		 * @param {string|number} [args[]] - height
		 * @return {Array}
		 */
		spacedBlock(obj) {
			let props = this.spaced(...args);

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
				props = props.concat(this.block());
			} else if (args.length > 1) {
				args.shift();
				props = props.concat(this.block(...args));
			} else {
				props = props.concat(this.block());
			}

			return props;
		},

		/**
		 * Set opacity to 0
		 *
		 * @return {Object}
		 */
		transparent() {
			return this.opacity(0);
		},

		/**
		 * List style: none
		 *
		 * @return {Object}
		 */
		unstyled() {
			return prop('list-style', 'none');
		},

		/**
		 * Vertical align
		 *
		 * @param  {string} [value]
		 * @return {Object}
		 */
		vAlign(value) {
			return prop('vertical-align', value);
		},

		/**
		 * Show element
		 *
		 * @return {Object}
		 */
		visible() {
			return this.visibility('visible');
		},

		/**
		 * Visibility
		 *
		 * @param  {string} [value]
		 * @return {Object}
		 */
		visibility(value) {
			return prop('visibility', value);
		}
	}
}

/**
 * Builds an array of supplied properties and values.  This function
 * assumes that there are the same number of values as properties
 * and that the properties array is in the correct order relative it's
 * value
 *
 * @param  {Array} props  array of properties
 * @param  {Array|String} values array of values
 * @return {Array}
 */
function buildOrderedProps(props, values) {
	let arr = [],
		i = 0;

	if (isString(values)) {
		for (; i < props.length; i++) {
			arr.push(prop(props[i], values));
		}
	} else {
		for (; i < values.length; i++) {
			arr.push(prop(props[i], values[i]));
		}
	}

	return arr;
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

// TODO: This is replication of Wee's $type. Can we use that instead once integrated?
function type(obj) {
	return obj === undefined ? 'undefined' :
		Object.prototype.toString.call(obj)
			.replace(/^\[object (.+)]$/, '$1')
			.toLowerCase();
}

/**
 * Build properties from object
 *
 * @param  {Object} properties
 * @param  {Array} ignored
 * @return {Array}
 */
function buildProps(properties, prefix = false, ignored = []) {
	let props = [];

	for (let property in properties) {
		let value = properties[property];

		props.push(
			prop(prefixer(property, prefix, ignored), value)
		);
	}

	return props;
}

/**
 * Prefixes properties with supplied prefix
 *
<<<<<<< Updated upstream
 * @param {string} value  un-prefixed string
 * @param {string} prefix prefix
 * @param {Array} ignored
 * @return {[string]}
 */
function prefixer(value, prefix, ignored = []) {
	if (prefix === false) {
		return value;
	}

	if (ignored.includes(prefix)) {
		return value.toDashCase();
	}

	return prefix + '-' + value.toDashCase();
}

/**
 * Determine if value is empty
 *
 * @param  {*} value
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
			value += vars.unit.lineHeight;
		} else {
			value += vars.unit.default;
		}
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
	return { prop: prop, value: unit(value, prop) };
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
 * Determine if supplied argument is a string
 *
 * @param  {string}  value
 * @return {boolean}
 */
function isString(value) {
	return typeof value === 'string' || value instanceof String;
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

	// TODO: there is a similar block in the variables colors file.
	// TODO: consider grouping color functions and importing
	if (color.length === 3) {
		color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
	}

	let r = parseInt(color.substring(0,2), 16),
		g = parseInt(color.substring(2,4), 16),
		b = parseInt(color.substring(4,6), 16);

	if (opacity) {
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}

	return `rgb(${r}, ${g}, ${b}})`;
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
 * From camel case to dash
 *
 * @return {String} camel case version of supplied string
 */
String.prototype.toDashCase = function() {
  return this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};