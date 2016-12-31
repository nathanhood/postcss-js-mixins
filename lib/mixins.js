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
		 * Display block
		 *
		 * @param  {Array} [value]
		 * @return {[prop, value]}
		 */
		block(...args) {
			let props = [
					this.display('block')
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
		 * Font weight bold
		 * @return {[prop, value]}
		 */
		bold() {
			return prop('font-weight', unit(vars.font.weight.bold, false))
		},

		/**
		 * A block level element, centerd with margin
		 *
		 * @param  {width} value [description]
		 * @return {[type]}       [description]
		 */
		centeredBlock(...args) {
			let block = this.block(...args);

			block.push(this.margin('0 auto'));

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
		 * Color
		 * 
		 * @param  {string} value
		 * @return {[prop, value]}
		 */
		color(value) {
			return prop('color', value);
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
		 * Fixed positioning
		 * 
		 * @param  {Array|mixed} [args.top] top
		 * @param  {Array|mixed} [args.right] right
		 * @param  {Array|mixed} [args.bottom] bottom
		 * @param  {Array|mixed} [args.left] left
		 * @return {[prop, value]}
		 */
		fixed(...args) {
			props = [
				prop('position', 'fixed')
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
		 * Font
		 * 
		 * @param  {Array|mixed} [args.family] font-family
		 * @param  {Array|mixed} [args.size] font-size
		 * @param  {Array|mixed} [args.weight] font-weight
		 * @param  {Array|mixed} [args.lineHeight] line-height
		 * @param  {Array|mixed} [args.style] font-style
		 * @return {[prop, value]}
		 */
		font(...args) {
			props = [];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0], 'font'));
			} else if (! empty(args)) {
				props.push(prop('font-family', unit(args[0])));

				if (args[1]) {
					props.push(prop('font-size', unit(args[1])));
				}

				if (args[2]) {
					// TODO: figure out the best way to handle values that need no units
					props.push(prop('font-weight', unit(args[2], false)));	
				}

				if (args[3]) {
					props.push(prop('line-height', unit(args[3], false)));
				}

				if (args[4]) {
					props.push(prop('font-style', unit(args[4])));
				}
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
		 * @param  {Array} [args[0]] width
		 * @param  {Array} [args[1]] height
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
		 * Font style italic
		 * @return {[prop, value]}
		 */
		italic() {
			return prop('font-style', 'italic');
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
			}

			return prop('margin', unit(value));
		},

		/**
		 * Ouput min-width and/or min-height
		 * 
		 * @param  {string} width
		 * @param  {string} height
		 * @return {[prop, value]}
		 */
		minSize(width, height) {
			let props = [
				prop('min-width', unit(width))
			];

			if (! height) {
				props.push(prop('min-height', unit(width)));
			} else {
				props.push(prop('min-height', unit(height)));
			}

			return props;
		},

		/**
		 * Opacity
		 * 
		 * @param  {string} value
		 * @return {[prop, value]}
		 */
		opacity(value) {
			if (isPercentage(value)) {
				value = value.replace('%', '') / 100;
			}

			return prop('opacity', value);
		},

		/**
		 * Set opacity to 1
		 * 
		 * @return {[prop, value]}
		 */
		opaque() {
			return this.opacity(1);
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
		 * Ouput width and/or height
		 * 
		 * @param  {string} width
		 * @param  {string} height
		 * @return {[prop, value]}
		 */
		size(width, height) {
			let props = [
				prop('width', unit(width))
			];

			if (! height) {
				props.push(prop('height', unit(width)));
			} else {
				props.push(prop('height', unit(height)));
			}

			return props;
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
		 * Add a specified margin bottom.
		 *
		 * @return {[prop, value]}
		 */
		spaced(value) {
			if (empty(value) || isObject(value)) {
				value = vars.block.margin.bottom;
			}

			return this.margin(unit(value), 'bottom');
		},

		/**
		 * Add a specified margin bottom, width, height, and display block
		 * 
		 * @param  {Array} [args[0]] - spaced value
		 * @param  {Array} [args[1]] - width
		 * @param  {Array} [args[0]] - height
		 * @return {[prop, value]}
		 */
		spacedBlock(...args) {
			let props = [
				this.spaced(...args)
			];

			if (isObject(args[0])) {
				props = props.concat(buildProps(args[0]));
			}

			if (! empty(args)) {
				// If argument length is one, assume first value is for spaced mixin
				if (args.length === 1) {
					props = props.concat(this.block());
				}

				// If argument length is two, assume value is first argument for block mixin
				if (args.length === 2) {
					props = props.concat(this.block(args[1]));
				}

				// If argument length is three, assume values are for width and height
				if (args.length === 3) {
					props = props.concat(this.block(args[1], args[2]));
				}
			} else {
				props = props.concat(this.block());
			}

			return props;
		},

		/**
		 * Set opacity to 0
		 * 
		 * @return {[prop, value]}
		 */
		transparent() {
			return this.opacity(0);
		},

		/**
		 * List style: none
		 * 
		 * @return {[prop, value]}
		 */
		unstyled() {
			return prop('list-style', 'none');
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
 * Builds an array of supplied properties and values.  This function
 * assumes that there are the same number of values as properties
 * and that the properties array is in the correct order relative it's
 * value
 * 
 * @param  {Array} props  array of properties
 * @param  {Array} values array of values
 * @return {Array}
 */
function buildSingleProps(props, values) {
	let arr = [];

	for (let i = 0; i < values.length; i++) {
		arr.push(prop(props[i], unit(values[i])));
	}

	return arr;
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
function buildProps(properties, prefix = false) {
	let props = [];

	for (let property in properties) {
		let value = properties[property];

		props.push(
			prop(prefixer(property, prefix), unit(value, property))
		);
	}

	return props;
}

/**
 * Prefixes properties with supplied prefix
 * 
 * @param  {string} value  unprefixed string
 * @param  {string} prefix prefix
 * @return {[string]}
 */
function prefixer(value, prefix) {
	if (prefix === false) {
		return value;
	}

	if (prefix === 'font') {
		if (value === 'lineHeight') {
			return value.toDashCase();
		}
	}

	return prefix + '-' + value.toDashCase();
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
function unit(value, property) {
	let ignore = [
		'lineHeight',
		'weight'
	];

	// TODO: find out if this is the best way to do this
	if (ignore.includes(property) || property === false) {
		return value;
	}

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

/**
 * From camel case to dash
 * 
 * @return {String} camel case version of supplied string
 */
String.prototype.toDashCase = function(){
  return this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}