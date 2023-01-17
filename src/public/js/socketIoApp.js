const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

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
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value , () => {
   welcome.hidden = true
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
    const roomList = welcome.querySelector("ul")
    roomList.innerHTML = ""
    if(rooms.length===0){
        return
    }
    rooms.forEach((room) =>{
        const li = document.createElement("li")
        li.innerText = room
        roomList.append(li)
    })
})