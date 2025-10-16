import {useState, useEffect} from "react";

export default function(){
	let [pos, setPos] = useState([50, 50]);
	let [startPos, setStartPos] = useState(undefined);

	function drag(ev){
		if(startPos === undefined) return;

		let mpos = [ev.clientX, ev.clientY];
		let deltaPos = mpos.map((p, i) => p - startPos[0][i]);

		let epos = deltaPos.map((p, i) => p + startPos[1][i]);

		setPos(epos);
	}

	useEffect(() => {
		document.addEventListener("mouseup", () => setStartPos(undefined));
	}, []);

	return (
		<div style={{height: "500px", width: "500px"}}>
			{/* maybe use onDrag in the future? */}
			<div
				onMouseMove={drag}
				onMouseDown={ev => {
					let box = ev.target.getBoundingClientRect();
					setStartPos([[ev.clientX, ev.clientY], [box.left, box.top]]);
				}}
				style={{
					width: 100,
					height: 100,
					position: "absolute",
					border: "solid black 10px",
					left: pos[0],
					top: pos[1],
				}}
			>
			</div>
		</div>
	);
}
