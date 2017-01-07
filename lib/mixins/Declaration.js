const helpers = require('./helpers');

class Declaration {
	constructor(prop, value) {
		this.type = 'declaration';

		this.prop = prop;
		this.value = helpers.unit(value, prop);
	}
}

module.exports = Declaration;