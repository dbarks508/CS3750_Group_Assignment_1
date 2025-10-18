import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function Simulation() {
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
      {price && <p>Daily Opening Stock Price: ${price}</p>}
    </div>
  );
}

export default Simulation;
