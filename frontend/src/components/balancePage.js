import './balancePage.css';

function BalancePage({ on_ticker_submit, ticker_symbol, set_ticker_symbol, balance, day }) {

  return (
    <div className="balancePage">
      <header className="balanceHeader">
        <span>${balance.toLocaleString()}</span>
        <strong style={{ fontSize: '1.1rem' }}>Balance Page</strong>
        <span>Day {day}</span>
      </header>

      <main className="mainContent">
        <form onSubmit={on_ticker_submit} className="form">
          <div>
            <input
              type="text"
              value={ticker_symbol}
              onChange={(e) => set_ticker_symbol(e.target.value)}
              placeholder="Enter symbol..."
            />
            <label style={{ margin: '10px' }}>Ticker Symbol</label>
          </div>
          <button type="submit" className="submitButton">
            View Stock
          </button>
        </form>
      </main>
    </div>
  );
}

export default BalancePage;