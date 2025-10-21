// API imports/information
// const { restClient } = require("@polygon.io/client-js");

// const apiKey = "YOUR_API_KEY"; // need API key
// const rest = restClient(apiKey, "https://api.polygon.io");

const express = require("express");
const axios = require("axios");

// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// get a random date, at least 6 months into the sim to start at
let currDate = Math.floor(Math.random() * 180) + 30;

// track the number of days passed and the ticker
let currTicker = "";
let currDay = 0;

// store the balance and amount of shares
let balance = 0;
let shares = 0;

// start a new simulation with the provided ticker
recordRoutes.route("/start/:ticker").get((req, res) => {
  currTicker = req.params.ticker;

  // ensure the currDate is a week day
  while (currDate % 7 === 0 || currDate % 7 === 6) {
    currDate += 1;
  }
  // initialzie starting values
  currDay = 1;
  balance = 10000.0;
  shares = 0;

  res.json({
    ticker: currTicker,
    day: currDay,
    date: currDate,
    balance: balance,
    shares: shares,
  });
});

//----- routes moved from server.js -----

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
    res.json(response_obj);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

//----- end routes moved from server.js -----

// ----- other version kept for reference -----
// get the next day in the simulation
// recordRoutes.route("/next").get((req, res) => {
//   currDay += 1;
//   currDate += 1;
//   // ensure the currDate is a week day
//   while (currDate % 7 === 0 || currDate % 7 === 6) {
//     currDate += 1;
//   }

//   res.json({
//     ticker: currTicker,
//     day: currDay,
//     date: currDate,
//     balance: balance,
//     shares: shares,
//   });
// });

// buy a given amount of shares at the current price, if the number of shares * price is less than balance
recordRoutes.post("/buy/:amount", async (req, res) => {
  const amount = parseInt(req.params.amount, 10);
  const { ticker, current_date } = req.body;
  let price = 0.0;

  // secure api call to get price
  try {
    const date_string = current_date;
    const api_key = "9X0NEbKjBw3bl3p1eUA1kBkx1jG9SYzf";
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date_string}/${date_string}?apiKey=${api_key}`;
    const response = await axios.get(url);
    price = response.data.results[0].o;
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }

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
recordRoutes.route("/sell/:amount").get((req, res) => {
  const amount = parseInt(req.params.amount, 10);
  const price = getCurrentPrice();
  if (amount <= shares) {
    shares -= amount;
    balance += amount * price;
    res.json({
      success: true,
      ticker: currTicker,
      day: currDay,
      date: currDate,
      balance: balance,
      shares: shares,
    });
  } else {
    res.json({
      success: false,
      message: "Insufficient shares",
      ticker: currTicker,
      day: currDay,
      date: currDate,
      balance: balance,
      shares: shares,
    });
  }
});

// stops the simulation and gets the final results to display on the stat screen
recordRoutes.route("/quit").get((req, res) => {
  res.json({
    ticker: currTicker,
    day: currDay,
    date: currDate,
    balance: balance,
    shares: shares,
  });
});

// gets the current price from the API
async function getCurrentPrice() {
  try {
    const response = await rest.getStocksTrades({
      stockTicker: currTicker,
      order: "asc",
      limit: "10",
      sort: "timestamp",
      timestampe: currdate,
    });
    console.log("Response:", response);
    return response.price;
  } catch (e) {
    console.error("An error happened:", e);
  }
}

module.exports = recordRoutes;