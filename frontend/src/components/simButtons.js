import { useState } from 'react';

function SimButtons( { onButtonClick }){


    // show the buttons
    return(
        <div>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px',
                width: '300px' 
            }}>
            <button onClick={() => onButtonClick('buyButton')}>Buy</button>

            <button onClick={() => onButtonClick('sellButton')}>Sell</button>

            <button onClick={() => onButtonClick('quitButton')}>Quit</button>

            <button onClick={() => onButtonClick('nextDayButton')}>Next Day</button>

            </div>

        </div>
    );
}

export default SimButtons;