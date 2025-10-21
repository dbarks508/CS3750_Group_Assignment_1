import React from "react";

function SliderInput({ value, onChange, max, label = "amount" }) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        value={value}
        onChange={onChange}
      ></input>

      <label>Shares: {value}</label>
    </div>
  );
}

export default SliderInput;
