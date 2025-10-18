import React, { useState } from "react";
import { useNavigate } from "react-router";

function Game() {
  const [ticker_symbol, set_ticker_symbol] = useState("");
  const naviagte = useNavigate();

  async function on_ticker_submit(e) {
    console.log("Inside on_ticker_submit. Ticker symbol: " + ticker_symbol);
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/stock", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticker: ticker_symbol }),
      });
      const data = await response.json();
      console.log(data);

      // TODO - process fetched data
      //results.o ->  opening price
      // results.c -> closing price
    } catch (error) {
      console.log("Error fetching ticker from API: " + error);
    }
  }

  return (
    <div id="container">
      <form onSubmit={on_ticker_submit}>
        <label>Enter Ticker Symbol:</label>
        <input
          type="text"
          value={ticker_symbol}
          onChange={(e) => set_ticker_symbol(e.target.value)}
        />
        <button type="submit">View Stock</button>
      </form>
    </div>
  );
}

export default Game;
