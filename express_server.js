const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  user_id: 'session',
  keys: ['key1'],
}));

const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true,
}));

// "url database"
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID',
  },

  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user2RandomID',
  },

};
// "user database"
const users = {
  'userRandomID': {
  id: 'userRandomID',
  email: 'user@example.com',
  password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
  id: 'user2RandomID',
  email: 'user2@example.com',
  password: 'dishwasher-funk'
  },
};

function urlsForUser(cookID) {
  const newObj = {};
  for (var url in urlDatabase) {
  if (urlDatabase[url].userID === cookID) {
  newObj[url] = urlDatabase[url]
     }

  }
  return newObj;
}

app.get('/urls', (req, res) => {
  const templateVars = {

    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
  };

  res.render('urls_index', templateVars);
});

// "random string generator that creates Id for new users"
function generateRandomString() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


app.post('/urls', (req, res) => {
  const newURL = generateRandomString();
  urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect('/urls');
});

// delete cookies
app.post('/urls/:id/delete', (req, res) => {
  const urlObj = urlDatabase[req.params.id];
  if (urlObj.userID === req.session.user_id) {
    delete urlDatabase[req.params.id];

    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

// creating a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: users[req.session.user_id],
    long_URL: urlDatabase[req.params.id].longURL,
  };
  res.render('urls_show', templateVars);
});

// Update url
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.long_URL;
  res.redirect('/urls');
});

// "logins in user and assign cookies"
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('login', templateVars);
});

// "logins user"
app.post('/login', (req, res) => {
    for (const user in users) {
    if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
  req.session.user_id = user;
  res.redirect('/urls');
  }
  }
  return res.status(403).send('Email or password is invalid.');
});

// "logouts User"
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

// "assigns a short URL to long URL"
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/');
  }
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// "handling get request from register form"
app.get('/register', function (req, res) {
  res.render('register');
});


// "handling post request from register form"
app.post('/register', function (req, res) {

  if (req.body.email === '' || req.body.password === '') {
  return res.status(400).send("Can't put in empty string");
  }

  for (const user in users) {
  if (req.body.email === users[user].email) {
  return res.status(400).send('Email already exists.');
  }
  }
  const randomID = generateRandomString();
  users[randomID] = {
  id: randomID,
  password: bcrypt.hashSync(req.body.password, 10),
  email: req.body.email
  };

  req.session.user_id = randomID;
  res.redirect('/urls');

});

// "Homepage"
app.get('/', (req, res) => {
  res.send('Welcome to Tiny App');
});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Server is running at PORT:${PORT}!`);
});
