//SETUP AND REQUIRE
const express = require('express');
var registerError = [];
var lastmessages = [["Hello","Darknew"],["Welcome to this chatting app","Darknew"],["The website has just been launched by someone, which is why there are few or no messages yet","Darknew"]];
var chatName = [];
const fs = require("fs");
var mediaUsers = [];
const http = require('http');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
async function initialize(passport, getUserByName, getUserById) {
  const authenticateUser = async (name, password, done) => {
    getUserByName(name).then(async (user)=> {
    if (user == null) {
      registerError.push("There is no user with that name");
      return done(null, false, { message: 'No user with that name' })
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        registerError.push("The password is incorrect");
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  })
  }
  let db = new sqlite3.Database('./database.db');
  db.all("SELECT * FROM users", [], (err, rows) => {
  if (err) return console.log(err);
  passport.use(new LocalStrategy({ usernameField: 'name' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(rows, id))
  })
  })
}
const passport = require('passport');
const path = require('path');
const socketIO = require('socket.io'); 
const app = express();
const methodOverride = require('method-override');
const server = http.Server(app);
const io = socketIO(server);
const getUserByName = async (name) => {
  let db = new sqlite3.Database('./database.db');
  return promise1 = new Promise((resolve, reject) => {db.get('SELECT * FROM users WHERE name = ?', [name], (err, row) => {
      db.close();
      if (err) resolve(null);
      if (row == undefined) resolve(null);
      return resolve(row);
    })
  })
}
const getUserById = (list, id) => {
  return list.find((user) => user.id == id)
};
initialize(passport, getUserByName, getUserById);
app.set('port', 5000);
app.use('/static',express.static(__dirname + '/static')); 
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(flash())
app.use(session({
  secret: 'bG0#9UlOZ~D2r3A_M73Cj^aN$', // Yes that's my secret and?
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.get('/', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/home/home.html')); //On envoie home
})

app.get('/factsheet', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/home/about.html')); //On envoie home
})

app.get('/chat', checkAuthenticated, (req, res) => {
  chatName.push(req.user.name);
  res.sendFile(path.join(__dirname, 'static/chat/chat.html')); 
})

app.get('/politic', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/politic/politic.html')); //On envoie home
})

app.get('/map', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/map/map.html')); //On envoie home
})

app.get('/help', checkAuthenticated, (req, res) => {
  mediaUsers.push([req.user.name,req.user.email]);
  res.sendFile(path.join(__dirname, 'static/help/help.html')); //On envoie home
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/login/login.html')); //On envoie home
})

app.get('/nologin', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/nologin/nologin.html')); //On envoie home
})

app.get('/nofactsheet', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/nologin/about.html')); //On envoie home
})

app.get('/nomap', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/map/nomap.html')); //On envoie home
})

app.get('/nopolitic', checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'static/politic/nopolitic.html')); //On envoie home
})

app.post('/register', (req, res) => { // Quand on reçoit une création de compte
  try {
    let db = new sqlite3.Database('./database.db');
    db.get('SELECT name FROM users WHERE name = ?', [req.body.name], (err, row) => {
    if (err) {registerError.push("Sorry, an error in the server occurred");return res.redirect("/login#content1")};
    if (row != undefined) {registerError.push("A user of this name already exists");return res.redirect("/login#content1")};
    let amail = db.get('SELECT email FROM users WHERE email = ?', [req.body.email], async (err2, row2) => {
    if (err2) {registerError.push("Sorry, an error in the server occurred");return res.redirect("/login#content1")};
    if (row2 != undefined) {registerError.push("This mail adress is already being used");return res.redirect("/login#content1")};
    if (req.body.password != req.body.verificationPassword) {registerError.push("The two passwords don't match");return res.redirect("/login#content1")};
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    db.run('INSERT INTO users(name, password, xp, email, reminders) VALUES(?, ?, ?, ?, ?)', [req.body.name, hashedPassword, 0, req.body.email, null]);
    console.log("A new user as created an account");
    registerError.push("Please restart the repl after creating your account");
    res.redirect("/login");
    db.close((err) => {if (err) console.error(err.message)});
    });
    });
  } catch {
    res.status(500).send();
  }
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

server.listen(5000, function() { //Starts the server.
    console.log('Starting server on port 5000');
});
var nbOnline = 0;
io.on('connection', function(client) {
  let posts = JSON.parse(fs.readFileSync("./post.json"));
  client.on("helpConnection", ()=> {
    if (mediaUsers.length > 0) client.emit("infos", [mediaUsers.splice(0,1),posts.posts]);
    else client.emit("infos", [["anonymous","unknown"],posts.posts]);
  })
  client.on("newPost",(post)=> {
    let posts = JSON.parse(fs.readFileSync("./post.json"));
    posts.posts.push(post)
    fs.writeFile("./post.json", JSON.stringify(posts), (x) => {
        if (x) console.error(x)
      });
    client.broadcast.emit("receivePost", post)
  })
  client.on("newConnection", ()=> {
    nbOnline ++;
    client.emit("online", nbOnline);
    if (chatName.length > 0) client.emit("name", [chatName.splice(0,1), lastmessages]);
    else client.emit("name",[["anonymous"], lastmessages]);
  })
  client.on("disconnect", ()=> {if (nbOnline > 0) nbOnline --});
  client.on("newMessage", (message)=> {
    lastmessages.push(message)
    if (lastmessages.length > 20) lastmessages.splice(0,1);
    client.broadcast.emit("receiveMessage", message);
  })
  client.on("loginConnection", () => {
    if (registerError.length < 1) {
      client.emit("error1", false)
    }
    else {
      client.emit("error1", registerError[0]);
      registerError.splice(0,1)
    }
  })
})
