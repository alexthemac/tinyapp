const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs"); //Sets ejs as the view engine

//Stores all urls
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "1"
  },
  i3BoG: {
    longURL: "https://www.google.ca",
    userID: "1"
  },
  a3s2f7D: {
    longURL: "https://www.eng-tips.com",
    userID: "Alex"
  },
  b2sS4E: {
    longURL: "https://www.google.ca",
    userID: "Alex"
  },
  cC24hd: {
    longURL: "https://www.tsn.ca",
    userID: "Alex"
  },
};

//Store and access the users in the app
const users = {
  "1": {
    id: "1",
    email: "1@1.com",
    hashedPassword: bcrypt.hashSync("1", 10) //Turns the simple password "1" into hash
  },
  "Alex": {
    id: "Alex",
    email: "alex@mac.com",
    hashedPassword: bcrypt.hashSync("alex", 10) //Turns the simple password "alex" into hash
  }
};

const { getUserByEmail } = require('./helpers');
//For future?
//const { generateRandomString, getUserByEmail, hashedPasswordLookup, userIDLookup, filterURLDatabase } = require('./helpers');

//Generate random alphanumeric string for the shortURL.
const generateRandomString = function() {
  let randomString = '';
  let availChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

  for (let i = 0; i < 6; i ++) {
    randomString += availChars[Math.round(Math.random() * 61)];
  }
  return randomString;
};

//Return hashed password from user Database based on email
const hashedPasswordLookup = function(email) {
  for (const user in users) {
    if (email === users[user]['email']) {
      const hashedPassword = users[user]['hashedPassword'];
      return hashedPassword;
    }
  }
  return false;
};

//Return user_id from user "database" via email lookup
const  userIDLookup = function(email) {
  for (const user in users) {
    if (email === users[user]['email']) {
      return user;
    }
  }
};

//Creates a new DB based according to which user is logged in
const filterURLDatabase = function(cookieID) {
  let filteredDB = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === cookieID) {
      filteredDB[url] = urlDatabase[url];
    }
  }
  return filteredDB;
};

//Displays in terminal console when server is booted up using node express_server.js
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Landing page displays Hello!
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Displays all URLS in URL database
app.get("/urls", (req, res) => {
  //Displays error if not logged in
  if (!req.session.user_id) {
    //Send status code and display error message with one line:
    return res.status(403).send(`User not logged in. Please <a href='/login'>login</a> to view urls`);
  }
  //Creates new database with only URLs created by user (user defined by the user_id cookie)
  let filteredUrlDatabase = filterURLDatabase(req.session.user_id);
  const templateVars = {
    user: users[req.session.user_id],
    urls: filteredUrlDatabase
  };
  res.render("urls_index", templateVars);
});

//Displays create new URL page
app.get("/urls/new", (req, res) => {
  //If user is not logged in, redirect them to login page
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  //If user is logged in, allow them to create new URL
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

//Display single URL details (long and short)
app.get("/urls/:shortURL", (req, res) => {
  //Displays error if short URL does not exist:
  if (!urlDatabase[req.params.shortURL]) {
    //Send status code and display error message with one line:
    return res.status(403).send(`URL for the given ID does not exist. Please refer to <a href='/urls'>URLS</a> to view url`);
  }
  //Displays error if user is not logged in:
  if (!req.session.user_id) {
    //Send status code and display error message with one line:
    return res.status(403).send(`User is not logged in. Please <a href='/login'>login</a> to view url`);
  }
  //Displays error if user is logged in but does not own the URL with the given ID:
  if (urlDatabase[req.params.shortURL]["userID"] !== req.session.user_id) {
    //Send status code and display error message with one line:
    return res.status(403).send(`User is logged in but does not own the URL with the given ID. Please refer <a href='/urls'>URLS</a> associated with the account`);
  }
  //Display the urls_show page
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL']
  };
  res.render("urls_show", templateVars);
});

//Display registration URL page
app.get("/register", (req, res) => {
  //Redirect if user already logged in
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  //Display registration page if user not logged in
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
  };
  res.render("urls_register", templateVars);
});

//Links to actual Long URL when short URL is entered in address bar
app.get("/u/:shortURL", (req, res) => {
  //Displays error if shortURL does not exist
  if (!urlDatabase[req.params.shortURL]) {
    //Send status code and display error message with one line:
    return res.status(400).send(`shortURL does not exist! Please refer to <a href='/urls'>URLS</a> to view URLS`);
  }
  //Redirect to longURL
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

//Displays login page
app.get("/login", (req, res) => {
  //Redirect if user already logged in
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  //Display login page if user not logged in
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
  };
  res.render("urls_login", templateVars);
});

//Takes the data input into new /url/new and creates new urlDatabase entry
app.post("/urls", (req, res) => {
  const shortURLNew = generateRandomString();
  const longURLNew = req.body.longURL;

  urlDatabase[shortURLNew] = {
    longURL: longURLNew,
    userID: req.session.user_id
  };
  //Redirects to displaying single URL details (long and short) once new created.
  res.redirect(`/urls/${shortURLNew}`);
});

//Deletes a url from the url database. (url to delete is :shortURL variable)
app.post("/urls/:shortURL/delete", (req, res) => {
  //Displays error if the person trying to delete the url was NOT the one to create it.
  if (req.session.user_id !== urlDatabase[req.params['shortURL']]['userID']) {
    //Send status code and display error message with one line:
    return res.status(400).send(`Cannot delete this URL unless logged in as the creator of this URL. Please <a href='/login'>login</a> as a different user`);
  }
  //Deletes if user is logged in as creator of shortURL
  const urlToDelete = req.params["shortURL"];

  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});

//Edits url in the url database.
app.post("/urls/:shortURL", (req, res) => {
  //Displays error if the person trying to edit the url was NOT the one to create it.
  if (req.session.user_id !== urlDatabase[req.params['shortURL']]['userID']) {
    //Send status code and display error message with one line:
    return res.status(400).send(`Cannot edit this URL unless logged in as the creator of this URL. Please <a href='/login'>login</a> as a different user`);
  }
  //Edits if user is logged in as creator of shortURL
  const shortURLToUpdate = req.params['shortURL'];
  const updatedLongURL = req.body['longURL'];

  urlDatabase[shortURLToUpdate]['longURL'] = updatedLongURL;
  res.redirect(`/urls`);
});

//Logs in user
app.post("/login", (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];

  //Displays error if email has not been registered
  if (!getUserByEmail(email, users)) {
    //Send status code and display error message with one line:
    return res.status(403).send(`Email not registered. Please <a href='/register'>register</a> or <a href='/login'>try againn</a>`);
  }
  //Displays error if email has been registered, but wrong password is entered
  if (getUserByEmail(email, users) && !bcrypt.compareSync(password, hashedPasswordLookup(email))) {
    //Send status code and display error message with one line:
    return res.status(403).send(`Password does not match records. Please <a href='/login'>try againn</a>`);
  }
  //If the email has been registered and password is correct, update cookie with user_id to id of email entered
  const id = userIDLookup(email);
  //Sets a user_id cookie to the login id
  req.session.user_id = id;
  res.redirect(`/urls`);
});

//Adds new user to users object
app.post("/register", (req, res) => {
  const email = req.body.email; //Grabs email entered in /register
  const password = req.body.password; //Grabs password entered in /register
  const hashedPassword = bcrypt.hashSync(password, 10); //Hashes password using bcrypt
  const id = generateRandomString(); //Creates a unique id for the new user

  //Display error if email is blank or password is blank
  if (!email || !password) {
    //Send status code and display error message with one line:
    return res.status(400).send(`Not a valid email or password. Please <a href='/register'>try again</a>`);
  }
  //Display error if email is already in user "database"
  if (getUserByEmail(email, users)) {
    //Send status code and display error message with one line:
    return res.status(400).send(`Email already exists. Please <a href='/login'>login</a>`);
  }
  //Adds the new created user to the users object
  users[id] = {
    id,
    email,
    hashedPassword
  };
  console.log(users);
  //Sets a user_id cookie to the newly created id
  req.session.user_id = id;
  res.redirect(`/urls`);
});

//Logsout user (clears cookie with id info of user)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

