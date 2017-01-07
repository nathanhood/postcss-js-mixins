const { darken } = require('./colorHelpers');

let variables = {
	unit: {
		default: 'rem',
		fontSize: 'rem',
		lineHeight: 'em'
	},
	root: {
		fontSiz: '62.5%'
	},
	block: {
		margin: {
			bottom: 2
		}
	},
	grid: {
		margin: '5%',
		columns: 8
	},
	colors: {
		default: {
			border: darken('#fff', 25)
		},
		primary: '#349bb9',
		secondary: '#70c1b3',
		tertiary: '#f18f01',
		info: '#00f',
		success: '#008000',
		warning: '#f00',
		white: '#fff',
		lightestGray: darken('#fff', 4),
		lighterGray: darken('#fff', 10),
		lightGray: darken('#fff', 25),
		gray: darken('#fff', 35),
		darkGray: darken('#fff', 55),
		darkerGray: darken('#fff', 65),
		darkestGray: darken('#fff', 75),
		black: '#000',
		body: {
			background: '#fff'
		}
	},
	font: {
		weight: {
			bold: 600
		}
	}
};

module.exports = variables;