const express = require("express");
const axios = require("axios");

// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// store the balance and amount of shares
let balance = 0;
let shares = 0;
let price = 0;

// backend route to retrieve initial stock prices
recordRoutes.post("/stock", async (req, res) => {
  balance = 10000.0;
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
    price = response.data.results[0].o; // price set to resulting opening price from api call
    res.json(response_obj);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

// backend route to get the next day's stock price for ticker
recordRoutes.post("/next", async (req, res) => {
  const { current_date, ticker } = req.body;
  console.log("current date: " + current_date);

  const [y, m, d] = current_date.split("-").map(Number);
  let date_obj = new Date(y, m - 1, d);
  date_obj.setDate(date_obj.getDate() + 1);
  let day_num = date_obj.getDay();

  while (day_num == 0 || day_num == 6) {
    date_obj.setDate(date_obj.getDate() + 1);
    day_num = date_obj.getDay();
  }

  // turn into date string
  const year = String(date_obj.getFullYear());
  const month = String(date_obj.getMonth() + 1).padStart(2, "0"); // month 0 indexed
  const day = String(date_obj.getDate()).padStart(2, "0");

  const date_string = `${year}-${month}-${day}`;
  console.log("next date: " + date_string);

  try {
    const api_key = "9X0NEbKjBw3bl3p1eUA1kBkx1jG9SYzf";
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date_string}/${date_string}?apiKey=${api_key}`;
    const response = await axios.get(url);
    const response_obj = {
      data: response.data,
      date: date_string,
    };
    price = response.data.results[0].o; // price set to resulting opening price from api call
    res.json(response_obj);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

// buy a given amount of shares at the current price, if the number of shares * price is less than balance
recordRoutes.post("/buy/:amount", async (req, res) => {
  const amount = parseInt(req.params.amount, 10);
  const { ticker, current_date } = req.body;
  console.log(`buying stock from ticker ${ticker} on ${current_date}`);

  const totalCost = amount * price;

  if (totalCost <= balance) {
    shares += amount;
    balance -= totalCost;

    // respond with json
    res.json({
      success: true,
      message: "succusfully updated metrics",
      balance: balance,
      shares: shares,
    });
  } else {
    res.json({
      success: false,
      message: "Insufficient balance",
      balance: balance,
      shares: shares,
    });
  }
});

// sell a given amount of shares at the current price, if the number of shares to sell is less than owned
recordRoutes.post("/sell/:amount", async (req, res) => {
  const amount = parseInt(req.params.amount, 10);
  const { ticker, current_date } = req.body;
  console.log(`selling stock from ticker ${ticker} on ${current_date}`);

  if (amount <= shares) {
    shares -= amount;
    balance += amount * price;
    res.json({
      success: true,
      message: "succusfully updated metrics",
      balance: balance,
      shares: shares,
    });
  } else {
    res.json({
      success: false,
      message: "cannot sell more than owned",
      balance: balance,
      shares: shares,
    });
  }
});

recordRoutes.post("/validateTicker", async (req, res) => {
  // Formatting ticker
  const requestedTicker = req.body.ticker;

  // Checking if ticker is blank
  if (!requestedTicker || requestedTicker.trim() === "") {
    return res
      .status(400)
      .json({ valid: false, message: "Ticker symbol is required" });
  }
  // Formatting ticker with upper case and trimming whitespace
  const formattedTicker = requestedTicker.trim().toUpperCase();

  try {
    // Making API call to validate ticker
    const api_key = "9X0NEbKjBw3bl3p1eUA1kBkx1jG9SYzf";
    const url = `https://api.polygon.io/v2/aggs/ticker/${formattedTicker}/range/1/day/2024-05-01/2024-06-01?apiKey=${api_key}`;
    const apiResponse = await axios.get(url);

    // Checking if the ticker is valid based on API response:
    if (apiResponse.data.resultsCount === 0) {
      console.log("INVALID ticker symbol: " + formattedTicker);
      return res.json({ valid: false, message: "Invalid ticker symbol" });
    }
    // If we reach here, the ticker is valid
    console.log("VALID ticker symbol: " + formattedTicker);
    res.json({ valid: true, message: "Valid ticker symbol" });
  } catch (error) {
    console.log("Error: " + error.message);
    console.error(error.message);
    // If the ticker is invalid:
    if (error.response && error.response.status === 404) {
      return res.json({ valid: false, message: "Invalid ticker symbol" });
    }
    // API error
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

module.exports = recordRoutes;
