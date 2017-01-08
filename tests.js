'use strict';

const expect = require('chai').expect;
const postcss = require('postcss');
const plugin = require('./index.js');
const parser = require('./parser/parse');
const stringify = require('./parser/stringify');
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

describe('{ mixins: mixins }', () => {
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			mixins: mixins,
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
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
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
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
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
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
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
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
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
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
				margin-left: auto;
				margin-right: auto;
			}`,
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
		);
	});
});

describe('margin', () => {
	// it('specified margin value and direction', () => {
	// 	return process(
	// 		`.block {
	// 			margin(20, bottom);
	// 		}`,
	// 		`.block {
	// 			margin-bottom: 20rem;
	// 		}`,
	// 		{ mixins: mixins }
	// 	);
	// });

	// it('should output supplied value as margin-bottom', () => {
	// 	return process(
	// 		`.block {
	// 			spaced(10);
	// 		}`,
	// 		`.block {
	// 			margin-bottom: 10rem;
	// 		}`,
	// 		{ mixins: mixins }
	// 	);
	// });

	it('should output supplied string value as margin', () => {
		return process(
			`.block {
				margin(0 auto);
			}`,
			`.block {
				margin: 0 auto;
			}`,
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
				line-height: 2em;
				font-style: italic;
			}`,
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
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
			{ mixins: mixins }
		);
	});
});

describe('background', () => {
	it('should output a string', () => {
		return process(
			`.block {
				background('this is a string');
			}`,
			`.block {
				background: 'this is a string';
			}`,
			{ mixins: mixins }
		);
	});

	it('should output opacity as second parameter', () => {
		return process(
			`.block {
				background(#fff, .4);
			}`,
			`.block {
				background: rgba(255, 255, 255, 0.4);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output opacity as second parameter as a percentage', () => {
		return process(
			`.block {
				background(#fff, 40%);
			}`,
			`.block {
				background: rgba(255, 255, 255, 0.4);
			}`,
			{ mixins: mixins }
		);
	});

	it('should output url() as second parameter', () => {
		return process(
			`.block {
				background(#fff, url('/test/test.jpg'));
			}`,
			`.block {
				background: #fff url('/test/test.jpg');
			}`,
			{ mixins: mixins }
		);
	});

	it('should output x position as third parameter', () => {
		return process(
			`.block {
				background(#fff, url('/test/test.jpg'), center);
			}`,
			`.block {
				background: #fff url('/test/test.jpg') center;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output y position as forth parameter', () => {
		return process(
			`.block {
				background(#fff, url('/test/test.jpg'), center, center);
			}`,
			`.block {
				background: #fff url('/test/test.jpg') center center;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output repeat as fifth parameter', () => {
		return process(
			`.block {
				background(#fff, url('/test/test.jpg'), center, center, no-repeat);
			}`,
			`.block {
				background: #fff url('/test/test.jpg') center center no-repeat;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output attachment as sixth parameter', () => {
		return process(
			`.block {
				background(#fff, url('/test/test.jpg'), center, center, no-repeat, fixed);
			}`,
			`.block {
				background: #fff url('/test/test.jpg') center center no-repeat fixed;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('border', () => {
	it('should output default properties if no args are supplied', () => {
		return process(
			`.block {
				border();
			}`,
			`.block {
				border: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output border none', () => {
		return process(
			`.block {
				border(0);
				border(none);
			}`,
			`.block {
				border: none;
				border: none;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output default properties with supplied color', () => {
		return process(
			`.block {
				border(#000);
			}`,
			`.block {
				border: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output supplied string', () => {
		return process(
			`.block {
				border(1px solid black);
			}`,
			`.block {
				border: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top border with default properties', () => {
		return process(
			`.block {
				border(top);
			}`,
			`.block {
				border-top: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left border with default properties', () => {
		return process(
			`.block {
				border(left);
			}`,
			`.block {
				border-left: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output vertical borders with default properties', () => {
		return process(
			`.block {
				border(vertical);
			}`,
			`.block {
				border-left: 1px solid #bfbfbf;
				border-right: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output horizontal borders with default properties', () => {
		return process(
			`.block {
				border(horizontal);
			}`,
			`.block {
				border-top: 1px solid #bfbfbf;
				border-bottom: 1px solid #bfbfbf;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left border with supplied color', () => {
		return process(
			`.block {
				border(left, #000);
			}`,
			`.block {
				border-left: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top border with supplied color', () => {
		return process(
			`.block {
				border(top, #000);
			}`,
			`.block {
				border-top: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left and right border with supplied color', () => {
		return process(
			`.block {
				border(vertical, #000);
			}`,
			`.block {
				border-left: 1px solid #000;
				border-right: 1px solid #000;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top border with supplied parameters', () => {
		return process(
			`.block {
				border(top, 1px solid black);
			}`,
			`.block {
				border-top: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left border with supplied parameters', () => {
		return process(
			`.block {
				border(left, 1px solid black);
			}`,
			`.block {
				border-left: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output left and right border with supplied parameters', () => {
		return process(
			`.block {
				border(vertical, 1px solid black);
			}`,
			`.block {
				border-left: 1px solid black;
				border-right: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output top and bottom border with supplied parameters', () => {
		return process(
			`.block {
				border(horizontal, 1px solid black);
			}`,
			`.block {
				border-top: 1px solid black;
				border-bottom: 1px solid black;
			}`,
			{ mixins: mixins }
		);
	});
});

// Note: Generated rules will not add semi-colon to last declaration.
// This is supported by the CSS spec.
describe('clearfix', () => {
	it('should output a nested selector', () => {
		return process(
			`.block { clearfix(); }`,
			`.block { &:after { clear: both; content: ''; display: block } }`,
			{ mixins: mixins }
		);
	});
});

describe('row', () => {
	it('should output margins with clearfix', () => {
		return process(
			`.block { row(); }`,
			`.block { margin-left: -5%; max-width: 105%; &:after { clear: both; content: ''; display: block } }`,
			{ mixins: mixins }
		);
	});
});

describe('row', () => {
	it('should output margins with clearfix with override value', () => {
		return process(
			`.block { row(10%); }`,
			`.block { margin-left: -10%; max-width: 110%; &:after { clear: both; content: ''; display: block } }`,
			{ mixins: mixins }
		);
	});
});

describe('rowModify', () => {
	it('should output override margins', () => {
		return process(
			`.block {
				rowModify();
			}`,
			`.block {
				margin-left: -5%;
				max-width: 105%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('rowModify', () => {
	it('should output override margins with override value', () => {
		return process(
			`.block {
				rowModify(10);
			}`,
			`.block {
				margin-left: -10%;
				max-width: 110%;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('rowReset', () => {
	it('should output reset', () => {
		return process(
			`.block {
				rowReset();
			}`,
			`.block {
				margin-left: 0;
				max-width: none;
			}`,
			{ mixins: mixins }
		);
	});
});

describe('column', () => {
	it('should output default width', () => {
		return process(
			`.block {
				column();
			}`,
			`.block {
				float: left;
				width: 100%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output override width', () => {
		return process(
			`.block {
				column(50%);
			}`,
			`.block {
				float: left;
				width: 50%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share', () => {
		return process(
			`.block {
				column(1);
			}`,
			`.block {
				float: left;
				width: 12.5%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share with grid column count', () => {
		return process(
			`.block {
				column(1, 2);
			}`,
			`.block {
				float: left;
				width: 50%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share with grid column count with default grid margin', () => {
		return process(
			`.block {
				column(spaced, 1, 2);
			}`,
			`.block {
				float: left;
				width: 50%;
				margin-left: 5%;
			}`,
			{ mixins: mixins }
		);
	});

	it('should output column share with grid column count with override grid margin', () => {
		return process(
			`.block {
				column(spaced, 1, 2, 10%);
			}`,
			`.block {
				float: left;
				width: 50%;
				margin-left: 10%;
			}`,
			{ mixins: mixins }
		);
	});
});