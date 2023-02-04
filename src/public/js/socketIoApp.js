const socket = io();

const welcome = document.getElementById("welcome"); //chatRoom 만드는 div
const form = welcome.querySelector("form"); //chatRoom form
const room = document.getElementById("room"); // chatting Room
const openroomList = document.getElementById("openroomList"); //열려있는 채팅룸
const showRoom = document.getElementById("showRoom"); // 채팅방 전체 div

room.hidden = true;

//현재 룸이름 여기서 자신의 현재위치를 파악
let roomName;

function addMessage(message, location) {
  const ul = room.querySelector("#ChatBox");
  const box = document.createElement("div");
  const li = document.createElement("div");
  box.appendChild(li);
  box.style.display = "flex";
  if(location === "Right"){
    box.style.justifyContent = "flex-end"
  }
  li.innerText = message;
  li.classList.add(location);
  ul.appendChild(box);
}

//채팅방 생성기
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ChattingContent = showRoom.querySelector("#ChatBox");
  while (ChattingContent.hasChildNodes()) {
    ChattingContent.removeChild(ChattingContent.firstChild);
  }

  const input = form.querySelector("input");
  roomName = input.value;

  socket.emit("enter_room", input.value, () => {
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
  });
  input.value = "";
  //오픈채팅방 ui로 변경해주는 요소 landing.js파일확인하기
  removeActive(Layout);
  openRoomsLayout.classList.add("active");
});

// 닉네임과 , 메세지 보내는 역할
const messageForm = room.querySelector("#msg");
const nameForm = room.querySelector("#name");

//닉네임 설정기
nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
});

//메세지 전송하기
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  const roomNumber = room.querySelector("#roomNumber");
  console.log(roomNumber);
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    console.log(`${roomName}로 보내짐`);
    addMessage(`You : ${value}`, "Left");
  });
  input.value = "";
});

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`Welcome ${user}`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`Left ${left}`);
});

socket.on("new_message", (msg, loc) => {
  addMessage(msg, loc);
});

socket.on("room_change", (msg) => console.log(msg));

socket.on("room_change", (rooms) => {
  const roomList = openroomList.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((roomN) => {
    const li = document.createElement("button");
    li.innerText = roomN;
    li.classList.add(roomN);

    li.addEventListener("click", () => {
      //채팅내역 모두 삭제
      const ChattingContent = showRoom.querySelector("#ChatBox");
      while (ChattingContent.hasChildNodes()) {
        ChattingContent.removeChild(ChattingContent.firstChild);
      }
      roomName = roomN;

      socket.emit("enter_room", roomN, () => {
        room.hidden = false;
        const h3 = room.querySelector("h3");
        h3.innerText = `Room ${roomN}`;
      });
    });
    roomList.append(li);
  });
});
