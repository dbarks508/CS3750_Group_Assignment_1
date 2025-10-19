import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SliderInput from "./sliderInput";

function Simulation() {
  const [funds, set_funds] = useState(10000);
  const [shares_owned, set_shares_owned] = useState(0);
  const [sell_amount, set_sell_amount] = useState(0);
  const [day, set_day] = useState(1);
  const [selected_amount, set_selected_amount] = useState(0);
  const [price, set_price] = useState("");

  const location = useLocation();
  const { stock_data } = location.state;

  useEffect(() => {
    if (stock_data?.results?.length > 0) {
      set_price(stock_data.results[0].o);
    } else {
      let message = "00.00 (No opening stock price found.)";
      set_price(message);
    }
  }, [stock_data]);

  return (
    <div id="container">
      <div>
        <ul>
          <li>Day: {day}</li>
          <li>Current Funds: {funds}</li>
          <li>Shares Owned: {shares_owned}</li>
        </ul>
      </div>
      {price && <p>Daily Opening Stock Price: ${price}</p>}

      <SliderInput
        value={selected_amount}
        onChange={(e) => set_selected_amount(Number(e.target.value))}
        max={funds}
        label="Select Amount to Buy/Sell: "
      />
    </div>
  );
}

export default Simulation;
