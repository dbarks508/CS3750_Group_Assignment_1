const express = require("express");
const app = express();
const axios = require("axios");

const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

app.use(cors());
app.use(express.json());

// const dbo = require("./db/conn");

const port = process.env.PORT;

// backend route to retrieve initial stock prices
app.post("/stock", async (req, res) => {
  // TODO generate random day to retrieve stock data from - market closed on weekends
  //   const random_month = Math.floor(Math.random() * 9) + 1;
  //   const month = String(random_month).padStart(2, "0");
  //   const random_day = Math.floor(Math.random() * 28) + 1;
  //   const day = String(random_day).padStart(2, "0");
  //   const random_year = Math.floor(Math.random() * (2025 - 2024 + 1)) + 2024;
  //   const year = String(random_year);
  const date_string = `2024-02-07`;

  const { ticker } = req.body;
  console.log(ticker);

  try {
    const api_key = "9X0NEbKjBw3bl3p1eUA1kBkx1jG9SYzf";
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date_string}/${date_string}?apiKey=${api_key}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
