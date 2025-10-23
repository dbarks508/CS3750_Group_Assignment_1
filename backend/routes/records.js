const express = require("express");
const axios = require("axios");
const { format, subDays } = require('date-fns');

const API_KEY = process.env.API_KEY;
if(!API_KEY) throw Error("'API_KEY' be must set in 'config.env'");

// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// store the balance and amount of shares
let balance = 0;
let shares = 0;
let price = 0;

// NOTE: in reality we would probably need to flush the cache every once in a while, but this should be good enough for now
// {TICKER: {DATE: PRICE, ...}, ...}
let cache = new Map();

// api helpers
async function validateTicker(ticker){
  const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${API_KEY}`;
  const response = await axios.get(url);

  return response;
}
async function fetchPrice(ticker, date){
  let start = toDateStr(date);

  let end = new Date(date);
  end.setUTCDate(date.getUTCDate() + 14);
  end = toDateStr(end);

  // NOTE: for testing maybe change start and end to cover the entire time range that we can access

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?apiKey=${API_KEY}`;
  const response = await axios.get(url);

  const response_obj = {
    price: response?.data?.results?.at(0)?.o,
    date: start,
  };

  // store results in cache
  let c = cache.get(ticker);
  if(c === undefined){
    c = new Map();

    cache.set(ticker, c);
  }

  response?.data?.results?.forEach(({t, o}) => {
    c.set(toDateStr(new Date(t)), o);
  });

  return response_obj;
}

// helpers
function rand(min, max){
  return Math.round(Math.random() * (max - min) + min);
}
function genDate(){
  let now = new Date();

  let end = new Date(0);
  end.setUTCFullYear(now.getUTCFullYear());
  end.setUTCMonth(now.getUTCMonth());
  end.setUTCDate(now.getUTCDate() - 30);

  // polygon's free plan allows us to go back up to 2 years (https://polygon.io/pricing)
  let start = new Date(0);
  start.setUTCFullYear(now.getUTCFullYear() - 2);
  start.setUTCMonth(now.getUTCMonth());
  start.setUTCDate(now.getUTCDate());

  let out = new Date(rand(start.getTime(), end.getTime()));
  out.setUTCDate(out.getUTCDate() - out.getUTCDay() + rand(1, 5)); // an indirect way of setting utc day

  return out;
}
function toDateStr(date){
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2,"0")}`
}
function nextWeekDay(date){
  let inc = 1;

  if(date.getUTCDay() === 6){
    inc += 2;
  }else if(date.getUTCDay() === 0){
    inc += 1;
  }

  date.setUTCDate(date.getUTCDate() + inc);
}
async function getPrice(ticker, date){
  let key = toDateStr(date);

  let price = cache.get(ticker)?.get(key);
  if(price === undefined){
    return await fetchPrice(ticker, date);
  }

  return {price, date: key};
}

// backend route to retrieve initial stock prices
recordRoutes.post("/stock", async (req, res) => {
  const { ticker } = req.body;
  console.log("ticker symbol: " + ticker);

  balance = 10000.0;

  let date = genDate();

  console.log("before api call /stock");
  try {
    const response = await getPrice(ticker, date);

    price = response.price; // set price to the resulting opening price from api call
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

// backend route to get the next day's stock price for ticker
recordRoutes.post("/next", async (req, res) => {
  const { current_date, ticker } = req.body;
  console.log("current date: " + current_date);

  const [y, m, d] = current_date.split("-").map(Number);
  let date_obj = new Date(y, m - 1, d);
  date_obj.setUTCDate(date_obj.getUTCDate() + 1);

  nextWeekDay(date_obj);

  console.log("before api call /next");
  try {
    const response = await getPrice(ticker, date_obj);

    price = response.price; // price set to resulting opening price from api call
    res.json(response);
  } catch (error) {
    console.error(error);
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
    return res.status(400).json({ valid: false, message: "Blank symbol - Ticker symbol is required" });
  }
  // Formatting ticker with upper case and trimming whitespace
  const formattedTicker = requestedTicker.trim().toUpperCase();

  try {
    // Making API call to validate ticker
    const response = await validateTicker(formattedTicker);

    // Storing stock details from API response
    const stockDetails = response.data.results;

    // Checking if ticker is valid
    if (!stockDetails || stockDetails.length === 0) {
      console.log("INVALID ticker symbol: " + formattedTicker);
      return res.json({ valid: false, message: "Invalid ticker symbol" });
    }
    // If we reach here, the ticker is valid
    console.log("VALID ticker symbol: " + formattedTicker);

    const stockName = stockDetails.name;
    console.log(`-- Stock Details --\n{\nTicker: ${formattedTicker}\nName: ${stockName}\n}`);

    const responseJson = { valid: true, message: "Valid ticker symbol", stock_name: stockName };
    res.json(responseJson);
  } catch (error) {
    // Error handling:
    console.error(error);

    if (error.response) {
      // 404 - Invalid Ticker
      if (error.response.status === 404) {
        console.log("INVALID ticker symbol: " + formattedTicker);
        return res.json({ valid: false, message: "Invalid ticker symbol" });
      }
      // 429 - Rate Limit Exceeded
      if (error.response.status === 429) {
        console.log("API rate limit exceeded (429)");
        return res.status(429).json({ error: "Rate limit exceeded (429). Please try again later." });
      }
    }
    // API error
    res.status(500).json({ error: "Error fetching data from Polygon" });
  }
});

// -- Stock History Section --
// Function
async function fetchStockHistory(ticker, endDateStr, days = 30) {
  // Formatting the date frame
  const endDate = new Date(endDateStr);
  const startDate = subDays(endDate, days);
  const fromDate = format(startDate, 'yyyy-MM-dd');
  const toDate = format(endDate, 'yyyy-MM-dd');

  // Setting up API URL for the call
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=${days}&apiKey=${API_KEY}`;

  try {
    // API Call
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== 'OK' || !data.results) {
      console.error('Polygon API History Error:', data.status, data.error);
      // Returning a blank array
      return[];
    }
    // Setting stock prices to what we got from the API call
    const stockPrices = data.results.map(bar => bar.o);

    return stockPrices; // Returns an array
  } catch (error) {
    console.error("Error fetching stock history from Polygon: ", error.message);
    return [];
  }
}
// Route
recordRoutes.post("/stockHistory", async (req, res) => {
  const { ticker, simulation_date } = req.body;
  if (!ticker || !simulation_date) {
    return res.status(400).json({ error: "Ticker symbol is required." });
  }

  try {
    //console.log(`Fetching 30 days of history for: ${ticker}, ending at ${simulation_date}`);

    // Setting stock history data
    const stockHistory = await fetchStockHistory(ticker, simulation_date, 30);
    res.json({ stockHistory: stockHistory, current_simulation_date: simulation_date });
  } catch (error) {
    console.error("Error in /stockHistory route: ", error);
    return error;
  }
});
// -- Stock History Section --

module.exports = recordRoutes;