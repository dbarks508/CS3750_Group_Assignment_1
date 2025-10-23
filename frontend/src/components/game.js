import React, { useState } from "react";
import { useNavigate } from "react-router";
import BalancePage from "./balancePage";

function Game() {
  // Declaring tickerSymbol, balance, day
  const [ticker_symbol, set_ticker_symbol] = useState("");
  const [balance, setBalance] = useState(10000);
  const [day, setDay] = useState(1);
  const [stockHistory, setStockHistory] = useState([]);

  const navigate = useNavigate();

  async function on_ticker_submit(e) {
    e.preventDefault();

    let formattedTicker = '';
    let simulationDateStr = '';

    try {
      // Route to test ticker
      const validateTicker = await fetch("http://localhost:5000/validateTicker", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticker: ticker_symbol }),
      });
      const tickerData = await validateTicker.json();

      // Ticker
      const formattedStockName = tickerData.stock_name;
      formattedTicker = ticker_symbol.trim().toUpperCase();
      // Console logging for debugging:
      // console.log("Stock name retrieved: " + formattedStockName);
      // console.log(`-- Stock Data from validateTicker --\n{\nStock Name: ${formattedStockName}\nTicker: ${formattedTicker}\nBalance: ${balance}\nDay: ${day}\n}`);
      //console.log("Ticker validation response: " + JSON.stringify(tickerData));

      // Checking if the ticker is valid
      if (!tickerData.valid) {
        alert("Invalid ticker symbol. Please try again.");
        return;
      }

      // Route to test ticker
      const response = await fetch("http://localhost:5000/stock", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticker: formattedTicker }),
      });
      const data = await response.json();

      // Getting the starting date
      simulationDateStr = data.date;

      // -- Route to get stock history --
      const historyResponse = await fetch("http://localhost:5000/stockHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ticker: formattedTicker, simulation_date: simulationDateStr }),
      });

      // Checking if the response is okay
      if (!historyResponse.ok) {
        throw new Error("Failed to fetch stock history from backend");
      }

      // Setting stock history
      const historyData = await historyResponse.json();
      // Need to update the history with the current price
      // Getting current price as a number:
      const currentPriceNumber = Number(data.price);
      const updatedHistory = [...historyData.stockHistory, currentPriceNumber];
      setStockHistory(updatedHistory);
      // -- Route to get stock history --

      console.log(data);
      navigate("/simulation", {
        state: {
          rawPrice: data.price,
          date: data.date,
          ticker_symbol: formattedTicker,
          stock_name: formattedStockName,
          stockHistory: historyData.stockHistory
        },
      });
    } catch (error) {
      console.log("Error fetching ticker from API: " + error);
      // Clearing history
      setStockHistory([]);
    }
  }

  return (
    // This is the entire HTML balance page that is pulling from balancePage.js
    // nice! -DB
    <BalancePage
      on_ticker_submit={on_ticker_submit}
      ticker_symbol={ticker_symbol}
      set_ticker_symbol={set_ticker_symbol}
      balance={balance}
      day={day}
      stockHistory={stockHistory}
    />
  );
}

export default Game;