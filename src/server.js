import http from "http";
import SocketIO from "socket.io";
import express from "express";
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("landing"));
// app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  console.log(publicRooms);
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName).size;
}

wsServer.on("connection", (socket) => {
  console.log(wsServer.sockets.adapter.rooms);
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  //기본 오픈채팅방 동기화
  setInterval(() => {
    wsServer.sockets.emit("room_change", publicRooms());
  }, 3000);

  //ZoomClone 처리 내용
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    publicRooms().forEach((Proom) => {
      if (Proom !== roomName) {
        console.log(`${Proom}을 나갑니다!`);
        socket.leave(Proom);
      }
    });
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    publicRooms().forEach((Proom) => {
      if (Proom !== room) {
        console.log(`${Proom}을 나갑니다!`);
        socket.leave(Proom);
      }
    });
    console.log(`new messages ===> ${room}`);
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

  //아래부터는 ChattingApp Kotlin
  socket.on("say", (chat) => {
    console.log(chat);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
