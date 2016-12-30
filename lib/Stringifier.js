'use strict';

const BaseStringifier = require('postcss/lib/stringifier');

class Stringifier extends BaseStringifier {
	mixin(node) {
		let string = node.name + '(' + node.arguments.join(', ') + ');';

		this.builder(string, node);
	}
}

module.exports = Stringifier;