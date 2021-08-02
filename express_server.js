const express = require("express"); //allows us to use "simpler commands" for creating webserver (compared to HTTP only)
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs") //Sets ejs as the view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Display single URL details (long and short)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
});

//Displays in terminal console (not on web page) when server is booted up using node express_server.js
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});