self.onerror=alert;

const r = String.raw;

// xh: I have looked upon this monstrosity... I am sickened. It also won't work because the server doesn't server HTML (cough* innerHTML; epic fail)

// Yea i'll fix this up when I have time
// Also no module support on safari apparently
// Either that or its because something is just broken
// Sure about that? Something's probably broken... https://caniuse.com/?search=javascript%20module

// also, I updated this JS to querySelect the updated element, but it seems that something else is off, pretty sure it has to do with the CSS, I edited the CSS and document so...

/**
 * @typedef LangSyntaxConfig {object}
 * 
 * @property whitespace {string[]} - An array of different whitespace codes or text.
 * @property inlineComment {RegExp} - A regular expression of an inline comment.
 * @property keywords {string[]|{ color: string; value: string; }} - An array of different keywords. Can be an object with a color and a value.
 * @property datatypes {string[]|{ color: string; value: string; }} - An array of different datatypes. Can be an object with a color and a value.
 * @property operators {string[]|{ color: string; value: string; }} - An array of different operators. Can be an object with a color and a value.
 * @property delimiters {string[]|{ color: string; value: string }} - An array of different delimiters. Can be an object with a color and a value.
 * @property identifiers {RegExp} - A regular expression for identifiers. Identifiers will be tokenized last.
 * @property escapes {RegExp} - A regular expression for escape sequences for strings.
 * @property strings {Array<{ begin: string; end: string; }>} - An array of objects with a beginning and end.
 * @property numbers {RegExp} - A regular expression for tokenizing numbers.
 */

/**
 * @typedef LangGrammar {object}
 * 
 * @property name {string} - The name of the language (doesn't really do anything. Can be ommited).
 * @property syntax {LangSyntaxConfig} - The basic syntax for the language.
 * @property color { { comments: string; whitespace: string; keywords: string; datatypes: string; operators: string; strings: string; numbers: string; delimiters: string; identifiers: string; } } - The colors for your different tokens. This will display the token with the color in the code block.
 */

/**
 * The main highlighter module
 * 
 * @type {{
 *   languages: { [x: string]: LangGrammar };
 *   defineLanguage: (name: string, data: LangGrammar) => void;
 *   highlight: (content: string, lang: string) => string;
 *   init: () => void;
 *   highlightAll: () => void;
 * }}
 */

const highlighter = {
	languages: {}
};

highlighter.initialize = (() => {

	class Token {
		constructor(type, value, index, color) {
			this.type = type;
			this.value = value;
			this.index = index;
			this.length = value.length;

			this.color = color;
		}
	}

	/**
	 * Define a custom language for the highlighter
	 * 
	 * @param name {string} - The name of the language
	 * @param data {LangGrammar} - The grammar and syntax of the language
	 */
	highlighter.defineLanguage = (name, data) => {
		highlighter.languages[name] = data;
	}

	/**
	 * Highlight some code with the provided language
	 * 
	 * @param content {string} - The content to be highlighted
	 * @param lang {string} - The language name to be stored
	 */
	highlighter.highlight = (content, lang) => {
		content = content.trim();

		const langData = highlighter.languages[lang];

		const colors = {
			comments: "default",
			whitespace: "default",
			keywords: "default",
			datatypes: "default",
			operators: "default",
			strings: "default",
			numbers: "default",
			delimiters: "default",
			identifiers: "default",
			...(langData.color ?? {})
		};

		const {
			whitespace = [],
			keywords = [],
			datatypes = [],
			operators = [],
			strings = [],
			delimiters = [],
			identifiers,
			numbers,
			inlineComment
		} = langData.syntax;

		const tokenList = [];

		const regexEscapes = /\(|\)|\+|\-|\*|\/|\^|\|\||\&|\&\&|\$|\%|\.|\[|\]|\{|\}| |\n|\t/g

		// this can totally be automated instead
		/*
		function replaceOperators(match) {
			const operators = [ "+", "-", "*", "/", "%", "^", "||", "&&", "&", ".", "(", ")", "[", "]", "{", "}", "$", ";", " ", "\n", "\t" ];
	
			const exceptions = {
				' ': "\\s",
			};
	
			if ( match in exceptions ) {
				return exceptions[ match ];
			} else {
				return operators.indexOf( match ) === -1
					? match
					: [ ...match ].map( char => "\\" + char ).join( "" );
			}
		}
		*/
		function replaceOperators(match) {
			const operators = {
				"+": "\\+",
				"-": "\\-",
				"*": "\\*",
				"/": "\\/",
				"%": "\\%",
				"^": "\\^",
				"||": r`\|\|`,
				"&&": r`\&\&`,
				"&": "\\&",
				".": "\\.",
				"(": "\\(",
				")": "\\)",
				"[": "\\[",
				"]": "\\]",
				"{": "\\{",
				"}": "\\}",
				"$": "\\$",
				";": "\\;",
				" ": "\\s",
				"\n": "\\n",
				"\t": "\\t"
			};

			return operators.hasOwnProperty(match)
				? operators[match]
				: match;
		}

		function matchWord(type, word, color) {
			let match = content.match(word);
			for (let i = 0; match; ++i) {
				const token = new Token(type, match[0], match.index, color);
				tokenList.push(token);
				content = content.substring(0, token.index) + token.value.replace(/.|[\S\s]/g, "\b") + content.substring(token.index + token.length);

				match = content.match(word);

				if (i > 1000) {
					console.log(content, token, word, type);
					match = null;
				}
			}
		}

		function lexicalMatch(obj) {
			const type = obj.type;
			let first = true;
			let match;
			match = matchAll();

			function matchAll() {
				if (type == "String") {
					return matchString();
				} else if (type == "Number") {
					return matchNumber();
				} else if (type == "Identifier") {
					return matchIdentifier();
				} else if (type == "Comment") {
					return matchComment();
				}
			}

			/* alternative?
			const matchAll = () => ({
				"String": matchString,
				"Number": matchNumber,
				"Identifier": matchIdentifier,
				"Comment": matchComment
			})[ type ]();
			*/

			function matchItem(regex) {
				if (!first) {
					const token = new Token(obj.type, match[0], match.index);
					tokenList.push(token);

					content = content.substring(0, token.index) + token.value.replace(/.|[\S\s]/g, "\b") + content.substring(token.index + token.length);
				} else {
					first = false;
				}

				match = content.match(regex);
				return match;
			}

			function matchString() {
				const regex = new RegExp(r`${obj.begin}([^\\]|\\[a-z0-9\"\'\`])*?${obj.end}`);

				return matchItem(regex);
			}

			function matchIdentifier() {
				const { regex } = obj;

				return matchItem(regex);
			}

			function matchComment() {
				const { regex } = obj;

				return matchItem(regex);
			}

			function matchNumber() {
				const { regex } = obj;

				return matchItem(regex);
			}

			while (match) {
				matchAll();
			}
		}

		function getColor(token) {
			const typeMap = {
				"Comment": "comments",
				"Whitespace": "whitespace",
				"Keyword": "keywords",
				"Datatype": "datatypes",
				"Operator": "operators",
				"Delimiter": "delimiters",
				"String": "strings",
				"Number": "numbers",
				"Identifier": "identifiers"
			};

			const color = token.color || colors[typeMap[token.type]].toLowerCase();

			if (color.toLowerCase() == "default") {
				return "";
			}

			return `color: ${color} !important;`;
		}

		for (const string of strings) {
			if (typeof string == "object") {
				lexicalMatch({ type: "String", ...string });
			}
		}

		lexicalMatch({ type: "Comment", regex: inlineComment });

		for (const i in keywords) {
			const item = keywords[i];

			const [ keyword, color ] =
				typeof item == "object"
					? [ item.value, item.color ]
					: [ item, "" ];

			matchWord("Keyword", keyword, color);
		}

		// Object.entries(datatypes)
		// for (const item of datatypes) 
		for ( const i in datatypes ) {
			const item = datatypes[i];

			const [ datatype, color ] =
				typeof item === "object"
					? [ item.value, item.color ]
					: [ item, "" ];

			matchWord(
				"Datatype",
				datatype,
				color
			);
		}

		for (const i in operators) {
			const item = operators[i];

			const [ operator, color ] =
				typeof item === "object"
					? [ item.value, item.color ]
					: [ item, "" ];

			matchWord(
				"Operator",
				operator.replace(regexEscapes, replaceOperators),
				color
			);
		}

		lexicalMatch({ type: "Number", regex: numbers });
		for (const i in delimiters) {
			const item = delimiters[i];

			const [ delimiter, color ] =
				typeof item === "object"
					? [ item.value, item.color ]
					: [ item, "" ];

			matchWord("Delimiter", delimiter.replace(regexEscapes, replaceOperators
			), color);
		}

		lexicalMatch({ type: "Identifier", regex: identifiers });

		for (const item of whitespace) {
			// console.log(item.replace(regexEscapes, replaceOperators));
			matchWord("Whitespace", item.replace(regexEscapes, replaceOperators))
		}

		tokenList.sort(
			(tok1, tok2) => tok1.index - tok2.index
		);

		let last = "";

		for (const token of tokenList) {
			const text = `<span class="${token.type.toLowerCase()}" style="${getColor(token)}">${token.value}</span>`;
			const lastLength = last.length;

			content = content.slice(0, token.index + lastLength) + text + content.slice(token.index + lastLength + token.length);
			last += text;
		}

		return content.replaceAll("\b", "");
	}

	/**
	 * Initialize the highlighter
	 */
	highlighter.init = () => {
		highlighter.defineLanguage("js", {
			name: "javascript",
			syntax: {
				whitespace: ["\t", " ", "\n"],
				inlineComment: /\/\/.*/,

				keywords: ["function", "let", "var", "const", "true", "false", "if", "else", "return", "while", "for", "of", "in", "break", "continue"],
				datatypes: [],

				operators: ["=", "==", "===", "+=", "-=", "*=", "/=", "%=", "!=", "!==", "!", "<", ">", ">=", "<=", "*", "/", "%", "+", "-"],

				delimiters: ["(", ")", "{", "}", ";", ".", ":", "[", "]"],
				identifiers: /[_$#\w][_$#\w\d]*/,

				escapes: /\\"|\\'|\\`/,

				strings: [
					{
						begin: "\"",
						end: "\""
					},
					{
						begin: "'",
						end: "'"
					},
					{
						begin: "`",
						end: "`"
					}
				],

				numbers: /\d+(\.\d+)?/,

			},
			color: {
				keywords: "blue",
				datatypes: "blue",
				operators: "default", // Can also be ommited
				strings: "default",
				numbers: "default",
			}
		});
	}

	/**
	 * Highlight every single element with the class ".clode-block"
	 */
	highlighter.highlightAll = () => {
		const editors = document.querySelectorAll("code.block"); // updated

		for (const editor of editors) {
			// insteanceof Element
			if (editor instanceof HTMLElement) {
				const lang = editor.getAttribute("data-lang");

        if (!lang) continue;

				const content =
					editor.innerText =
					editor.innerText.trim();

				if (highlighter.languages.hasOwnProperty(lang)) {
					const highlights = highlighter.highlight(content, lang);
          editor.innerHTML = highlights;
				}
			}
		}
	}

	highlighter.init();
})();