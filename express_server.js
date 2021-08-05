const express = require("express"); //allows us to use "simpler commands" for creating webserver (compared to HTTP only)
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") //Sets ejs as the view engine

//Old database style...overwritten by one below
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
};


//Used to store and access the users in the app
const users = { 
  "1": {
    id: "1", 
    email: "1@1.com", 
    password: "1"
  },
 "2": {
    id: "2", 
    email: "2@2.com", 
    password: "2"
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser'); //If not included, cookies is undefined initially and website crashes
const e = require("express");
app.use(cookieParser()); //If not included, cookies is undefined initially and website crashes

//Generate random alphanumeric string for the shortURL. 
function generateRandomString() {
  let randomString = '';
  let availChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

  for (let i = 0; i < 6; i ++) {
    randomString += availChars[Math.round(Math.random() * 61)]
  }
  return randomString;  
}

//Check if email is already in user "database"
function emailAlreadyRegistered (email) {
  for (user in users) {
    if (email === users[user]['email']) {
      return true;
    }
  }
  return false;
};

//Check if password matches password in user "database"
function passwordMatchRegistered (password) {
  for (user in users) {
    if (password === users[user]['password']) {
      return true;
    }
  }
  return false;
};

//Return user_id from user "database" via email lookup
function userIDLookup (email) {
  for (user in users) {
    if (email === users[user]['email']) {
      return user;
    }
  }
};

//Creates a new DB based according to which user is logged in
function filterURLDatabase (cookieID) {
  let filteredDB = {};
  
  for (url in urlDatabase) {
    if (urlDatabase[url]["userID"] === cookieID) {
      filteredDB[url] = urlDatabase[url];
    }
  }
  return filteredDB;
};


//Landing page displays Hello!
app.get("/", (req, res) => {
  res.send("Hello!");
});
//Converts the urlDatabase object to a JSON string, and displays the JSON string
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Applies some html formatting to Hello World, and the formatting is displayed when visiting the path
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//Sets a = 1, but this will only work within the /set path.
app.get("/set", (req, res) => {
 const a = 1;
 res.send(`a = ${a}`);
});
//Will not work as a is not defined globally, only in the /set path and not the /fetch path.
app.get("/fetch", (req, res) => {
 res.send(`a = ${a}`);
});

//Displays all URLS in URL database
app.get("/urls", (req, res) => {
  //Displays error if not logged in 
  if (!req.cookies["user_id"]) {
    //Sets status code to 403 
    res.status(403); //Is this correct status code? 
    //Displays 'Response: 403 Bad Request on the /login page
    res.send('Response: User not logged in. Please login to view urls');
  //Else create a new database with only URLs created by logged in user.
  } else {
    //Creates new database with only URLs created by user (user defined by the user_id cookie)
    let filteredUrlDatabase = filterURLDatabase(req.cookies["user_id"]);
    const templateVars = { 
      user: users[req.cookies["user_id"]],
      urls: filteredUrlDatabase
      };
    res.render("urls_index", templateVars);
  }
});

//Displays create new URL page
app.get("/urls/new", (req, res) => {
  //If user is not logged in, redirect them to login page
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  //If use is logged in, allow them to create new URL
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  };
});

//Display single URL details (long and short)
app.get("/urls/:shortURL", (req, res) => {
  //If user is not logged in, or logged in as the wrong user (for the shortURL in the browser bar), send error
  if (!req.cookies['user_id'] || urlDatabase[req.params.shortURL]["userID"] != req.cookies["user_id"]) {
    //Sets status code to 403 
    res.status(403); //Is this correct status code? 
    //Displays 'Response: 403 Bad Request on the /login page
    res.send('Response: User not logged in. Please login to view urls');
  //Else display the urls_show page
  } else {
    const templateVars = { 
      user: users[req.cookies["user_id"]],
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]['longURL']
    };
  res.render("urls_show", templateVars);
  };
});

//Display registration URL page
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL, 
    //longURL: urlDatabase[req.params.shortURL]
    //longURL: urlDatabase[req.params.shortURL]['longURL']
  };
  res.render("urls_register", templateVars);
});

//Links to actual Long URL when short URL is clicked (notice it's /u/:shortURL not /urls/:shortURL)
app.get("/u/:shortURL", (req, res) => {
  //If shortURL does not exist, send error
  if(!urlDatabase[req.params.shortURL]) {
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
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL, 
    // longURL: urlDatabase[req.params.shortURL]
    //longURL: urlDatabase[req.params.shortURL]['longURL']
  };
  res.render("urls_login", templateVars);
});

//Takes the data input into new /url/new and does something with it...
app.post("/urls", (req, res) => {
  //If user is not logged in provide them with an error message
  if(!req.cookies['user_id']) {
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
      userID: req.cookies["user_id"]
    }
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURLNew}`) //Redirects to displaying single URL details (long and short) once new created.
  }
});

//Deletes a url from the url database. (url to delete is :shortURL variable)
app.post("/urls/:shortURL/delete", (req, res) => { 
  const urlToDelete = req.params["shortURL"];
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});

//Edits url in the url database. (url to edit is :shortURL variable)
app.post("/urls/:shortURL", (req, res) => { 
  const shortURLToUpdate = req.params['shortURL']; //grabs the shortURL from the path
  const updatedLongURL = req.body['longURL']; //grabs the longURL that is entered in the form
  // urlDatabase[shortURLToUpdate] = updatedLongURL; //updates urlDatabase with this data
  urlDatabase[shortURLToUpdate]['longURL'] = updatedLongURL;
  res.redirect(`/urls`); //redirects to /urls page once I edit one
});

//Logs in user
app.post("/login", (req, res) => {
  const email = req.body['email'];
  const password = req.body['password'];

  //If email has not been registerd, throw error
  if (!emailAlreadyRegistered(email)) {
    //Sets status code to 403 
    res.status(403);
    //Displays 'Response'
    res.send('Response: Email not registered');
  //If email has been registered, but wrong password entered, throw error
  } else if (emailAlreadyRegistered(email) && !passwordMatchRegistered(password)) {
    //Sets status code to 403 
    res.status(403);
    //Displays 'Response'
    res.send('Response: Password does not match records');
  //If the email has been registered and password is correct, update cookie with user_id to id of email entered
  } else {
    const id = userIDLookup(email);
    res.cookie('user_id', id);
    res.redirect(`/urls`);
  }
});

//Logsout user (clears cookie with id info of user)
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

//Adds new user to users object
app.post("/register", (req, res) => {
  const {email, password} = req.body; //Grabs the email and password entered in /register
  const id = generateRandomString(); //Creates a unique id for the new user

  //if email is blank or password is blank, display error
  if (email === "" || password === "") {
    //Sets status code to 400 (bad request)
    res.status(400);
    //Displays 'Response: 400 Bad Request on the /register page
    res.send('Response: Not a valid email');
  //if email is already in user "database", display error
  } else if (emailAlreadyRegistered(email) === true) {
    //Sets status code to 400 (bad request)
    res.status(400);
    //Displays 'Response: 400 Bad Request on the /register page
    res.send('Response: Email already exits');
  } else {
    //Adds the new created user to the users object
    users[id] = {
    id,
    email,
    password
    };
    console.log(users);
    //Sets a user_id cookie to the newly created id
    res.cookie('user_id', id);
    res.redirect(`/urls`);
  }
});

//Displays in terminal console (not on web page) when server is booted up using node express_server.js
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});