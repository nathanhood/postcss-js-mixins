const helpers = require('./helpers');

class Rule {
	constructor(selector, declarations) {
		this.type = 'rule';

		this.selector = selector;
		this.declarations = declarations;
	}
}

module.exports = Rule;