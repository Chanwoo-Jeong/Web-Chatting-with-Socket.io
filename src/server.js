import express from "express";
import http from "http";
import WebSocket from "ws";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 연결된 브라우저 모두에게 메세지를 보내기 위해 누가 연결되어 있는지 확인하는 코드
const sockets = [];

wss.on("connection", (socket) => {
  console.log(socket)
  sockets.push(socket);
  socket["nickname"] = "Anon"
  console.log("Connected to Browser");
  socket.on("close", () => console.log("Disconnected from Browser"));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) => aSocket.send(`${socket.nickname} : ${message.payload}`));
        break;
      case "nickname":
        socket["nickname"] = message.payload
        break;
    }
  });
  // socket.send("hello!!!!");
});

server.listen(3000, handleListen);
