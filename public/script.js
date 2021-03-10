const codeBlock = document.querySelector("code.block");
codeBlock.innerText = `
make factorial(x oftype number) oftype number {
  if x == 1: send 1;

  send x * factorial(x - 1);
}

factorial(5); 

$outputs: 120
`;

window.addEventListener("DOMContentLoaded", () => {
  highlighter.defineLanguage("imp", {
    name: "Impala",
    syntax: {
      whitespace: ["\t", " ", "\n"],
      inlineComment: /\$.*/,

      keywords: ["make", "true", "false", "if", "else", "return", "while", "for", "break", "continue", "oftype", "send"],
      datatypes: ["function", "string", "number", "nothing", "any"],

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
      datatypes: "green",
      operators: "default", // Can also be ommited
      strings: "default",
      numbers: "default",
    }
  });

  highlighter.highlightAll();
})

window.addEventListener("scroll", () => {
  const scroll = window.scrollY;
  const navbar = document.querySelector("#navbar");

  if (scroll > 227.516) 
    navbar.classList.add("shadow")
  else 
    navbar.classList.remove("shadow");
});