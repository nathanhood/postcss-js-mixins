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
				width: 20rem;
				height: 30rem;
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
				width: 20px;
				height: 30em;
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
				width: 20rem;
				height: 30rem;
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
				width: 20px;
				height: 30em;
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

describe('spacedBlock', () => {
	it('should output default value', () => {
		return process(
			`.block {
				spacedBlock();
			}`,
			`.block {
				margin-bottom: 2rem;
				display: block;
			}`,
			mixins
		);
	});

	it('should output supplied value as margin-bottom', () => {
		return process(
			`.block {
				spacedBlock(10);
			}`,
			`.block {
				margin-bottom: 10rem;
				display: block;
			}`,
			mixins
		);
	});

	it('should output supplied string value as margin-bottom and width', () => {
		return process(
			`.block {
				spacedBlock(2, 10);
			}`,
			`.block {
				margin-bottom: 2rem;
				display: block;
				width: 10rem;
			}`,
			mixins
		);
	});

	it('should output supplied string value as margin-bottom, width and height', () => {
		return process(
			`.block {
				spacedBlock(2, 10, 20);
			}`,
			`.block {
				margin-bottom: 2rem;
				display: block;
				width: 10rem;
				height: 20rem;
			}`,
			mixins
		);
	});

	it('should output supplied string value as margin-bottom and width with override unit', () => {
		return process(
			`.block {
				spacedBlock(2px, 10em);
			}`,
			`.block {
				margin-bottom: 2px;
				display: block;
				width: 10em;
			}`,
			mixins
		);
	});

	it('should output supplied values', () => {
		return process(
			`.block {
				spacedBlock(width: 10);
			}`,
			`.block {
				margin-bottom: 2rem;
				width: 10rem;
				display: block;
			}`,
			mixins
		);
	});

	it('should output supplied values with override unit', () => {
		return process(
			`.block {
				spacedBlock(width: 10px);
			}`,
			`.block {
				margin-bottom: 2rem;
				width: 10px;
				display: block;
			}`,
			mixins
		);
	});
});

describe('opaque', () => {
	it('output opacity: 0', () => {
		return process(
			`.block {
				opaque();
			}`,
			`.block {
				opacity: 1;
			}`,
			mixins
		);
	});
});

describe('transparent', () => {
	it('output opacity: 0', () => {
		return process(
			`.block {
				transparent();
			}`,
			`.block {
				opacity: 0;
			}`,
			mixins
		);
	});
});

describe('font', () => {
	it('output handle a font stack', () => {
		return process(
			`.block {
				font('Open Sans, Arial, Helvetica, Banana');
			}`,
			`.block {
				font-family: 'Open Sans, Arial, Helvetica, Banana';
			}`,
			mixins
		);
	});

	it('output specified values', () => {
		return process(
			`.block {
				font(Open Sans, 10, 300, 2, italic);
			}`,
			`.block {
				font-family: Open Sans;
				font-size: 10rem;
				font-weight: 300;
				line-height: 2;
				font-style: italic;
			}`,
			mixins
		);
	});

	it('output specified values by property', () => {
		return process(
			`.block {
				font(style: italic, weight: 300);
			}`,
			`.block {
				font-style: italic;
				font-weight: 300;
			}`,
			mixins
		);
	});
});

describe('unstyled', () => {
	it('output list-style: none', () => {
		return process(
			`.block {
				unstyled();
			}`,
			`.block {
				list-style: none;
			}`,
			mixins
		);
	});
});

describe('absolute', () => {
	it('output absolute position by default', () => {
		return process(
			`.block {
				absolute();
			}`,
			`.block {
				position: absolute;
			}`,
			mixins
		);
	});

	it('output absolute position with supplied arguments', () => {
		return process(
			`.block {
				absolute(4, 3);
			}`,
			`.block {
				position: absolute;
				top: 4rem;
				right: 3rem;
			}`,
			mixins
		);
	});

	it('output absolute position with supplied arguments', () => {
		return process(
			`.block {
				absolute(4, 3, 2, 1);
			}`,
			`.block {
				position: absolute;
				top: 4rem;
				right: 3rem;
				left: 2rem;
				bottom: 1rem;
			}`,
			mixins
		);
	});

	it('output absolute position with supplied arguments with override unit', () => {
		return process(
			`.block {
				absolute(4px, 3em, 2pt, 1mm);
			}`,
			`.block {
				position: absolute;
				top: 4px;
				right: 3em;
				left: 2pt;
				bottom: 1mm;
			}`,
			mixins
		);
	});

	it('output absolute position with supplied object arguments', () => {
		return process(
			`.block {
				absolute(bottom: 3, top: 4);
			}`,
			`.block {
				position: absolute;
				bottom: 3rem;
				top: 4rem;
			}`,
			mixins
		);
	});

	it('output absolute position with supplied object arguments with override unit', () => {
		return process(
			`.block {
				absolute(bottom: 3px, top: 4in);
			}`,
			`.block {
				position: absolute;
				bottom: 3px;
				top: 4in;
			}`,
			mixins
		);
	});
});

describe('fixed', () => {
	it('output fixed position by default', () => {
		return process(
			`.block {
				fixed();
			}`,
			`.block {
				position: fixed;
			}`,
			mixins
		);
	});

	it('output fixed position with supplied arguments', () => {
		return process(
			`.block {
				fixed(4, 3);
			}`,
			`.block {
				position: fixed;
				top: 4rem;
				right: 3rem;
			}`,
			mixins
		);
	});

	it('output fixed position with supplied arguments', () => {
		return process(
			`.block {
				fixed(4, 3, 2, 1);
			}`,
			`.block {
				position: fixed;
				top: 4rem;
				right: 3rem;
				left: 2rem;
				bottom: 1rem;
			}`,
			mixins
		);
	});

	it('output fixed position with supplied arguments with override unit', () => {
		return process(
			`.block {
				fixed(4px, 3em, 2pt, 1mm);
			}`,
			`.block {
				position: fixed;
				top: 4px;
				right: 3em;
				left: 2pt;
				bottom: 1mm;
			}`,
			mixins
		);
	});

	it('output fixed position with supplied object arguments', () => {
		return process(
			`.block {
				fixed(bottom: 3, top: 4);
			}`,
			`.block {
				position: fixed;
				bottom: 3rem;
				top: 4rem;
			}`,
			mixins
		);
	});

	it('output fixed position with supplied object arguments with override unit', () => {
		return process(
			`.block {
				fixed(bottom: 3px, top: 4in);
			}`,
			`.block {
				position: fixed;
				bottom: 3px;
				top: 4in;
			}`,
			mixins
		);
	});
});

describe('size', () => {
	it('should use first argument for width and height with default unit', () => {
		return process(
			`.block {
				size(100);
			}`,
			`.block {
				width: 100rem;
				height: 100rem;
			}`,
			mixins
		);
	});

	it('should use first argument for width and height with override unit', () => {
		return process(
			`.block {
				size(100%);
			}`,
			`.block {
				width: 100%;
				height: 100%;
			}`,
			mixins
		);
	});

	it('should use arguments for width and height', () => {
		return process(
			`.block {
				size(100%, 20%);
			}`,
			`.block {
				width: 100%;
				height: 20%;
			}`,
			mixins
		);
	});
});

describe('minSize', () => {
	it('should use first argument for width and height with default unit', () => {
		return process(
			`.block {
				minSize(100);
			}`,
			`.block {
				min-width: 100rem;
				min-height: 100rem;
			}`,
			mixins
		);
	});

	it('should use first argument for width and height with override unit', () => {
		return process(
			`.block {
				minSize(100%);
			}`,
			`.block {
				min-width: 100%;
				min-height: 100%;
			}`,
			mixins
		);
	});

	it('should use arguments for width and height', () => {
		return process(
			`.block {
				minSize(100%, 20%);
			}`,
			`.block {
				min-width: 100%;
				min-height: 20%;
			}`,
			mixins
		);
	});
});

describe('bold', () => {
	it('should output font-weight with default bold font weight', () => {
		return process(
			`.block {
				bold();
			}`,
			`.block {
				font-weight: 600;
			}`,
			mixins
		);
	});
});

describe('italic', () => {
	it('should output italic font', () => {
		return process(
			`.block {
				italic();
			}`,
			`.block {
				font-style: italic;
			}`,
			mixins
		);
	});
});