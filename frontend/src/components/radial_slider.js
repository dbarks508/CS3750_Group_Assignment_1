import {useState, useEffect, useRef} from "react";

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

function get_center(elm){
	let box = elm.getBoundingClientRect();
	return [
		(box.right - box.left) / 2,
		(box.bottom - box.top) / 2,
	];
}

export default function(){
	let [pos, setPos] = useState([undefined, undefined]);
	let [startPos, setStartPos] = useState(undefined);
	let slider = useRef(null);

	let border = 10;
	let size = 50;
	let radius = 250;

	function drag(ev){
		if(startPos === undefined) return;

		let mpos = [ev.clientX, ev.clientY];
		let delta = vec_sub(mpos, startPos[0]);

		let center = get_center(slider.current.parentNode);
		let target_pos = vec_add(delta, startPos[1]);

		let relpos = vec_sub(target_pos, center);

		let theta = Math.atan2(relpos[1], relpos[0]);

		setAng(theta);
	}

	function setAng(theta){
		let center = get_center(slider.current.parentNode);
		let pos = [radius * Math.cos(theta), radius * Math.sin(theta)];
		pos = vec_add(pos, center);
		pos = vec_sub(pos, [size / 2, size / 2]);

		setPos(pos);
	}

	useEffect(() => {
		document.addEventListener("mouseup", () => setStartPos(undefined));
		setAng(Math.PI);
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
					let s = slider.current;
					let box = s.getBoundingClientRect();
					setStartPos([
						[ev.clientX, ev.clientY],
						[box.left, box.top],
					]);
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
