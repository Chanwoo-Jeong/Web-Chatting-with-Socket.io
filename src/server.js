import http from "http";
import SocketIO from "socket.io";
import express from "express";
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(_,res)=> res.render("landing"))
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
  return publicRooms;
}

let joined = []

function countRoom(roomName){
  return wsServer.sockets.adapter.rooms.get(roomName).size;
}

wsServer.on("connection", (socket) => {
  joined.push(socket.id)
  console.log(wsServer.sockets.adapter.rooms)
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  //ZoomClone 처리 내용
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    joined.push(roomName)
    // console.log(wsServer.sockets.adapter.rooms)
    
    done();
    socket.to(roomName).emit("welcome", socket.nickname,countRoom(roomName));
    wsServer.sockets.emit("room_change",publicRooms())
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, (countRoom(room)-1))  
    );
  });
  socket.on("disconnect", ()=>{
    wsServer.sockets.emit("room_change",publicRooms())
  })
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  socket.on("getout_room",(roomN)=>{
    console.log(socket.id,roomN)
    console.log(joined)
    joined.forEach((item)=>{
      //해당 아이템이 소켓아이디 룸네임 둘중 어느것이라도 맞지 않을때 룸을 탈퇴한다.
      if(item === socket.id) return
      if(item === roomN) return
      socket.leave(item)
      console.log(`${item} 방은 고유아이디 혹은 룸네임과 같지 않아 나가겠습니다.!`)
      // if(item !== socket.id || item !== roomN){
      //   console.log(`${item} 방을 나가겠습니다!`)
      //   socket.leave(item)
      //   // joined = joined.filter((name)=> {
      //   //   if(name !== socket.id || name !== roomN) return false
      //   //   true
      //   // })
      //   // console.log(joined)
      // }
    })
    
    
  })
  //아래부터는 ChattingApp Kotlin
  socket.on("say",(chat)=>{console.log(chat)})
});
/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
}); */
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
