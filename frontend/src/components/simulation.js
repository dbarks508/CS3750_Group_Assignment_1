import SimButtons from './simButtons';

function Simulation(){

    const handleButtonClick = (button) => {
        console.log(`Button ${button} clicked`);
        setButton(button);

        if (button === 'nextDayButton'){
            console.log("moving to the next day");
            day += 1; // increment the day

            // send request to backend to get the next day data
            fetch('http://localhost:5000/next',{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(),
            })


        }
        else if (button === 'buyButton'){
            console.log("buying shares");
            // get the input number from an input option, should be linked so any will do
            let amountToBuy = 10; // placeholder value

            // get the current price from the API
            async function getCurrentPrice() {
                try {
                    const response = await rest.getStocksTrades(
                    {
                        stockTicker: currTicker,
                        timestamp: currDate
                    }
                    );
                    console.log('Response:', response);
                    return response.price;
                } catch (e) {
                    console.error('An error happened:', e);
                }
            }

            let currPrice = getCurrentPrice();

            // send request to backend to buy the shares
            fetch(`http://localhost:5000/buy/:${amountToBuy}/:${currPrice}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(),
            })


        }
        else if (button === 'sellButton'){
            console.log("selling shares");
            // get the input number from an input option, should be linked so any will do
            let amountToSell = 10; // placeholder value

            // get the current price from the API
            async function getCurrentPrice() {
                try {
                    const response = await rest.getStocksTrades(
                    {
                        stockTicker: currTicker,
                        timestamp: currDate
                    }
                    );
                    console.log('Response:', response);
                    return response.price;
                } catch (e) {
                    console.error('An error happened:', e);
                }
            }

            let currPrice = getCurrentPrice();

            // send request to backend to sell the shares
            fetch(`http://localhost:5000/sell/:${amountToBuy}/:${currPrice}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(),
            })

        }
        else if (button === 'quitButton'){
            // ensure that the day is at least 7
            if (day > 6){
                // display stats
                console.log("game ended");
                // send request to backend to get final stats
                fetch('http://localhost:5000/quit',{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(),
                })

            }
            else
                return;
        }

    }


    return(
        <div>
            <SimButtons onButtonClikc={handleButtonClick} button={button} />
        </div>
    )
}

export default Simulation;
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
  const [date_String, set_date_string] = useState("");
  const [ticker, set_ticker] = useState("");

  const location = useLocation();
  const { stock_data, date, ticker_symbol } = location.state;

  useEffect(() => {
    if (stock_data?.results?.length > 0) {
      set_price(stock_data.results[0].o);
      set_date_string(date);
      set_ticker(ticker_symbol);
      console.log(
        "destructured date string: " +
          date +
          " || descrtuctured ticker: " +
          ticker_symbol
      );
    } else {
      let message = "00.00 (No opening stock price found.)";
      set_price(message);
    }
  }, [stock_data]);

  // next day button can send obj {current_date: date_String, ticker: ticker}
  // responce will recieve the new data, the next day

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
