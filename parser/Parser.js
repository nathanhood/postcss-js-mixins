const BaseParser = require('postcss/lib/parser');
const Comment = require('postcss/lib/comment');
const Mixin = require('./Mixin');

/**
 * Convert array of arguments into set of key: value pairs
 *
 * @param {array} args
 * @returns {object}
 */
function convertToObject(args) {
	let result = {};

	args.forEach((arg, i) => {
		if (Array.isArray(arg)) {
			result[arg[0]] = arg[1];
		} else {
			if (i % 2 === 0) {
				result[arg] = undefined;
			} else {
				result[args[i - 1]] = arg;
			}
		}
	});

	return result;
}

class Parser extends BaseParser {
	other() {
		var token = void 0;
		var end = false;
		var type = null;
		var colon = false;
		var bracket = null;
		var brackets = [];
		var hasBracket = false;

		var start = this.pos;

		while (this.pos < this.tokens.length) {
			token = this.tokens[this.pos];
			type = token[0];

			if (type === '(' || type === '[') {
				if (!bracket) bracket = token;
				brackets.push(type === '(' ? ')' : ']');
				hasBracket = true;
			} else if (type === 'brackets') {
				hasBracket = true;
			} else if (brackets.length === 0) {
				if (type === ';') {
					if (colon) {
						this.decl(this.tokens.slice(start, this.pos + 1));
						return;
					} else if (hasBracket) {
						this.mixin(this.tokens.slice(start, this.pos + 1));
						return;
					} else {
						break;
					}
				} else if (type === '{') {
					this.rule(this.tokens.slice(start, this.pos + 1));
					return;
				} else if (type === '}') {
					this.pos -= 1;
					end = true;
					break;
				} else if (type === ':') {
					colon = true;
				}
			} else if (type === brackets[brackets.length - 1]) {
				brackets.pop();
				if (brackets.length === 0) bracket = null;
			}

			this.pos += 1;
		}
		if (this.pos === this.tokens.length) {
			this.pos -= 1;
			end = true;
		}

		if (brackets.length > 0) this.unclosedBracket(bracket);

		if (end && colon) {
			while (this.pos > start) {
				token = this.tokens[this.pos][0];
				if (token !== 'space' && token !== 'comment') break;
				this.pos -= 1;
			}
			this.decl(this.tokens.slice(start, this.pos + 1));
			return;
		}

		this.unknownWord(start);
	}

	mixin(tokens) {
		let node = new Mixin(),
			last;

		this.init(node);

		last = tokens[tokens.length - 1];

		// Detect semi-colon at end of mixin
		if (last[0] === ';') {
			// TODO: this.semicolon is not being used in stringifier currently
			this.semicolon = true;
			tokens.pop();
		}

		// Establish end of mixin
		node.source.end = {
			line: last[2],
			column: last[3]
		};

		// Add raw 'before' characters
		while (tokens[0][0] !== 'word') {
			node.raws.before += tokens.shift()[1];
		}

		// Establish start of mixin
		node.source.start = {
			line: tokens[0][2],
			column: tokens[0][3]
		};

		// Define mixin name
		node.name = tokens.shift()[1];
		node.raws.between = '';

		this.raw(node, 'arguments', tokens);

		let value = this.mixinArguments(tokens);
		node.raws.arguments = { value: value, raw: tokens };
		node.arguments = value;
	}

	mixinArguments(tokens) {
		let args,
			objectArgs = false;

		if (tokens[0][0] === 'brackets') {
			args = tokens[0][1].replace(/^\(/, '')
				.replace(/\)$/, '')
				.split(',')
				.map(arg => {
					if (arg.includes(': ')) {
						objectArgs = true;
						return arg.split(': ').map(prop => {
							return prop.trim();
						});
					}

					return arg.trim();
				});
		} else if (tokens[0][0] === '(') {
			let string = '';

			args = [];

			tokens.shift();
			tokens.pop();

			for (let i = 0; i < tokens.length; i++) {
				let token = tokens[i],
					type = token[0];

				if (/^\s$|^,$/g.test(token[1])) {
					continue;
				}

				if (type === ':') {
					objectArgs = true;
				}

				// Concatenate font family argument together
				if (
					(type === 'word' || type === 'string') &&
					(args[args.length - 1] && tokens[i - 1][0] === 'space' && tokens[i - 2][0] !== ':') &&
					! tokens[i - 2][1].includes(',')
				) {
					args[args.length - 1] += (', ' + token[1].replace(/,$/, ''));
					continue;
				}

				if (type === 'word') {
					args.push(token[1].replace(/,$/, ''));
				}

				// Put CSS function as argument together
				if (type === '(' || type === ')') {
					args[args.length - 1] += token[1];
				}

				if (type === 'string') {
					// Put CSS function as argument together
					if (tokens[i - 1] && tokens[i - 1][0] === '(') {
						args[args.length - 1] += token[1];
					} else {
						args.push(token[1]);
					}
				}

				if (type === 'brackets') {
					if (tokens[i - 1] && tokens[i - 1][0] === 'word') {
						// Put CSS function as argument together
						args[args.length - 1] += token[1];
					} else {
						args.push(token[1]);
					}
				}
			}
		}

		if (objectArgs) {
			args = [convertToObject(args)];
		}

		return args;
	}
}

module.exports = Parser;