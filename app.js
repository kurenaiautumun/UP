const express = require('express');
const app = express();
const port = 3000;

// for rendering pages
app.set("view engine", "ejs");
// for accesing req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for rendering static images
app.use(express.static("public"));

// Database Setup
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

// Use Files for Modularization
const loginRoute = require("./routes/login");
const quesRoute = require("./routes/question");
const userRoute =require("./routes/user");
const testRoute = require("./routes/test");

const session = require("express-session"); // Create sessions
app.use(
  session({
    secret: process.env.SECRET,
    resave:true,
    saveUninitialized:true
  })
);

app.get('/', (req, res) => {
  res.render("page")
});

app.get('/code', (req, res) => {
  res.render("code")
});

app.get('/edit', (req, res) => {
  res.render("edit")
});

app.use("/", loginRoute);
app.use("/", quesRoute);
app.use("/", userRoute)
app.use("/", testRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


//process.on('uncaughtException', err => {
//  console.log(`Uncaught Exception - : ${err.message}`)
//})