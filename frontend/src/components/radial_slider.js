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

	let border = 10;
	let size = 50;
	let radius = 250;

	function drag(ev){
		if(startPos === undefined) return;

		let mpos = [ev.clientX, ev.clientY];
		let wdim = [window.innerWidth, window.innerHeight];
		let delta = vec_sub(mpos, startPos[0]);

		let epos = vec_add(delta, startPos[1]).map((p, i) => {
			let limit = wdim[i] - size;
			if(p < 0) return 0;
			else if(p > limit) return limit;
			else return p;
		});

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
		<div style={{backgroundColor: "red", height: radius * 2, width: radius * 2, borderRadius: radius}}>
			<div ref={slider}
				onDrag={ev => ev.preventDefault()}
				onMouseDown={ev => {
					let box = ev.target.getBoundingClientRect();
					setStartPos([[ev.clientX, ev.clientY], [box.left, box.top]]);
				}}
				style={{
					width: size,
					height: size,
					position: "absolute",
					backgroundColor: "black",
					borderRadius: size / 2,
					left: pos[0],
					top: pos[1],
				}}
			>
			</div>
		</div>
	);
}
