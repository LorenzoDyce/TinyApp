var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    }
  };

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user: users[req.cookies.user_id]
                     };

  console.log(req.cookies)
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect('/urls');
});

//delete cookies
app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       user: users[req.cookies.user_id]
                       };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urls: urlDatabase,
                       user: users[req.cookies.user_id]
                     }
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res)=>{
  urlDatabase[req.params.id] = req.body.long_URL;
  res.redirect('/urls');
});


app.get("/login", (req, res)=>{
  let templateVars = { user: users[req.cookies.user_id]};
  res.render('login', templateVars);
});

//login
app.post("/login", (req, res)=>{
  for (let user in users){
    if (req.body.email === users[user].email && req.body.password === users[user].password){
      res.cookie('user_id', user);
      res.redirect('/urls');
     }
    }

    if(req.body.email !== users[user].email){
      return res.status(403).send("Email does not exists.");
      }
    if(req.body.password !== users[user].password){
      return res.status(403).send("Wrong password");
    }
});

//logout
app.post("/logout", (req, res)=>{
  res.clearCookie('user_id', req.body.username);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.redirect('/');
  }
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//handling get request from regiester form
app.get('/register', function (req, res){
  res.render('register');
})


//handling post request from register form
app.post('/register', function (req, res){

  if (req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Can't put in empty string");
  }

  for (user in users){
    if (req.body.email === users[user].email){
      return res.status(400).send("Email already exists.");
    }
  }
let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    password: req.body.password,
    email: req.body.email
  }

  res.cookie('user_id', randomID);
  res.redirect('/urls');

});


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Server is running at PORT:${PORT}!`);
});

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
