const express = require('express');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server)

const process = require("child_process");
const Path = require("path");

app.use(express.static('public'));
app.use("/monaco", express.static(Path.join(__dirname, "/node_modules/monaco-editor")));
app.use("/xterm", express.static(Path.join(__dirname, "node_modules/xterm")));
app.use("/xtermfit", express.static(Path.join(__dirname, "node_modules/xterm-addon-fit")));

process.exec(`chmod 777 ${Path.join(__dirname, "./lang/runtime")}`);

const stdios = {};

io.on("connection", socket => {
  socket.on("disconnect", () => {
    if (stdios.hasOwnProperty(socket.id))
      delete stdios[socket.id];
  });
  socket.on("termKey", key => {
    if (stdios.hasOwnProperty(socket.id)) {
      if (key == "\r") key = "\n\r";
      if (key == "\x7f") key = "\b \b";
      stdios[socket.id].stdin.write(key);
      socket.emit("termData", key);
    }
  });

  socket.on("run", code => {
    const runtime = Path.join(__dirname, "./lang/runtime");
    const d = process.spawn(runtime, ['-e', code]);
    stdios[socket.id] = d;
    d.stdout.on("data", data => {
      const code = data.toString().replace(/\n/g, "\r\n");
      socket.emit("termData", "\033[0m" + code);
    });
    d.on("exit", () => {
      socket.emit("termData", "\r\n");
      delete stdios[socket.id];
    });
  });
});

server.listen(3000, () => console.log('Listening on port 3000'));