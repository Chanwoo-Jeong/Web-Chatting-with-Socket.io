const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const openroomList = document.getElementById("openroomList")
const showRoom = document.getElementById("showRoom")

room.hidden = true

let roomName;
function addMessage(message){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li)
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ChattingContent = showRoom.querySelector("#room ul")
  while (ChattingContent.hasChildNodes()) {
    ChattingContent.removeChild(ChattingContent.firstChild);
  }

  const input = form.querySelector("input");

  socket.emit("enter_room", input.value , () => {
   room.hidden = false
   const h3 = room.querySelector("h3")
   h3.innerText = `Room ${roomName}`
   const messageForm = room.querySelector("#msg")
   const nameForm = room.querySelector("#name")

   nameForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    const input = room.querySelector("#name input")
    socket.emit("nickname", input.value)
   })

   messageForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    const input = room.querySelector("#msg input")
    const value = input.value
    socket.emit("new_message",input.value,roomName,()=>{
        addMessage(`You : ${value}`)
    })
    input.value =""
   })
  });

  roomName = input.value
  input.value = "";
  //오픈채팅방 ui로 변경해주는 요소 landing.js파일확인하기
  removeActive(Layout)
    openRoomsLayout.classList.add("active")


});

socket.on("welcome", (user,newCount)=>{
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`Welcome ${user}`)
})

socket.on("bye", (left,newCount)=>{
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`Left ${left}`)
})

socket.on("new_message", (msg)=>{
    addMessage(msg)
})

socket.on("room_change", (msg)=> console.log(msg))

socket.on("room_change", (rooms)=>{
    const roomList = openroomList.querySelector("ul")
    roomList.innerHTML = ""
    if(rooms.length===0){
        return
    }
    rooms.forEach((roomN) =>{
        const li = document.createElement("button")
        li.innerText = roomN
        li.classList.add(roomN)

        li.addEventListener("click",()=>{

            // 모든 소켓 탈퇴
            console.log(socket.id)
            //roomN 이 아니라면 모두 나가기 = > server로 roomN보내기
            socket.emit("getout_room",roomN)

            //채팅내역 모두 삭제
            const ChattingContent = showRoom.querySelector("#room ul")
            while (ChattingContent.hasChildNodes()) {
                ChattingContent.removeChild(ChattingContent.firstChild);
              }

            socket.emit("enter_room", roomN , () => {
                room.hidden = false
                const h3 = room.querySelector("h3")
                h3.innerText = `Room ${roomN}`
                const messageForm = room.querySelector("#msg")
                const nameForm = room.querySelector("#name")
             
                nameForm.addEventListener("submit",(e)=>{
                 e.preventDefault()
                 const input = room.querySelector("#name input")
                 socket.emit("nickname", input.value)
                })
             
                messageForm.addEventListener("submit", (e)=>{
                 e.preventDefault()
                 const input = room.querySelector("#msg input")
                 const value = input.value
                 socket.emit("new_message",input.value,roomN,()=>{
                     addMessage(`You : ${value}`)
                 })
                 input.value =""
                })
               });
        })
        roomList.append(li)
    })
})