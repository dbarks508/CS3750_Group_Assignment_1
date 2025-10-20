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
            fetch(`http://localhost:5000/buy/:${amountToBuy}`,{
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
            fetch(`http://localhost:5000/sell/:${amountToBuy}`,{
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
            <SimButtons onButtonClick={handleButtonClick} button={button} />
        </div>
    )
}

export default Simulation;