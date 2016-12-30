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
                        return { prop: 'background', value: color };
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

    // Should throw warning if mixin not found
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