const homebtn = document.querySelector("#homebtn")
const openroom = document.querySelector("#openroom")

const StartChattingLayout = document.querySelector(".StartChatting")
const openRoomsLayout = document.querySelector(".openRooms")
const showRoomsLayout = document.querySelector(".showRoom")

const Layout = document.getElementsByClassName("Layout")
const removeActive = (arr) =>{
    for(const element of arr) {
        element.classList.remove("active")
    }
}
console.log(Layout)

homebtn.addEventListener("click",()=>{
    console.log(StartChattingLayout)
    removeActive(Layout)
    StartChattingLayout.classList.add("active")
})

openroom.addEventListener("click", ()=>{
    console.log(openRoomsLayout)
    removeActive(Layout)
    openRoomsLayout.classList.add("active")
})

