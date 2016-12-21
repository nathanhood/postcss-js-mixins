const BaseParser = require('postcss/lib/parser');
const Comment = require('postcss/lib/comment');
const Mixin = require('./Mixin');

class Parser extends BaseParser {
	comment(token) {
		let node = new Comment();

		this.init(node, token[2], token[3]);

		node.source.end = { line: token[4], column: token[5] };

		let text = token[1].slice(2);

		if (text.slice(-2) === '*/') {
			text = text.slice(0, -2);
		}

		if (/^\s*$/.test(text)) {
			node.text = '';
			node.raws.left = text;
			node.raws.right = '';
		} else {
			let match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);

			node.text = match[2];
			node.raws.left = match[1];
			node.raws.right = match[3];
		}
	}

	other() {
		var token = void 0;
		var end = false;
		var type = null;
		var colon = false;
		var bracket = null;
		var brackets = [];

		var start = this.pos;

		while (this.pos < this.tokens.length) {
			token = this.tokens[this.pos];
			type = token[0];

			if (type === '(' || type === '[') {
				if (!bracket) bracket = token;
				brackets.push(type === '(' ? ')' : ']');
			} else if (brackets.length === 0) {
				if (type === ';') {
					if (colon) {
						this.decl(this.tokens.slice(start, this.pos + 1));
						return;
					} else {
						this.mixin(this.tokens.slice(start, this.pos + 1));
						return;
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
			this.semicolon = true;
			tokens.pop();
		} else {
			throw this.input.error('Missed semicolon', last[2], last[3]);
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

		// TODO: Inspect that more does not need to be done to postcss.NodeRaws
		let value = this.mixinArguments(tokens);
		node.raws.arguments = { value: value, raw: tokens };
		node.arguments = value;
	}

	mixinArguments(tokens) {
		let args;

		if (tokens[0][0] === 'brackets') {
			args = tokens[0][1].replace(/^\(/, '')
				.replace(/\)$/, '')
				.split(',')
				.map(arg => {
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

				if (type === 'word') {
					args.push(token[1]);
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

		return args;
	}
}

module.exports = Parser;