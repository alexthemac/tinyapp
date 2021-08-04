const express = require("express"); //allows us to use "simpler commands" for creating webserver (compared to HTTP only)
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") //Sets ejs as the view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser'); //If not included, cookies is undefined initially and website crashes
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
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
    };
  res.render("urls_index", templateVars);
});
//Displays create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//Display single URL details (long and short)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);

});

//Display registration URL page
app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_register", templateVars);
});

//Links to actual Long URL when short URL is clicked (notice it's /u/:shortURL not /urls/:shortURL)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Takes the data input into new /url/new and does something with it...
app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console {longURL: 'whatever entered in form'}
  const shortURLNew = generateRandomString(); //Creates a randomstring for the shortURLNew
  const longURLNew = req.body.longURL; //Takes the data entered in the form and stores it in longURLNew
  urlDatabase[shortURLNew] = longURLNew; //Creates new entry in urlDatabse object 
  res.redirect(`/urls/${shortURLNew}`) //Redirects to displaying single URL details (long and short) once new created.
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)...Replaced by redirect above
});

//Deletes a url from the url database. (url to delete is :shortURL variable)
app.post("/urls/:shortURL/delete", (req, res) => { 
  const urlToDelete = req.params["shortURL"];
  console.log("deleted:",req.params["shortURL"]);
  delete urlDatabase[urlToDelete];
});

//Edits url in the url database. (url to edit is :shortURL variable)
app.post("/urls/:shortURL", (req, res) => { 
  const shortURLToUpdate = req.params['shortURL']; //grabs the shortURL from the path
  const updatedLongURL = req.body['longURL']; //grabs the longURL that is entered in the form
  // console.log("shortURL to be edited(req.params['shortURL']):", req.params['shortURL']);
  // console.log("new longURL (req.body['longURL']):", req.body['longURL']);
  urlDatabase[shortURLToUpdate] = updatedLongURL; //updates urlDatabase with this data
  res.redirect(`/urls`); //redirects to /urls page once I edit one
});

app.post("/login", (req, res) => {
  const usernameEntered = req.body["username"];
  console.log("username entered:", req.body["username"])
  res.cookie('username', usernameEntered);
  //console.log();
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});



//Displays in terminal console (not on web page) when server is booted up using node express_server.js
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});