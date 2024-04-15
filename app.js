const express = require('express');
const app = express();
const port = 3000;

// for rendering pages
app.set("view engine", "ejs");

// for rendering static images
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render("page")
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});