const vars = require('./variables');
const Decl = require('./Declaration');
const Rule = require('./Rule');
const { isObject, isEmpty, isPercentage, isColor, prefix, isNumber, hexToRgba, calcOpacity, isString } = require('./helpers');

module.exports = {
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
			new Decl('position', 'absolute')
		];

		if (isObject(args[0])) {
			props = props.concat(Decl.createManyFromObj(args[0]));
		} else if (! isEmpty(args)) {
			props = props.concat(Decl.createMany([
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
		return new Decl('text-align', value);
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
				new Decl('background', '')
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
			props = props.concat(Decl.createManyFromObj(args[0]));
		} else if (! isEmpty(args)) {
			props.push(new Decl('width', args[0]));

			if (args[1]) {
				props.push(new Decl('height', args[1]));
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
		return new Decl('font-weight', vars.font.weight.bold);
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

		if (isEmpty(args)) {
			return new Decl('border', '1px solid ' + vars.colors.default.border)
		}

		if (args.length === 1) {
			let arg = args[0];

			if (! keywords.includes(arg)) {
				if (arg == '0' || arg == 'none') {
					return new Decl('border', 'none');
				}

				if (isColor(arg)) {
					return new Decl('border', '1px solid ' + arg);
				}

				return new Decl('border', arg);
			} else {
				if (arg == 'vertical') {
					return Decl.createMany([
							'border-left',
							'border-right'
						], '1px solid ' + vars.colors.default.border);
				} else if (arg == 'horizontal') {
					return Decl.createMany([
							'border-top',
							'border-bottom'
						], '1px solid ' + vars.colors.default.border);
				} else {
					return new Decl(prefix(arg, 'border'), '1px solid ' + vars.colors.default.border);
				}
			}
		} else {
			let value = isColor(args[1]) ? '1px solid ' + args[1] : args[1];

			if (args[0] === 'vertical') {
				return Decl.createMany([
						'border-left',
						'border-right'
					], value);
			} else if (args[0] == 'horizontal') {
				return Decl.createMany([
						'border-top',
						'border-bottom'
					], value);
			} else {
				return new Decl(prefix(args[0], 'border'), value);
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
		return new Decl('clear', value);
	},

	/**
	 * Clearfix
	 *
	 * @return {Object}
	 */
	clearfix() {
		return new Rule('&:after', [
			this.clear(),
			this.content(),
			this.display('block')
		]);
	},

	/**
	 * Color
	 *
	 * @param  {string} value
	 * @return {Object}
	 */
	color(value) {
		return new Decl('color', value);
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
			new Decl('float', 'left')
		];

		if (! isEmpty(args)) {
			if (isPercentage(args[0])) {
				props.push(new Decl('width', args[0]));
			} else if (args[0] === 'spaced') {
				let columns = isEmpty(args[2]) ? vars.grid.columns : args[2],
					margin = isEmpty(args[3]) ? vars.grid.margin : args[3];

				props.push(new Decl('width', (100 / columns) * args[1] + '%'));

				props = props.concat(this.margin({ left: margin }));
			} else {
				let columns = isEmpty(args[1]) ? vars.grid.columns : args[1];

				props.push(new Decl('width', (100 / columns) * args[0] + '%'));
			}
		} else {
			props.push(new Decl('width', '100%'));
		}

		return props;
	},

	/**
	 * Empty content block
	 *
	 * @returns {Declaration}
	 */
	content() {
		return new Decl('content', '\'\'');
	},

	/**
	 * Set display
	 *
	 * @param  {string} value
	 * @return {Object}
	 */
	display(value) {
		return new Decl('display', value);
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
			new Decl('position', 'fixed')
		];

		if (isObject(args[0])) {
			props = props.concat(Decl.createManyFromObj(args[0]));
		} else if (! isEmpty(args)) {
			props = props.concat(Decl.createMany([
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
			props = props.concat(Decl.createManyFromObj(args[0], 'font', ['lineHeight']));
		} else if (! isEmpty(args)) {
			props.push(new Decl('font-family', args[0]));

			if (args[1]) {
				props.push(new Decl('font-size', args[1]));
			}

			if (args[2]) {
				props.push(new Decl('font-weight', args[2]));
			}

			if (args[3]) {
				props.push(new Decl('line-height', args[3]));
			}

			if (args[4]) {
				props.push(new Decl('font-style', args[4]));
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
			props = props.concat(Decl.createManyFromObj(args[0]));
		} else if (! isEmpty(args)) {
			props.push(new Decl('width', args[0]));

			if (args[1]) {
				props.push(new Decl('height', args[1]));
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
		return new Decl('font-style', 'italic');
	},

	/**
	 * Float left or position left
	 *
	 * @param {string} [value]
	 * @return {Object}
	 */
	left(value) {
		if (isEmpty(value)) {
			return new Decl('float', 'left');
		}

		return new Decl('left', value);
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
			props = props.concat(Decl.createManyFromObj(args[0], 'margin'));
		} else if (! isEmpty(args)) {
			if (args.length > 1) {
				props = props.concat(Decl.createMany([
					'margin-top',
					'margin-right',
					'margin-left',
					'margin-bottom'
				], args));
			} else if (isString(args[0])) {
				props.push(new Decl('margin', args[0]));
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
			new Decl('min-width', width)
		];

		if (! height) {
			props.push(new Decl('min-height', width));
		} else {
			props.push(new Decl('min-height', height));
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
		return new Decl('opacity', calcOpacity(value));
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
		if (isEmpty(value)) {
			return new Decl('float', 'right');
		}

		return new Decl('right', value);
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
			new Decl('max-width', (100 + margin) + '%'),
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
			.concat(new Decl('max-width', (100 + margin) + '%'));
	},

	/**
	 * Grid row reset
	 *
	 * @return {Array}
	 */
	rowReset() {
		return this.margin({ left: 0 })
			.concat(new Decl('max-width', 'none'));
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
			new Decl('width', width)
		];

		if (! height) {
			props.push(new Decl('height', width));
		} else {
			props.push(new Decl('height', height));
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
		if (isEmpty(value) || isObject(value)) {
			value = vars.block.margin.bottom;
		}

		return this.margin({ bottom: value });
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
	spacedBlock(...args) {
		let props = this.spaced(...args);

		if (isObject(args[0])) {
			props = props.concat(Decl.createManyFromObj(args[0]));
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
		return new Decl('list-style', 'none');
	},

	/**
	 * Vertical align
	 *
	 * @param  {string} [value]
	 * @return {Object}
	 */
	vAlign(value) {
		return new Decl('vertical-align', value);
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
		return new Decl('visibility', value);
	}
};