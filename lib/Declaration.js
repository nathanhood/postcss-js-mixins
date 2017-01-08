const h = require('./helpers');

class Declaration {
	constructor(prop, value) {
		this.type = 'declaration';

		this.prop = prop;
		this.value = h.unit(value, prop);
	}

	/**
	 * Build many declarations from object
	 *
	 * @param  {Object} properties
	 * @param  {Array} ignored
	 * @return {Array}
	 */
	static createManyFromObj(properties, prefix = false, ignored = []) {
		let props = [];

		for (let property in properties) {
			let value = properties[property];

			props.push(
				new this(h.prefix(property, prefix, ignored), value)
			);
		}

		return props;
	}

	/**
	 * Builds an array of supplied properties and values.  This function
	 * assumes that there are the same number of values as properties
	 * and that the properties array is in the correct order relative it's
	 * value
	 *
	 * @param  {Array} props - array of properties
	 * @param  {Array|String} values - array of values
	 * @return {Array}
	 */
	static createMany(props, values) {
		let arr = [],
			i = 0;

		if (h.isString(values)) {
			for (; i < props.length; i++) {
				arr.push(new this(props[i], values));
			}
		} else {
			for (; i < values.length; i++) {
				arr.push(new this(props[i], values[i]));
			}
		}

		return arr;
	}
}

module.exports = Declaration;