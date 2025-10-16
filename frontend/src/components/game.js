import React, { useState } from "react";

function Game() {
  const [ticker_symbol, set_ticker_symbol] = useState("");

  async function on_ticker_submit(e) {
    console.log("Inside on_ticker_submit. Ticker symbol: " + ticker_symbol);
    e.preventDefault();

    try {
      const responce = await fetch("http://localhost:5000/stock", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticker: ticker_symbol }),
      });
      const data = await responce.json();
      console.log(data);

      // TODO - process fetched data
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
