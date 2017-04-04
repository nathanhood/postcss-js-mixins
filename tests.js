'use strict';

const expect = require('chai').expect;
const postcss = require('postcss');
const plugin = require('./index.js');
const syntax = require('postcss-wee-syntax');
const decl = require('./lib/declaration');
const rule = require('./lib/rule');
const helpers = require('./lib/helpers');
const colorHelpers = require('./lib/colorHelpers');
const mixins = {
	spacedBlock(...args) {
		let props = this.spaced(...args);

		args.shift();
		return props.concat(this.block(...args));
	},
	block(...args) {
		let props = [
			decl('display', 'block')
		];

		props.push(decl('width', args[0]));

		return props;
	},
	spaced(value) {
		return this.margin({ bottom: value });
	},
	margin(...args) {
		let props = [];

		return props.concat(decl.createManyFromObj(args[0], 'margin'));
	},
	font(...args) {
		var props = [];

		props.push(decl('font-family', args[0]));

		if (args[1]) {
			props.push(decl('font-size', args[1]));
		}

		if (args[2]) {
			props.push(decl('font-weight', args[2]));
		}

		if (args[3]) {
			props.push(decl('line-height', args[3]));
		}

		return props;
	}
};

function process(input, expected, opts = {}, warnings = 0) {
	return postcss([ plugin(opts) ]).process(input, {
			syntax: syntax
		})
		.then(result => {
			expect(result.css).to.equal(expected);
			expect(result.warnings().length).to.equal(warnings);
		});
}


// Tests
describe('mixins', () => {
	it('should generate a single declaration', () => {
		return process(
			`.block {
				background(#fff);
			}`,
			`.block {
				background: #fff;
			}`,
			{
				mixins: {
					background(color) {
						return { prop: 'background', value: color }
					}
				}
			}
		);
	});

	it('should generate multiple declarations from one mixin', () => {
		return process(
			`.block {
				background(#fff, no-repeat, right, top);
			}`,
			`.block {
				background-color: #fff;
				background-repeat: no-repeat;
				background-position: right top;
			}`,
			{
				mixins: {
					background(color, repeat, x = '0%', y = '0%') {
						return [
							{ prop: 'background-color', value: color },
							{ prop: 'background-repeat', value: repeat },
							{ prop: 'background-position', value: x + ' ' + y }
						];
					}
				}
			}
		);
	});

	it('should convert numbers', () => {
		return process(
			`.block {
				opacity(.4);
			}`,
			`.block {
				opacity: 0.4;
			}`,
			{
				mixins: {
					opacity(value) {
						return decl('opacity', helpers.calcOpacity(value));
					}
				}
			}
		);
	});

	it('should convert fractions', () => {
		return process(
			`.block {
				ratio(4/3);
			}`,
			`.block {
				width: 75%;
			}`,
			{
				mixins: {
					ratio(value) {
						return decl('width', helpers.toPercentage(1 / value));
					}
				}
			}
		);
	});

	it('should convert "true" and "false" arguments to boolean', () => {
		return process(
			`.block {
				conditional(true);
				conditional(false);
			}`,
			`.block {
				opacity: 0;
				color: blue;
			}`,
			{
				mixins: {
					conditional(arg) {
						if (arg === true) {
							return decl('opacity', 0);
						} else if (arg === false) {
							return decl('color', 'blue');
						}
					}
				}
			}
		);
	});

	it('should parse unmatched variables as individual parameters', () => {
		return process(
			`.block {
				spacedBlock($margin, 10);
			}`,
			`.block {
				margin-bottom: $margin;
				display: block;
				width: 10rem;
			}`,
			{
				mixins: mixins
			}
		);
	});

	it('should handle key: value pairs as arguments', () => {
		return process(
			`.block {
				mixin(padding: 1, weight: bold, background: url('test.png'));
			}`,
			`.block {
				font-weight: bold;
				padding: 1rem;
				background-image: url('test.png');
			}`,
			{
				mixins: {
					mixin(padding, background, weight) {
						return [
							decl('font-weight', weight),
							decl('padding', padding),
							decl('background-image', background)
						];
					}
				}
			}
		);
	});

	it('should fallback to default parameters', () => {
		return process(
			`.block {
				mixin(background: url('test.png'));
			}`,
			`.block {
				font-weight: normal;
				padding: 0;
				background-image: url('test.png');
			}`,
			{
				mixins: {
					mixin(padding = 0, background, weight = 'normal') {
						return [
							decl('font-weight', weight),
							decl('padding', padding),
							decl('background-image', background)
						];
					}
				}
			}
		);
	});

	it('should accept a combination of argument formats', () => {
		return process(
			`.block {
				mixin(bold, bottom: 20rem, 15px);
			}`,
			`.block {
				font-weight: bold;
				padding-top: 15px;
				padding-bottom: 20rem;
			}`,
			{
				mixins: {
					mixin(weight, top = '10rem', bottom = '0rem') {
						return [
							decl('font-weight', weight),
							decl('padding-top', top),
							decl('padding-bottom', bottom)
						];
					}
				}
			}
		);
	});

	it('should handle default values with commas', () => {
		return process(
			`.block {
				mixin();
			}`,
			`.block {
				background-color: rgba(0, 0, 0, .2);
				background-image: url("foo.jpg");
			}`,
			{
				mixins: {
					mixin(color = 'rgba(0, 0, 0, .2)', url = 'url("foo.jpg")') {
						return [
							decl('background-color', color),
							decl('background-image', url)
						];
					}
				}
			}
		);
	});

	it('should handle default values with commas using double quotes', () => {
		return process(
			`.block {
				mixin();
			}`,
			`.block {
				background-color: rgba(0, 0, 0, .2);
				background-image: url('foo.jpg');
			}`,
			{
				mixins: {
					mixin(color = "rgba(0, 0, 0, .2)", url = "url('foo.jpg')") {
						return [
							decl('background-color', color),
							decl('background-image', url)
						];
					}
				}
			}
		);
	});

	it('should handle font-family argument', () => {
		return process(
			`.block {
				font(['Open Sans', Arial, sans-serif], 5, bold, 1.2);
				fontObj(font: ['Open Sans', Arial, serif]);
			}`,
			`.block {
				font-family: 'Open Sans', Arial, sans-serif;
				font-size: 5rem;
				font-weight: bold;
				line-height: 1.2em;
				font-family: 'Open Sans', Arial, serif;
			}`,
			{ mixins: Object.assign(mixins, {
					fontObj(font) {
						return decl('font-family', font);
					}
				})
			}
		);
	});

	it('should throw a warning if mixin does not exist', () => {
		return process(
			`.block {
				customMixin(#fff);
			}`,
			`.block {
				customMixin(#fff);
			}`,
			{},
			1
		);
	});

	it('should generate a single declaration', () => {
		return process(
			`.block {
				mixin();
			}`,
			`.block {
			}`,
			{
				mixins: {
					mixin() {
						return false;
					}
				}
			}
		);
	});
});

describe('default units', () => {
	after(() => {
		return process('', '', {
			mixins: {},
			units: {
				default: 'rem',
				lineHeight: 'em'
			}
		});
	});

	it('should fallback to rem and em (line-height only)', () => {
		return process(
			`.block {
				font(['Open Sans', Arial, sans-serif], 5, bold, 1.2);
			}`,
			`.block {
				font-family: 'Open Sans', Arial, sans-serif;
				font-size: 5rem;
				font-weight: bold;
				line-height: 1.2em;
			}`,
			{
				mixins: mixins
			}
		);
	});

	it('should be registered in options object', () => {
		return process(
			`.block {
				spacedBlock($margin, 10);
				font(Arial, 5, bold, 1.2);
			}`,
			`.block {
				margin-bottom: $margin;
				display: block;
				width: 10px;
				font-family: Arial;
				font-size: 5px;
				font-weight: bold;
				line-height: 1.2%;
			}`,
			{
				mixins: mixins,
				units: {
					default: 'px',
					lineHeight: '%'
				}
			}
		);
	});
});

describe('declarations', () => {
	it('should create many declaration instances by mapping two arrays together', () => {
		return process(
			`.block {
				margin(1, 2, 3, 4);
			}`,
			`.block {
				margin-top: 1rem;
				margin-right: 2rem;
				margin-left: 3rem;
				margin-bottom: 4rem;
			}`,
			{
				mixins: {
					margin(...args) {
						return decl.createMany([
							'margin-top',
							'margin-right',
							'margin-left',
							'margin-bottom'
						], args);
					}
				}
			}
		);
	});

	it('should create many by reusing the same value', () => {
		return process(
			`.block {
				verticalPadding(2);
			}`,
			`.block {
				padding-top: 2rem;
				padding-bottom: 2rem;
			}`,
			{
				mixins: {
					verticalPadding(value) {
						return decl.createMany([
							'padding-top',
							'padding-bottom'
						], helpers.unit(value));
					}
				}
			}
		);
	});

	it('should create many declaration instances from an object', () => {
		return process(
			`.block {
				margin(top: 1, bottom: 4, right: 2, left: 3);
			}`,
			`.block {
				margin-top: 1rem;
				margin-right: 2rem;
				margin-bottom: 4rem;
				margin-left: 3rem;
			}`,
			{
				mixins: {
					margin(top, right, bottom, left) {
						let obj = {
							top: top,
							right: right,
							bottom: bottom,
							left: left
						};

						return decl.createManyFromObj(obj, 'margin');
					}
				}
			}
		);
	});
});

describe('rules', () => {
	it('should generate rule block', () => {
		return process(
			`.block { ruleMixin(); }`,
			`.block { &:after { color: #fff } }`,
			{
				mixins: {
					ruleMixin() {
						return rule('&:after', [ decl('color', '#fff') ]);
					}
				}
			}
		);
	});
});

describe('helpers: calcOpacity', () => {
	it('should convert percentage argument into proper format', () => {
		return expect(helpers.calcOpacity('20%')).to.equal(0.2);
	});

	it('should convert numerical value over 1 into proper format', () => {
		return expect(helpers.calcOpacity(20)).to.equal(0.2);
	});

	it('should return the raw value if not percentage or greater than 1', () => {
		return expect(helpers.calcOpacity(0.2)).to.equal(0.2);
	});
});

describe('helpers: toRgba', () => {
	it('should convert a hex value to RGB', () => {
		return expect(helpers.toRgba('#f5830f')).to.equal('rgb(245, 131, 15)');
	});

	it('should convert a hex value with opacity into RGBA', () => {
		return expect(helpers.toRgba('#f5830f', 0.2)).to.equal('rgba(245, 131, 15, 0.2)');
	});

	it('should convert three character hex value into proper rgb', () => {
		return expect(helpers.toRgba('#fff')).to.equal('rgb(255, 255, 255)');
	});

	it('should convert a color keyword to RGB', () => {
		return expect(helpers.toRgba('blue')).to.equal('rgb(0, 0, 255)');
	});

	it('should convert a color keyword with opacity into RGBA', () => {
		return expect(helpers.toRgba('blue', '50%')).to.equal('rgba(0, 0, 255, 0.5)');
	});
});

describe('helpers: isColor', () => {
	it('should identify hex values as color', () => {
		expect(helpers.isColor('#fff')).to.equal(true);
		expect(helpers.isColor('#f7f7f7')).to.equal(true);
	});

	it('should identify rgb/rgba values as color', () => {
		expect(helpers.isColor('rgb(0, 0, 0)')).to.equal(true);
		expect(helpers.isColor('rgba(0, 0, 0, 0.5)')).to.equal(true);
	});

	it('should identify hsl/hsla values as color', () => {
		expect(helpers.isColor('hsl(0, 100%, 50%)')).to.equal(true);
		expect(helpers.isColor('hsla(0, 100%, 50%, 1)')).to.equal(true);
	});

	it('should identify non-color strings as false', () => {
		expect(helpers.isColor('something')).to.equal(false);
	});
});

describe('helpers: isEmpty', () => {
	it('should identify empty array as empty', () => {
		expect(helpers.isEmpty([])).to.equal(true);
	});

	it('should identify undefined as empty', () => {
		expect(helpers.isEmpty()).to.equal(true);
	});
});

describe('helpers: isFraction', () => {
	it('should identify string fractions as fractions', () => {
		expect(helpers.isFraction('4/3')).to.equal(true);
	});

	it('should not identify any other types', () => {
		expect(helpers.isFraction(4/3)).to.equal(false);
		expect(helpers.isFraction(1.3333)).to.equal(false);
		expect(helpers.isFraction('1.3333/3')).to.equal(false);
	});
});

describe('helpers: isNumber', () => {
	it('should identify string numbers and numbers as a number', () => {
		expect(helpers.isNumber('2')).to.equal(true);
		expect(helpers.isNumber(2)).to.equal(true);
		expect(helpers.isNumber(2.1)).to.equal(true);
	});

	it('should not identify any other types', () => {
		expect(helpers.isNumber('string')).to.equal(false);
		expect(helpers.isNumber(undefined)).to.equal(false);
		expect(helpers.isNumber(null)).to.equal(false);
		expect(helpers.isNumber(true)).to.equal(false);
		expect(helpers.isNumber([])).to.equal(false);
		expect(helpers.isNumber({})).to.equal(false);
	});
});

describe('helpers: isObject', () => {
	it('should identify only {} as an object', () => {
		expect(helpers.isObject({})).to.equal(true);
		expect(helpers.isObject('string')).to.equal(false);
		expect(helpers.isObject(undefined)).to.equal(false);
		expect(helpers.isObject(null)).to.equal(false);
		expect(helpers.isObject(true)).to.equal(false);
		expect(helpers.isObject([])).to.equal(false);
	});
});

describe('helpers: isPercentage', () => {
	it('should identify string number with %', () => {
		expect(helpers.isPercentage('20%')).to.equal(true);
	});
});

describe('helpers: isString', () => {
	it('should identify string', () => {
		expect(helpers.isString('string')).to.equal(true);
		expect(helpers.isString({})).to.equal(false);
		expect(helpers.isString(undefined)).to.equal(false);
		expect(helpers.isString(null)).to.equal(false);
		expect(helpers.isString(true)).to.equal(false);
		expect(helpers.isString([])).to.equal(false);
	});
});

describe('helpers: isUnit', () => {
	it('should identify a CSS unit', () => {
		expect(helpers.isUnit('10px')).to.equal(true);
		expect(helpers.isUnit('10rem')).to.equal(true);
		expect(helpers.isUnit('10em')).to.equal(true);
		expect(helpers.isUnit('10%')).to.equal(true);
		expect(helpers.isUnit('10vh')).to.equal(true);
		expect(helpers.isUnit('10vw')).to.equal(true);
		expect(helpers.isUnit('10vmin')).to.equal(true);
	});

	it('should not identify numeric values without unit', () => {
		expect(helpers.isUnit('10')).to.equal(false);
		expect(helpers.isUnit(10)).to.equal(false);
	});
});

describe('helpers: prefix', () => {
	it('should return raw input if no prefix is false', () => {
		expect(helpers.prefix('margin', false)).to.equal('margin');
	});

	it('should return prefix appended to standard value', () => {
		expect(helpers.prefix('family', 'font')).to.equal('font-family');
	});

	it('should return dash case version of input if prefix is supposed to be ignored', () => {
		expect(helpers.prefix('family', 'font', ['font'])).to.equal('family');
	});
});

describe('helpers: toDashCase', () => {
	it('should return camelCase input to dash case', () => {
		expect(helpers.toDashCase('toDashCase')).to.equal('to-dash-case');
	});
});

describe('helpers: toNumber', () => {
	it('should return percentage as string to decimal', () => {
		expect(helpers.toNumber('5%')).to.equal(0.05);
		expect(helpers.toNumber('12.5%')).to.equal(0.125);
		expect(helpers.toNumber('200%')).to.equal(2);
	});
});

describe('helpers: toPercentage', () => {
	it('should return decimal to percentage as string', () => {
		expect(helpers.toPercentage(0.05)).to.equal('5%');
		expect(helpers.toPercentage(0.125)).to.equal('12.5%');
		expect(helpers.toPercentage(2)).to.equal('200%');
	});
});

describe('helpers: type', () => {
	it('should return the text value of type', () => {
		expect(helpers.type('string')).to.equal('string');
		expect(helpers.type([])).to.equal('array');
		expect(helpers.type({})).to.equal('object');
		expect(helpers.type(1)).to.equal('number');
		expect(helpers.type(true)).to.equal('boolean');
		expect(helpers.type(undefined)).to.equal('undefined');
		expect(helpers.type(null)).to.equal('null');
	});
});

describe('helpers: unit', () => {
	it('should return input value with default unit', () => {
		expect(helpers.unit('10', 'padding')).to.equal('10rem');
	});

	it('should not modify input value if in ignored list of properties', () => {
		expect(helpers.unit('bold', 'font-weight')).to.equal('bold');
	});
});

describe('colorHelpers: darken', () => {
	it('should darken hex input with percentage provided', () => {
		expect(colorHelpers.darken('#69c', 25)).to.equal('#2d5986');
	});
});

describe('colorHelpers: lighten', () => {
	it('should lighten hex input with percentage provided', () => {
		expect(colorHelpers.lighten('#6699cc', 25)).to.equal('#c6d9ec');
	});
});