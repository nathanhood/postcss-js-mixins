const expect = require('chai').expect;
const postcss = require('postcss');
const plugin = require('./index.js');

function process(input, expected, opts = {}, warnings = 0) {
	return postcss([ plugin(opts) ]).process(input)
		.then(result => {
			expect(result.css).to.equal(expected);
			expect(result.warnings().length).to.equal(warnings);
		});
}