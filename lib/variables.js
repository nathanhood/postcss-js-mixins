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
}

function shade(direction, color, percent) {
	if (color.length === 4) {
		color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
	}

    var R = parseInt(color.substring(1,3),16),
    	G = parseInt(color.substring(3,5),16),
    	B = parseInt(color.substring(5,7),16);

    if (direction === 'darken') {
    	R = parseInt(R * (100 - percent) / 100);
	    G = parseInt(G * (100 - percent) / 100);
	    B = parseInt(B * (100 - percent) / 100);
    } else {
    	R = parseInt(R * (100 + percent) / 100);
    	G = parseInt(G * (100 + percent) / 100);
    	B = parseInt(B * (100 + percent) / 100);
    }

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    var RR = ((R.toString(16).length == 1) ? '0' + R.toString(16) : R.toString(16)),
    	GG = ((G.toString(16).length == 1) ? '0' + G.toString(16) : G.toString(16)),
    	BB = ((B.toString(16).length == 1) ? '0' + B.toString(16) : B.toString(16));

    return '#'+ RR + GG + BB;
}

function lighten(color, percent) {
	return shade('lighten', color, percent);
}

function darken(color, percent) {
	return shade('darken', color, percent);
}

module.exports = variables;