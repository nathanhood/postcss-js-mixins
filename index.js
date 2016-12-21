const postcss = require('postcss');

module.exports = postcss.plugin('postcss-mixins', (opts = {}) => {
	return (root, result) => {
		root.walk(node => {
			// TODO: add new declaration and pass properties from mixin to declaration
			// TODO: remove mixin
			// let decl = new Declaration;

			if (node.type === 'mixin') {

			}
		});
	};
});