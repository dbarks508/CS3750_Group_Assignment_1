import {useState, useEffect} from "react";

function zip(...arr){
	let len = Math.min(...arr.map(a => a.length));
	let out = [];
	for(let i = 0; i < len; i++){
		out.push(arr.map(a => a[i]));
	}
	return out;
}

function vec_add(a, b){
	return zip(a, b).map(([x, y]) => x + y);
}
function vec_sub(a, b){
	return vec_add(a, b.map(x => x * -1));
}

export default function(){
	let [pos, setPos] = useState([50, 50]);
	let [startPos, setStartPos] = useState(undefined);

	let width = 100;
	let height = 100;

	function drag(ev){
		if(startPos === undefined) return;

		let mpos = [ev.clientX, ev.clientY];
		let delta = vec_sub(mpos, startPos[0]);

		let epos = vec_add(delta, startPos[1]);

		setPos(epos);
	}

	useEffect(() => {
		document.addEventListener("mouseup", () => setStartPos(undefined));
	}, []);
	useEffect(() => {
		document.addEventListener("mousemove", drag);
		return () => document.removeEventListener("mousemove", drag);
	}, [startPos]);

	return (
		<div style={{height: 500, width: 500, border: "5px solid black"}}>
			{/* maybe use onDrag in the future? */}
			<div
				onMouseDown={ev => {
					let box = ev.target.getBoundingClientRect();
					setStartPos([[ev.clientX, ev.clientY], [box.left, box.top]]);
				}}
				style={{
					width,
					height,
					position: "absolute",
					backgroundColor: "black",
					left: pos[0],
					top: pos[1],
				}}
			>
			</div>
		</div>
	);
}
