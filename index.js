'use strict';

const postcss = require('postcss');
const helpers = require('./lib/helpers');

module.exports = postcss.plugin('postcss-js-mixins', (options = {}) => {
	let mixins = options.mixins || {};

	if (options.units) {
		helpers.setDefaultUnits(options.units);
	}

	function isNumber(value) {
		let val = parseFloat(value);

		return ! isNaN(val) && isFinite(val) && ! /[^\d.]/.test(value);
	}

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
			mixin = mixins[key],
			args = node.arguments.map(arg => {
				if (isNumber(arg)) {
					return parseFloat(arg);
				} else if (typeof arg === 'string') {
					return arg.length ? arg : undefined;
				}

				return arg;
			});

		while (segs.length && mixin.hasOwnProperty(segs[0])) {
			mixin = mixin[segs[0]];
			segs.shift();
		}

		if (! mixin || segs.length) {
			node.warn(result, 'Mixin not found.');
			return [];
		}

		return mixin.apply(mixins, args);
	}

	/**
	 * Create many declarations/rules from one mixin result
	 *
	 * @param {array} data
	 * @param {object} node - postcss.Mixin
	 */
	function createNodes(data, node) {
		return data.map(obj => {
			return createNode(obj, node);
		});
	}

	function createNode(obj, node) {
		if (obj.type === 'rule') {
			return createRule(obj.selector, obj.declarations, node);
		}

		return createDeclaration(obj.prop, obj.value, node);
	}

	/**
	 * Create postcss declaration with meta info from mixin
	 *
	 * @param {string} selector
	 * @param {Array} declarations - one or many postcss.Declaration
	 * @param {object} node - postcss.Mixin
	 * @returns {Rule}
	 */
	function createRule(selector, declarations, node) {
		let rule = postcss.rule({
			selector: selector,
			parent: node.parent,
			source: node.source
		});

		declarations.forEach(decl => {
			rule.append(createDeclaration(decl.prop, decl.value, node));
		});

		return rule;
	}

	/**
	 * Create postcss declaration with meta info from mixin
	 *
	 * @param {string} prop
	 * @param {string|number} value
	 * @param {object} node - postcss.Mixin
	 * @returns {Declaration}
	 */
	function createDeclaration(prop, value, node) {
		let decl = postcss.decl({
			prop: prop,
			value: value,
			parent: node.parent,
			source: node.source
		});

		return decl;
	}

	return (root, result) => {
		root.walk(node => {
			if (node.type === 'mixin') {
				let results = evalMixin(node, result);

				// Remove mixin from CSS
				// Accounting for conditional mixin logic
				if (results === false) {
					return node.remove();
				}

				if (Array.isArray(results)) {
					if (! results.length) {
						return;
					}

					node.replaceWith(createNodes(results, node));
				}

				node.replaceWith(createNode(results, node));
			}
		});
	};
});