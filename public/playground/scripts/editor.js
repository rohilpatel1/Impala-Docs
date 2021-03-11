const socket = io(window.location.origin);
require.config({ paths: { 'vs': '/monaco/min/vs' }});

require(['vs/editor/editor.main'], () => {
  impala();

  const examples = {
    ex1: `make hie(x = 5, y) oftype string {
  log(x);
  log(y);

  send "Hi"; $ return value "Hi"
};

make y oftype string = hie(,"Hello");
log(y);

make z oftype function;
z = hie;
z(6,"Test");

if (4 == 4) {
  log("Four does equal four");
}

if 2 == 5: log("Hi"); else: log("Else");

log("Testing");

make factorial(x oftype number) oftype number {
  if x == 1: send 1;

  send x * factorial(x - 1);
}

log("Factorial of 5 is", factorial(5));

make x = input("What's Your Name? ");
log("Hi", x);`
  }
  
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: examples.ex1,
    language: 'impala'
  });

  const term = new Terminal();
  const fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);

  let valLength = 0;

  const printables = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-=!@#$%^&*()_+~`[]\\{}|\'\":/.>,<? "; // I know regex exists but idc

  // Open the terminal in #terminal-container
  term.open(document.getElementById('terminal'));
  term.onKey((e) => {
    const { key } = e;
    if (key == "\x7f")
      valLength--;
    else if (printables.includes(key))
      valLength++;
    else if (key == "\n" || key == "\r") valLength = 0;

    if (key == "\n" || valLength >= 0)
      socket.emit("termKey", key);

    if (valLength < 0) valLength = 0;
  });

  socket.on("termData", data => {
    term.write(data);
  });

  // Make the terminal's size and geometry fit the size of #terminal-container
  fitAddon.fit();

  document.getElementById("run").addEventListener("click", () => {
    socket.emit("run", editor.getValue());
  });

  window.addEventListener("resize", () => {
    editor.layout();
    fitAddon.fit();
  });
});