const express = require("express");
const app = express();

const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

app.use(cors());
app.use(express.json());

// const dbo = require("./db/conn");

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Stock Simulation Game");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
