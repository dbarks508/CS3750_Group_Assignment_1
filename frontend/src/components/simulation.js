import React, { useState } from "react";
import { useNavigate } from "react-router";

function Simulation() {
  const [price, set_price] = useState("");

  return (
    <div id="container">
      <p>daily ticker price here</p>
    </div>
  );
}

export default Simulation;
