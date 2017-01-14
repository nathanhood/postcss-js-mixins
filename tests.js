'use strict';

const expect = require('chai').expect;
const postcss = require('postcss');
const plugin = require('./index.js');
const parser = require('./parser/parse');
const stringify = require('./parser/stringify');
const Decl = require('./lib/Declaration');
const helpers = require('./lib/helpers');
const mixins = {
	spacedBlock(...args) {
		let props = this.spaced(...args);

		args.shift();
		return props.concat(this.block(...args));
	},
	block(...args) {
		let props = [
			new Decl('display', 'block')
		];

		props.push(new Decl('width', args[0]));

		if (args[1]) {
			props.push(new Decl('height', args[1]));
		}

		return props;
	},
	spaced(value) {
		if (helpers.isEmpty(value) || helpers.isObject(value)) {
			value = 2;
		}

		return this.margin({ bottom: value });
	},
	margin(...args) {
		let props = [];

		return props.concat(Decl.createManyFromObj(args[0], 'margin'));
	},
	font(...args) {
		var props = [];

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

		return props;
	}
};

function process(input, expected, opts = {}, warnings = 0) {
	return postcss([ plugin(opts) ]).process(input, {
			parser: parser,
			stringifier: stringify
		})
		.then(result => {
			expect(result.css).to.equal(expected);
			expect(result.warnings().length).to.equal(warnings);
		});
}

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
						return new Decl('opacity', helpers.calcOpacity(value));
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

	it('should throw a warning if mixin does not exist', () => {
		return process(
			`.block {
				customMixin(#fff);
			}`,
			`.block {
			}`,
			{},
			1
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
				font('Open Sans' Arial sans-serif, 5, bold, 1.2);
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
						return Decl.createMany([
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

	it('should create many declaration instances from an object', () => {
		return process(
			`.block {
				margin(top: 10px, bottom: 4, right: 2, left: 3);
			}`,
			`.block {
				margin-top: 10px;
				margin-bottom: 4rem;
				margin-right: 2rem;
				margin-left: 3rem;
			}`,
			{
				mixins: {
					margin(obj) {
						return Decl.createManyFromObj(obj, 'margin');
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