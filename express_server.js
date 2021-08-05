const express = require("express"); //allows us to use "simpler commands" for creating webserver (compared to HTTP only)
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//var cookieParser = require('cookie-parser'); //Overridden by cookieSession (for encrypted cookies) If not included, cookies is undefined initially and website crashes
//app.use(cookieParser()); //Overridden by cookieSession (for encrypted cookies) If not included, cookies is undefined initially and website crashes

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.set("view engine", "ejs"); //Sets ejs as the view engine

//Old database style...overwritten by one below
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
  a22222: {
    longURL: "https://www.google.ca",
    userID: "1"
  },
  a33333: {
    longURL: "https://www.google.ca",
    userID: "1"
  },
  b44444: {
    longURL: "https://www.tsn.ca",
    userID: "2"
  },
  b55555: {
    longURL: "https://www.tsn.ca",
    userID: "2"
  },
  sgq3y6: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
};

//Used to store and access the users in the app
const users = {
  "1": {
    id: "1",
    email: "1@1.com",
    hashedPassword: bcrypt.hashSync("1", 10) //Turns the simple password "1" into hash
  },
  "2": {
    id: "2",
    email: "2@2.com",
    hashedPassword: bcrypt.hashSync("2", 10) //Turns the simple password "2" into hash
  }
};

//For future?
//const { generateRandomString, getUserByEmail, hashedPasswordLookup, userIDLookup, filterURLDatabase } = require('./helpers');

const { getUserByEmail } = require('./helpers');

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
    //Sets status code to 403
    res.status(403); //Is this correct status code?
    //Displays 'Response: 403 Bad Request on the /login page
    res.send('Response: User not logged in. Please login to view urls');
  //Else create a new database with only URLs created by logged in user.
  } else {
    //Creates new database with only URLs created by user (user defined by the user_id cookie)
    let filteredUrlDatabase = filterURLDatabase(req.session.user_id);
    const templateVars = {
      user: users[req.session.user_id],
      urls: filteredUrlDatabase
    };
    res.render("urls_index", templateVars);
  }
});

//Displays create new URL page
app.get("/urls/new", (req, res) => {
  //If user is not logged in, redirect them to login page
  if (!req.session.user_id) {
    res.redirect('/login');
  //If use is logged in, allow them to create new URL
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

//Display single URL details (long and short)
app.get("/urls/:shortURL", (req, res) => {
  //If short URL does not exist:
  if (!urlDatabase[req.params.shortURL]) {
    //Sets status code to 403
    res.status(403); //Is this correct status code?
    //Displays Response
    res.send('Response: URL for the given ID does not exist');
  //If user is not logged in:
  } else if (!req.session.user_id) {
    //Sets status code to 403
    res.status(403); //Is this correct status code?
    //Displays Response
    res.send('Response: User not logged in. Please login to view urls');
  //If user is logged in but does not own the URL with the given ID:
  } else if (urlDatabase[req.params.shortURL]["userID"] !== req.session.user_id) {
  //Else display the urls_show page
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]['longURL']
    };
    res.render("urls_show", templateVars);
  }
});

//Display registration URL page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      //longURL: urlDatabase[req.params.shortURL]
      //longURL: urlDatabase[req.params.shortURL]['longURL']
    };
    res.render("urls_register", templateVars);
  }
});

//Links to actual Long URL when short URL is clicked (notice it's /u/:shortURL not /urls/:shortURL)
app.get("/u/:shortURL", (req, res) => {
  //If shortURL does not exist, send error
  if (!urlDatabase[req.params.shortURL]) {
    //Sets status code to 400
    res.status(400);
    //Displays 'Response: 400 Bad Request on the /login page
    res.send('Response: shortURL does not exist!');
    //Else redirect to longURL
  } else {
    // const longURL = urlDatabase[req.params.shortURL];
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  }
});

//Displays login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      shortURL: req.params.shortURL,
      // longURL: urlDatabase[req.params.shortURL]
      //longURL: urlDatabase[req.params.shortURL]['longURL']
    };
    res.render("urls_login", templateVars);
  }
});

//Takes the data input into new /url/new and creates new urlDatabase entry
app.post("/urls", (req, res) => {
  //If user is not logged in provide them with an error message
  if (!req.session.user_id) {
    //Sets status code to 403
    res.status(403);
    //Displays 'Response: 403 Bad Request on the /login page
    res.send('Response: Cannot create new URL unless logged in');
  } else {
    const shortURLNew = generateRandomString(); //Creates a randomstring for the shortURLNew
    const longURLNew = req.body.longURL; //Takes the data entered in the form and stores it in longURLNew
    // urlDatabase[shortURLNew] = longURLNew; //Creates new entry in urlDatabse object
    urlDatabase[shortURLNew] = {
      longURL: longURLNew,
      userID: req.session.user_id
    };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURLNew}`); //Redirects to displaying single URL details (long and short) once new created.
  }
});

//Deletes a url from the url database. (url to delete is :shortURL variable)
app.post("/urls/:shortURL/delete", (req, res) => {
  //Checks if the person trying to delete the url was the one to create it. Does not allow delete unless creator.
  if (req.session.user_id !== urlDatabase[req.params['shortURL']]['userID']) {
    //Sets status code to 403
    res.status(403);
    //Displays 'Response'
    res.send('Response: Cannot delete this URL unless logged in as the creator of this URL');
  //Else they are the creator and can delete
  } else {
    console.log("PreDelete:",urlDatabase);
    const urlToDelete = req.params["shortURL"];
    delete urlDatabase[urlToDelete];
    console.log("PostDelete:",urlDatabase);
    res.redirect('/urls');
  }
});

//Edits url in the url database. (url to edit is :shortURL variable)
app.post("/urls/:shortURL", (req, res) => {
  //Checks if the person trying to edit the url was the one to create it. Does not allow edit unless creator.
  if (req.session.user_id !== urlDatabase[req.params['shortURL']]['userID']) {
    //Sets status code to 403
    res.status(403);
    //Displays 'Response'
    res.send('Response: Cannot edit this URL unless logged in as the creator of this URL');
  //Else they are the creator and can edit
  } else {
    const shortURLToUpdate = req.params['shortURL']; //grabs the shortURL from the path
    const updatedLongURL = req.body['longURL']; //grabs the longURL that is entered in the form
    // urlDatabase[shortURLToUpdate] = updatedLongURL; //updates urlDatabase with this data
    urlDatabase[shortURLToUpdate]['longURL'] = updatedLongURL;
    res.redirect(`/urls`); //redirects to /urls page once I edit one
  }
});

//Logs in user
app.post("/login", (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];

  //If email has not been registerd, throw error
  if (!getUserByEmail(email, users)) {
    //Sets status code to 403
    res.status(403);
    //Displays 'Response'
    res.send('Response: Email not registered');
  //If email has been registered, but wrong password entered, throw error (bcrypt used to compare password and hashed password)
  } else if (getUserByEmail(email, users) && !bcrypt.compareSync(password, hashedPasswordLookup(email))) {
    //Sets status code to 403
    res.status(403);
    //Displays 'Response'
    res.send('Response: Password does not match records');
  //If the email has been registered and password is correct, update cookie with user_id to id of email entered
  } else {
    const id = userIDLookup(email);
    //Sets a user_id cookie to the login id
    req.session.user_id = id; //Right here
    res.redirect(`/urls`);
  }
});

//Logsout user (clears cookie with id info of user)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//Adds new user to users object
app.post("/register", (req, res) => {
  //const {email, password} = req.body; //Grabs the email and password entered in /register
  const email = req.body.email; //Grabs email entered in /register
  const password = req.body.password; //Grabs password entered in /register
  const hashedPassword = bcrypt.hashSync(password, 10); //Hashes password using bcrypt
  const id = generateRandomString(); //Creates a unique id for the new user

  //if email is blank or password is blank, display error
  if (email === "" || password === "") {
    //Sets status code to 400 (bad request)
    res.status(400);
    //Displays 'Response: 400 Bad Request on the /register page
    res.send('Response: Not a valid email');
  //if email is already in user "database", display error
  } else if (getUserByEmail(email, users)) {
    //Sets status code to 400 (bad request)
    res.status(400);
    //Displays 'Response: 400 Bad Request on the /register page
    res.send('Response: Email already exits');
  } else {
    //Adds the new created user to the users object
    users[id] = {
      id,
      email,
      hashedPassword
    };
    console.log(users);
    //Sets a user_id cookie to the newly created id
    req.session.user_id = id; //Right here
    res.redirect(`/urls`);
  }
});

//Displays in terminal console (not on web page) when server is booted up using node express_server.js
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});