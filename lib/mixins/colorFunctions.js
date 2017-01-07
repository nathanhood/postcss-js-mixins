/**
 * Calculate darker shade of color
 *
 * @param {string} color - hex value
 * @param {number} percent
 * @returns {string}
 */
function darken(color, percent) {
	return shade('darken', color, percent);
}

/**
 * Calculate lighter shade of provided color
 *
 * @param {string} color - hex value
 * @param {number} percent
 * @returns {string}
 */
function lighten(color, percent) {
	return shade('lighten', color, percent);
}

/**
 * Calculate color that is % different than provided
 *
 * @param {string} direction
 * @param {string} color - hex value
 * @param {number} percent
 * @returns {string}
 */
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

module.exports = {
	darken: darken,
	lighten: lighten
};