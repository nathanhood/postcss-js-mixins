'use strict';

const postcss = require('postcss');

module.exports = postcss.plugin('postcss-js-mixins', (options = {}) => {
	let mixins = options.mixins || {};

	/**
	 * Evaluate mixin
	 *
	 * @param {object} node - postcss.Node
	 * @param {object} result - postcss.Result
	 * @returns {array|object}
	 */
	function evalMixin(node, result) {
		let segs = node.name.split('.'),
			key = segs.shift(),
			mixin = mixins[key];

		while (segs.length && mixin.hasOwnProperty(segs[0])) {
			mixin = mixin[segs[0]];
			segs.shift();
		}

		if (! mixin || segs.length) {
			node.warn(result, 'Mixin not found.');
			return [];
		}

		return mixin.apply(mixins, node.arguments);
	}

	/**
	 * Create many declarations from one mixin result
	 *
	 * @param {array} data
	 * @param {object} node - postcss.Mixin
	 */
	function createDeclarations(data, node) {
		return data.map(decl => {
			return createDeclaration(decl, node);
		});
	}

	/**
	 * Create postcss declaration with meta info from mixin
	 *
	 * @param {object} data
	 * @param {object} node - postcss.Mixin
	 * @returns {Declaration}
	 */
	function createDeclaration(data, node) {
		return postcss.decl({
			prop: data.prop,
			value: data.value,
			raws: Object.assign({}, node.raws),
			parent: node.parent
		});
	}

	return (root, result) => {
		root.walk(node => {
			if (node.type === 'mixin') {
				let results = evalMixin(node, result);

				if (Array.isArray(results)) {
					node.replaceWith(createDeclarations(results, node));
				} else {
					node.replaceWith(createDeclaration(results, node));
				}
			}
		});
	};
});