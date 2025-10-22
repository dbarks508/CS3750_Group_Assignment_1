const express = require("express");
const app = express();
// const axios = require("axios");

const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

app.use(cors());
app.use(express.json());
app.use(require("./routes/records"));

const port = process.env.PORT ?? 5000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});