window.onload = function() {
  var switchValue = false;
  function newPost (author, email, text, title) { // Create the new message object
    const postbox = document.getElementById("postbox")
    let span1 = document.createElement("span");
    span1.setAttribute("class","keypost");
    span1.appendChild(document.createTextNode("Name: "));
    let span2 = document.createElement("span");
    span2.setAttribute("class","valuepost");
    span2.appendChild(document.createTextNode(author));
    let p1 = document.createElement("p");
    p1.setAttribute("class","mb-3");
    p1.appendChild(span1);
    p1.appendChild(span2);
    let span3 = document.createElement("span");
    span3.setAttribute("class","keypost");
    span3.appendChild(document.createTextNode("Email: "));
    let span4 = document.createElement("span");
    span4.setAttribute("class","valuepost");
    span4.appendChild(document.createTextNode(email));
    let p2 = document.createElement("p");
    p2.setAttribute("class","mb-3");
    p2.appendChild(span3);
    p2.appendChild(span4);
    let p3 = document.createElement("p");
    p3.appendChild(document.createTextNode(text));
    let h3 = document.createElement("h3");
    h3.appendChild(document.createTextNode(title));
    h3.setAttribute("class","mb-3");
    let subdiv = document.createElement("div");
    subdiv.setAttribute("class","col-xl-8 about-right border-bottom");
    subdiv.appendChild(h3);
    subdiv.appendChild(p1);
    subdiv.appendChild(p2);
    subdiv.appendChild(p3);
    let div = document.createElement("div");
    if (switchValue) {
      div.setAttribute("class","d-xl-flex about-grids");
      switchValue = false;
    } else {
      div.setAttribute("class","d-xl-flex about-grids flex-row-reverse");
      switchValue = true;
    } 
    div.appendChild(subdiv);
    return div;
  }
  var myName = false;
  var myEmail = false;
  var socket = io();
  socket.emit("helpConnection");
  socket.on("infos", (infos)=> {
    if (!myName && !myEmail) {
      myName = infos[0][0][0];
      myEmail = infos[0][0][1];
      infos[1].forEach((post)=>{
        if(postbox.hasChildNodes) postbox.insertBefore(newPost(post[0],post[1],post[2],post[3]), postbox.childNodes[0]);
        else postbox.appendNode(newPost(post[0],post[1],post[2],post[3]))
      })
    }
  })
  const form = document.getElementById("postform");
  const titleinput = document.getElementById("formTitle");
  const textinput = document.getElementById("formText");
  form.addEventListener("submit", (e)=> {
    e.preventDefault();
    postbox.insertBefore(newPost(myName, myEmail, textinput.value, titleinput.value), postbox.childNodes[0]);
    socket.emit("newPost",[myName, myEmail, textinput.value, titleinput.value]);
    window.location.href = "#close";
    return true;
  });
  socket.on("receivePost", post => {
    postbox.insertBefore(newPost(post[0],post[1],post[2],post[3]), postbox.childNodes[0]);
  })
}