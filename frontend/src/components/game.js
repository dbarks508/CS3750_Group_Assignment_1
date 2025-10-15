import React, { useEffect, useState } from "react";

function Game() {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:5000/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res_text = await res.text();
      setText(res_text);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>{text}</h1>
    </div>
  );
}

export default Game;
