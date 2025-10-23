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
  // NOTE: for testing maybe change start and end to cover the entire time range that we can access
  const DAY_COUNT = 60;

  let start = toDateStr(date);

  let end = new Date(date);
  end.setUTCDate(date.getUTCDate() + DAY_COUNT);
  end = toDateStr(end);

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?apiKey=${API_KEY}`;
  const response = await axios.get(url);

  // NOTE: this returns to first result, which may not be the start date!
  date.setTime(new Date(response?.data?.results?.at(0)?.t ?? 0));
  const response_obj = {
    price: response?.data?.results?.at(0)?.o,
    date: toDateStr(date),
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

  // put in a dummy values for dataless dates so that the cache knows it to be dataless
  let dateIter = new Date(date);
  for(let i = 0; i < DAY_COUNT; i++){
    let key = toDateStr(dateIter);
    if(!c.get(key)){
      c.set(key, false);
    }

    addDate(dateIter, 1);
  }

  return response_obj;
}

// helpers
function rand(min, max){
  return Math.round(Math.random() * (max - min) + min);
}
function genDate(){
  let now = new Date();

  let end = new Date(0);
  end.setUTCFullYear(now.getUTCFullYear() - 1);
  end.setUTCMonth(now.getUTCMonth());
  end.setUTCDate(now.getUTCDate());


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
function fromDateStr(date){
  const [y, m, d] = date.split("-").map(Number);

  let date_obj = new Date(0);
  date_obj.setUTCFullYear(y);
  date_obj.setUTCMonth(m - 1);
  date_obj.setUTCDate(d);

  return date_obj;
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
function addDate(date, num){
  date.setUTCDate(date.getUTCDate() + num);
}
async function getPrices(ticker, date, count, strictCount=true){
  let out = [];

  let dateEnd = new Date(date);
  addDate(dateEnd, count);

  let dateIter = new Date(date);
  while(count > 0){
    // get price from cache until either we get data or an uncached date
    let key;
    let price;
    while(true){
      key = toDateStr(dateIter);
      price = cache.get(ticker)?.get(key);
      addDate(dateIter, 1);

      if(price !== false) break;
    }

    if(price === undefined){
      // fetchPrice will update date with the latest valid one
      out.push(await fetchPrice(ticker, dateIter));
    }else{
      out.push({price, date: key});
    }

    if(!strictCount){
      let last = fromDateStr(out[out.length - 1].date)

      if(last.getTime() > dateEnd.getTime()){
        out.pop();
        break;
      }
    }

    count--;
  }

  return out;
}
async function getPrice(ticker, date){
  return (await getPrices(ticker, date, 1))?.at(0);
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

  let date_obj = fromDateStr(current_date);
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

  try {
    const stockPrices = await getPrices(ticker, startDate, days, strictCount = false);

    return stockPrices.map(({price: p}) => p); // Returns an array
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
