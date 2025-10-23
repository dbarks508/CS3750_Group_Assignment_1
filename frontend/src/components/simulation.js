import SimButtons from "./simButtons";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SliderInput from "./sliderInput";
import TextInput from "./textInput";
import PieChartInput from "./pieChartInput";
import PostGamePage from "./postGamePage";
import StockLineChart from "./stockLineChart";

function Simulation() {
  const [funds, set_funds] = useState(10000);
  const [shares_owned, set_shares_owned] = useState(0);
  const [day, set_day] = useState(1);
  const [selected_amount, set_selected_amount] = useState(0);
  const [price, set_price] = useState("");
  const [date_String, set_date_string] = useState("");
  const [ticker, set_ticker] = useState("");
  const [action_taken, set_action_taken] = useState(false);
  const [show_stats, set_show_stats] = useState(false);
  const [stockName, setStockName] = useState("");
  const [chartHistory, setChartHistory] = useState([]);

  const location = useLocation();
  const { rawPrice, date, ticker_symbol, stock_name, stockHistory } = location.state;

  useEffect(() => {
    // Always set ticker and stock name
    set_ticker(ticker_symbol);
    setStockName(stock_name);

    // If there is stock history, set it
    if (stockHistory && rawPrice) {
      // Need to get the current price and append it to the end of the array that we have the history for
      // Getting history
      const initialHistory = [...stockHistory];
      // Getting current price
      const currentPrice = Number(rawPrice);
      // Putting the last index as our current price
      initialHistory[initialHistory.length - 1] = currentPrice;
      // Updating graph
      setChartHistory(initialHistory);
    }

    if (rawPrice) {
      set_price(rawPrice);
      set_date_string(date);
      set_ticker(ticker_symbol);
      console.log(
        "destructured date string: " +
          date +
          " || destructured ticker: " +
          ticker_symbol +
          " || stock name: " +
          stock_name
      );
    } else {
      let message = "00.00 (No opening stock price found.)";
      set_price(message);
    }
  }, [rawPrice, date, ticker_symbol, stock_name, stockHistory]);

  // button logic ----------

  async function handleButtonClick(button) {
    console.log(`Button ${button} clicked`);

    if (button === "nextDayButton") {
      //if (!action_taken) {
      //  console.log("action must be taken before advancing days");
      //  return;
      //}

      console.log("moving to the next day");

      // query backend to get the next day data
      const response = await fetch("http://localhost:5000/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_date: date_String,
          ticker: ticker,
        }),
      });

      // handle response
      const data = await response.json();
      
      set_price(data.price); // sets opening price, could also access closing at .c
      set_date_string(data.date);
      console.log("price for next day set to: " + data.price);
      console.log("date advaced to to: " + data.date);

      // Need to re-fetch stock history due to the date changing
      try {
        // Running stock history route
        const historyResponse = await fetch("http://localhost:5000/stockHistory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: ticker,
            simulation_date: data.date,
          }),
        });

        // Checking history
        if (!historyResponse.ok) {
          console.log("Failed to fetch updated stock history");
          return;
        }

        // Setting history
        const historyData = await historyResponse.json();
        const updatedHistory = [...historyData.stockHistory];
        setChartHistory(updatedHistory);

      } catch (error) {
        console.error("Error updating chart history: ", error);
        setChartHistory([]);
      }

      
      set_day(day + 1); // increment the day
      set_action_taken(false);
    } else if (button === "buyButton") {
      console.log("buying shares");
      let amountToBuy = selected_amount;

      // send request to backend to buy the shares
      const response = await fetch(`http://localhost:5000/buy/${amountToBuy}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: ticker,
          current_date: date_String,
        }),
      });

      // handle response here
      const data = await response.json();
      console.log("data received in buy button");
      const { success,message, balance, shares } = data;
      if (success) {
        set_funds(balance);
        set_shares_owned(shares);
      }
      console.log(message);


      set_action_taken(true);
    } else if (button === "sellButton") {
      console.log("selling shares");
      let amountToSell = selected_amount;

      // send request to backend to sell shares
      const response = await fetch(
        `http://localhost:5000/sell/${amountToSell}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticker: ticker,
            current_date: date_String,
          }),
        }
      );

      // handle response here
      const data = await response.json();
      console.log("data received in sell button");
      const { success, message, balance, shares } = data;
      if (success) {
        set_funds(balance);
        set_shares_owned(shares);
      }
      console.log(message);

      set_action_taken(true);
    } else if (button === "quitButton") {
      // ensure that the day is at least 7
      if (day > 6) {
        console.log("game ended");
        set_show_stats(true);
        // send request to backend to sell all shares
        let amountToSell = shares_owned;

        // send request to backend to sell shares
        const response = await fetch(
          `http://localhost:5000/sell/${amountToSell}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ticker: ticker,
              current_date: date_String,
            }),
          }
        );

        // handle response here
        const data = await response.json();
        console.log("data received in sell button");
        const { success, message, balance, shares } = data;
        if (success) {
          set_funds(balance);
          set_shares_owned(shares);
        }
        console.log(message);
      } else return;
    }
  }

  // end button logic ---------

  return (
    <div id="container" style={{ display: 'flex' }}>
      <div style={{ width: '100%' }}>
        <div>
          <ul>
            <li>Day: {day}</li>
            <li>Stock Name: {stockName}</li>
            <li>Ticker: {ticker}</li>
            <li>Current Funds: {funds.toFixed(2)}</li>
            <li>Shares Owned: {shares_owned}</li>
          </ul>
        </div>
        {price && <p>Daily Opening Stock Price: ${price}</p>}

        <SliderInput
          value={selected_amount}
          onChange={(e) => set_selected_amount(Number(e.target.value))}
          max={100}
          label="Select Amount to Buy/Sell: "
        />
        <div>
          <SimButtons onButtonClick={handleButtonClick} />
        </div>

        <TextInput
          max={100}
          value={selected_amount}
          onChange={(v) => set_selected_amount(v)}
        />

        <PieChartInput
          primaryColor="green"
          secondaryColor="blue"
          accentColor="black"
          accentSize={3}
          radius={70}
          max={100}
          value={selected_amount}
          onChange={(v) => set_selected_amount(v)}
        />

        {show_stats && <PostGamePage start={10000} end={funds} day={day} />}
      </div>
      <div style={{ width: '100%' }}>
        {/* Line Chart */}
        <StockLineChart stockHistory={chartHistory} />
      </div>
    </div>
  );
}

export default Simulation;
