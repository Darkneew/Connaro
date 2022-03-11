erroryet = false
window.onload = () => {
  var socket = io();
  socket.emit("loginConnection");
  socket.on("error1", (error) => {
    console.log(error)
    if (!erroryet) {
      erroryet = true;
      if (error) {
        alert(error);
      };
    }
  })
}