import { useState } from 'react';


function SimButtons(){
    // track current pressed button
    const [button, setButton] = useState('');
    let day = 1; // track the current day



    // show the buttons
    return(
        <div>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px',
                width: '300px' 
            }}></div>
            <button onClick={() => setButton('buyButton')}>Buy</button>

            <button onClick={() => setButton('sellButton')}>Sell</button>

            <button onClick={() => setButton('quitButton')}>Quit</button>

            <button onClick={() => setButton('nextDayButton')}>Next Day</button>

        </div>
    );
}

export default SimButtons;