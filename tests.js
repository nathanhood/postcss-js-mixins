'use strict';

const expect = require('chai').expect;
const postcss = require('postcss');
const plugin = require('./index.js');
const parser = require('./lib/parse');
const stringify = require('./lib/stringify');
const mixins = require('./lib/mixins');

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

	// Adds declarations in correct position in file
	// Nesting selectors
	// Nested mixin properties
	// All types of input - regular CSS values (hex, px/rem/em, %, keywords), string, variable, CSS functions, integer
});

// TODO: anything below here is a part of the mixin specific test
describe('left', () => {
	it('should generate float left by default', () => {
		return process(
			`.block {
				left();
			}`,
			`.block {
				float: left;
			}`,
			mixins
		);
	});

	it('should generate position left', () => {
		return process(
			`.block {
				left(10);
			}`,
			`.block {
				left: 10rem;
			}`,
			mixins
		);
	});

	it('should override default value', () => {
		return process(
			`.block {
				left(10px);
			}`,
			`.block {
				left: 10px;
			}`,
			mixins
		);
	});
});

describe('right', () => {
	it('should generate float right', () => {
		return process(
			`.block {
				right();
			}`,
			`.block {
				float: right;
			}`,
			mixins
		);
	});

	it('should generate position right', () => {
		return process(
			`.block {
				right(10);
			}`,
			`.block {
				right: 10rem;
			}`,
			mixins
		);
	});

	it('should override default value', () => {
		return process(
			`.block {
				right(10px);
			}`,
			`.block {
				right: 10px;
			}`,
			mixins
		);
	});
});

describe('clear', () => {
	it('should generate clear both by default', () => {
		return process(
			`.block {
				clear();
			}`,
			`.block {
				clear: both;
			}`,
			mixins
		);
	});

	it('should clear left', () => {
		return process(
			`.block {
				clear(left);
			}`,
			`.block {
				clear: left;
			}`,
			mixins
		);
	});
});

describe('align', () => {
	it('should generate text-align declaration', () => {
		return process(
			`.block {
				align(center);
			}`,
			`.block {
				text-align: center;
			}`,
			mixins
		);
	});

	it('should generate text-align declaration', () => {
		return process(
			`.block {
				align(left);
			}`,
			`.block {
				text-align: left;
			}`,
			mixins
		);
	});
});

describe('vAlign', () => {
	it('should generate vertical-align declaration', () => {
		return process(
			`.block {
				vAlign(middle);
			}`,
			`.block {
				vertical-align: middle;
			}`,
			mixins
		);
	});

	it('should generate vertical-align declaration with unit value', () => {
		return process(
			`.block {
				vAlign(10);
			}`,
			`.block {
				vertical-align: 10rem;
			}`,
			mixins
		);
	});

	it('should generate vertical-align declaration with unit value', () => {
		return process(
			`.block {
				vAlign(10px);
			}`,
			`.block {
				vertical-align: 10px;
			}`,
			mixins
		);
	});
});

describe('inline', () => {
	it('should generate display: inline', () => {
		return process(
			`.block {
				inline();
			}`,
			`.block {
				display: inline;
			}`,
			mixins
		);
	});
});

describe('inlineBlock', () => {
	it('should generate display: inline-block', () => {
		return process(
			`.block {
				inlineBlock();
			}`,
			`.block {
				display: inline-block;
			}`,
			mixins
		);
	});

	it('should add width with default unit', () => {
		return process(
			`.block {
				inlineBlock(20);
			}`,
			`.block {
				display: inline-block;
				width: 20rem;
			}`,
			mixins
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				inlineBlock(20, 30);
			}`,
			`.block {
				display: inline-block;
				width: 20rem;
				height: 30rem;
			}`,
			mixins
		);
	});

	it('should add width and height with user-defined units', () => {
		return process(
			`.block {
				inlineBlock(20px, 30em);
			}`,
			`.block {
				display: inline-block;
				width: 20px;
				height: 30em;
			}`,
			mixins
		);
	});

	it('should add width and height with default unit in object syntax', () => {
		return process(
			`.block {
				inlineBlock(width: 20, height: 20);
			}`,
			`.block {
				display: inline-block;
				width: 20rem;
				height: 20rem;
			}`,
			mixins
		);
	});

	it('should add height with default unit in object syntax', () => {
		return process(
			`.block {
				inlineBlock(height: 20);
			}`,
			`.block {
				display: inline-block;
				height: 20rem;
			}`,
			mixins
		);
	});
});

describe('block', () => {
	it('should generate display: block', () => {
		return process(
			`.block {
				block();
			}`,
			`.block {
				display: block;
			}`,
			mixins
		);
	});

	it('should add width with default unit', () => {
		return process(
			`.block {
				block(20);
			}`,
			`.block {
				display: block;
				width: 20rem;
			}`,
			mixins
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				block(20, 30);
			}`,
			`.block {
				display: block;
				height: 30rem;
				width: 20rem;
			}`,
			mixins
		);
	});

	it('should add width and height with override unit', () => {
		return process(
			`.block {
				block(20px, 30em);
			}`,
			`.block {
				display: block;
				height: 30em;
				width: 20px;
			}`,
			mixins
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				block(width: 20, height: 20);
			}`,
			`.block {
				display: block;
				width: 20rem;
				height: 20rem;
			}`,
			mixins
		);
	});

	it('should add specified parameters', () => {
		return process(
			`.block {
				block(height: 20);
			}`,
			`.block {
				display: block;
				height: 20rem;
			}`,
			mixins
		);
	});
});

describe('centeredBlock', () => {
	it('should generate display: block with centered margins', () => {
		return process(
			`.block {
				centeredBlock();
			}`,
			`.block {
				display: block;
				margin: 0 auto;
			}`,
			mixins
		);
	});

	it('should add width with default unit', () => {
		return process(
			`.block {
				centeredBlock(20);
			}`,
			`.block {
				display: block;
				width: 20rem;
				margin: 0 auto;
			}`,
			mixins
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				centeredBlock(20, 30);
			}`,
			`.block {
				display: block;
				height: 30rem;
				width: 20rem;
				margin: 0 auto;
			}`,
			mixins
		);
	});

	it('should add width and height with override unit', () => {
		return process(
			`.block {
				centeredBlock(20px, 30em);
			}`,
			`.block {
				display: block;
				height: 30em;
				width: 20px;
				margin: 0 auto;
			}`,
			mixins
		);
	});

	it('should add width and height with default unit', () => {
		return process(
			`.block {
				centeredBlock(width: 20, height: 20);
			}`,
			`.block {
				display: block;
				width: 20rem;
				height: 20rem;
				margin: 0 auto;
			}`,
			mixins
		);
	});

	it('should add specified parameters', () => {
		return process(
			`.block {
				centeredBlock(height: 20);
			}`,
			`.block {
				display: block;
				height: 20rem;
				margin: 0 auto;
			}`,
			mixins
		);
	});
});

describe('display', () => {
	it('should output supplied display value', () => {
		return process(
			`.block {
				display(block);
			}`,
			`.block {
				display: block;
			}`,
			mixins
		);
	});
});

describe('hide', () => {
	it('should output display: none', () => {
		return process(
			`.block {
				hide();
			}`,
			`.block {
				display: none;
			}`,
			mixins
		);
	});
});

describe('show', () => {
	it('should output display: inherit', () => {
		return process(
			`.block {
				show();
			}`,
			`.block {
				display: inherit;
			}`,
			mixins
		);
	});
});

describe('visibility', () => {
	it('should output supplied visibility value ', () => {
		return process(
			`.block {
				visibility(hidden);
			}`,
			`.block {
				visibility: hidden;
			}`,
			mixins
		);
	});
});

describe('visible', () => {
	it('should output visibility: visible ', () => {
		return process(
			`.block {
				visible();
			}`,
			`.block {
				visibility: visible;
			}`,
			mixins
		);
	});
});

describe('hidden', () => {
	it('should output visibility: hidden', () => {
		return process(
			`.block {
				hidden();
			}`,
			`.block {
				visibility: hidden;
			}`,
			mixins
		);
	});
});

describe('spaced', () => {
	it('should output default value as margin-bottom', () => {
		return process(
			`.block {
				spaced();
			}`,
			`.block {
				margin-bottom: 2rem;
			}`,
			mixins
		);
	});

	it('should output supplied value as margin-bottom', () => {
		return process(
			`.block {
				spaced(10);
			}`,
			`.block {
				margin-bottom: 10rem;
			}`,
			mixins
		);
	});
});

describe('margin', () => {
	it('specified margin value and direction', () => {
		return process(
			`.block {
				margin(20, bottom);
			}`,
			`.block {
				margin-bottom: 20rem;
			}`,
			mixins
		);
	});

	it('should output supplied value as margin-bottom', () => {
		return process(
			`.block {
				spaced(10);
			}`,
			`.block {
				margin-bottom: 10rem;
			}`,
			mixins
		);
	});

	it('should output supplied string value as margin', () => {
		return process(
			`.block {
				margin(0 auto);
			}`,
			`.block {
				margin: 0 auto;
			}`,
			mixins
		);
	});
});