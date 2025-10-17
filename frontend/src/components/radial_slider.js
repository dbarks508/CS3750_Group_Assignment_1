import {useState, useEffect, useRef} from "react";

function zip(...arr){
	let len = Math.min(...arr.map(a => a.length));
	let out = [];
	for(let i = 0; i < len; i++){
		out.push(arr.map(a => a[i]));
	}
	return out;
}
function vecAdd(a, b){
	return zip(a, b).map(([x, y]) => x + y);
}
function vecSub(a, b){
	return vecAdd(a, b.map(x => x * -1));
}

function getPos(elm){
	let box = elm.getBoundingClientRect();
	return [
		(box.right - box.left) / 2 + box.left,
		(box.bottom - box.top) / 2 + box.top,
	];
}

function getDim(elm){
	let box = elm.getBoundingClientRect();
	let out = [
		box.width,
		box.height,
	];
	return out;
}


export default function({onChange, initAngle, knobSize, radius, backgroundColor, knobColor}){
	let [angle, setAngle] = useState(initAngle ?? 0);
	let [pos, setPos] = useState([undefined, undefined]);
	let [active, setActive] = useState(false);
	let slider = useRef(null);

	knobSize = knobSize ?? 20;
	radius = radius ?? 300;
	backgroundColor = backgroundColor ?? "cyan";
	knobColor = knobColor ?? "red";

	function mouseToAngle(ev){
		let center = getPos(slider.current.parentNode);
		let mpos = [ev.clientX, ev.clientY];
		mpos = vecSub(mpos, center);
		let theta = Math.atan2(mpos[1], mpos[0]);

		applyAngle(theta);
	}

	function applyAngle(theta){
		let center = getPos(slider.current.parentNode);
		let pos = [radius * Math.cos(theta), radius * Math.sin(theta)];
		pos = vecAdd(pos, center);
		pos = vecSub(pos, getDim(slider.current).map(x => x / 2));

		if(onChange){
			// ensure that theta is between 0 and 2 PI
			// also translate theta into standard unit circle coordinates
			let t = theta;
			if(t < 0){
				t += Math.ceil(-t / (2 * Math.PI)) * (2 * Math.PI);
			}
			onChange(2 * Math.PI - t);
		}

		setAngle(theta);
		setPos(pos);
	}

	useEffect(() => {
		document.addEventListener("mouseup", () => setActive(false));
		applyAngle(angle ?? 0);
	}, []);

	useEffect(() => {
		function drag(ev){
			if(active){
				mouseToAngle(ev);
			}
		}
		document.addEventListener("mousemove", drag);
		return () => document.removeEventListener("mousemove", drag);
	}, [active]);

	return (
		<div
			onMouseDown={ev => {
				mouseToAngle(ev);
				setActive(true);
			}}
			style={{
				backgroundColor,
				height: radius * 2,
				width: radius * 2,
				borderRadius: radius,
				clipPath: "",
			}}>
			<div ref={slider}
				style={{
					backgroundColor: knobColor,
					width: knobSize,
					height: knobSize,
					borderRadius: knobSize / 2,

					position: "absolute",
					left: pos[0],
					top: pos[1],
				}}
			></div>

			<div
				style={{
					backgroundColor: knobColor,
					width: knobSize,
					height: knobSize,
					borderRadius: knobSize / 2,

					position: "absolute",
					left: (slider?.current?.parentNode != undefined ? getPos(slider.current.parentNode)[0]:0) - knobSize / 2,
					top: (slider?.current?.parentNode != undefined ? getPos(slider.current.parentNode)[1]:0) - knobSize / 2,
				}}
			></div>
			<div
				style={{
					width: radius,
					height: knobSize,
					backgroundColor: knobColor,

					position: "relative",
					left: radius,
					top: radius - knobSize / 2,
					transformOrigin: "center left",
					transform: `rotate(${angle}rad)`,
				}}
			></div>
		</div>
	);
}
