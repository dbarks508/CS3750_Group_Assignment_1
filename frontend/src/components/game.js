import React, { useState } from "react";
import { useNavigate } from "react-router";
import BalancePage from "./balancePage";

function Game() {
  // Declaring tickerSymbol, balance, day
  const [ticker_symbol, set_ticker_symbol] = useState("");
  const [balance, setBalance] = useState(10000);
  const [day, setDay] = useState(1);

  const navigate = useNavigate();

  async function on_ticker_submit(e) {
    e.preventDefault();
    // TODO - make sure the inputted ticker is a valid symbol
    try {
      const response = await fetch("http://localhost:5000/stock", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticker: ticker_symbol }),
      });
      const data = await response.json();
      console.log(data);
      navigate("/simulation", {
        state: {
          stock_data: data.data,
          date: data.date,
          ticker_symbol: ticker_symbol,
        },
      });
    } catch (error) {
      console.log("Error fetching ticker from API: " + error);
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
    />
  );
}

export default Game;