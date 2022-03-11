window.onload = () => { // Quand le document charge
  const onlineElement = document.getElementById("online");
  var myName = false;
  const form = document.getElementById("formheader");
  const sendInput = document.getElementById("input")
  function newMessage (author, text, bool = true) { // Create the new message object
    const title = document.createElement("h7").appendChild(document.createTextNode(author));
    const textnode = document.createElement("p");
    textnode.setAttribute("class", "little")
    textnode.appendChild(document.createTextNode(text));
    const subdiv = document.createElement("div");
    subdiv.setAttribute("class", "col-xl-8 about-right border-bottom littlebox");
    subdiv.appendChild(title);
    subdiv.appendChild(textnode);
    const div = document.createElement("div");
    div.appendChild(subdiv);
    if (bool) div.setAttribute("class","d-xl-flex about-grids");
    else div.setAttribute("class", "d-xl-flex about-grids flex-row-reverse");
    return div;
  }
  const chatbox = document.getElementById("chatbox");
  var socket = io();
  socket.emit("newConnection")
  socket.on("name", (name)=> {
    if (!myName) {
      myName = name[0][0];
      name[1].forEach((message)=>{
        if(chatbox.hasChildNodes) chatbox.insertBefore(newMessage(message[1],message[0]), chatbox.childNodes[0]);
        else chatbox.appendNode(newMessage(message[1],message[0]))
      })
    }
  })
  socket.on("online",(nb)=> {onlineElement.innerHTML = nb});
  socket.on("receiveMessage", (message)=> {
    chatbox.insertBefore(newMessage(message[1], message[0]),chatbox.childNodes[0])
  })
  form.addEventListener("submit", (e)=> {
    e.preventDefault();
    chatbox.insertBefore(newMessage(myName, sendInput.value, false), chatbox.childNodes[0]);
    socket.emit("newMessage",[sendInput.value, myName]);
    sendInput.value = ""
    return true;
  });
}