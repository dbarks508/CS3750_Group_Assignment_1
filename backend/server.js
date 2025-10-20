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
  let day_num = 0;
  let date_string = ""; // gets passed to the front end for easy access

  // loop until weekday is found
  while (day_num == 0 || day_num == 6) {
    let random_month = Math.floor(Math.random() * 12) + 1;
    let month = String(random_month).padStart(2, "0");

    let random_day = Math.floor(Math.random() * 28) + 1;
    let day = String(random_day).padStart(2, "0");

    let random_year = Math.floor(Math.random() * (2025 - 2024 + 1)) + 2024;
    let year = String(random_year);

    date_string = `${year}-${month}-${day}`;
    let date_obj = new Date(date_string);
    day_num = date_obj.getDay();
  }

  const { ticker } = req.body;
  console.log("ticker symbol: " + ticker + "|| date string: " + date_string);

  try {
    const api_key = "9X0NEbKjBw3bl3p1eUA1kBkx1jG9SYzf";
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date_string}/${date_string}?apiKey=${api_key}`;
    const response = await axios.get(url);
    const response_obj = {
      data: response.data,
      date: date_string,
    };
    res.json(response_obj);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
