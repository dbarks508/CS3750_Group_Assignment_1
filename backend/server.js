const express = require("express");
const app = express();

const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

app.use(cors());
app.use(express.json());

// const dbo = require("./db/conn");

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
