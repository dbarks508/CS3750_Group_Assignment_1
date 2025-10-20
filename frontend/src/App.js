import React from "react";

// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// components
import Game from "./components/game";
import Simulation from "./components/simulation";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Game />} />
        <Route exact path="/simulation" element={<Simulation />} />
      </Routes>
    </div>
  );
}

export default App;
