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
	if(elm == undefined) return undefined;

	let box = elm.getBoundingClientRect();
	return [
		(box.right - box.left) / 2 + box.left + window.scrollX,
		(box.bottom - box.top) / 2 + box.top + window.scrollY,
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

function svgHelper(r, angle){
	let x = r * Math.cos(angle);
	let y = r * Math.sin(angle);

	// basically svg magic
	return `\
		M ${r},${r} \
		L ${r * 2},${r} \
		A \
			${r},${r} \
			0 ${+(angle > 0)} 0 \
			${x + r},${y + r} \
		L ${r},${r} \
		Z \
	`;
}

function Circle({radius, pos, style, ref}){
	return (
		<div ref={ref} style={{
			width: radius * 2,
			height: radius * 2,
			borderRadius: radius,

			gridColumnStart: 1,
			gridRowStart: 1,

			transform: `translateX(${(pos?.at(0) ?? 0) - radius}px) translateY(${(pos?.at(1) ?? 0) - radius}px)`,

			...(style ?? {})
		}}></div>
	)
}

function Rod({width, height, pos, color, angle}){
	let tip = pos;
	if(tip){
		tip = vecAdd(tip, [width * Math.cos(angle), width * Math.sin(angle)]);
	}
	return (
		<div
			style={{
				display: "grid",
				gridColumnStart: 1,
				gridRowStart: 1,
			}}
		>
			<Circle
				radius={height / 2}
				pos={tip}
				style={{
					backgroundColor: color,
				}}
			/>
			<div
				style={{
					width,
					height,
					backgroundColor: color,

					display: "grid",
					gridColumnStart: 1,
					gridRowStart: 1,

					transformOrigin: "center left",
					transform: `translateX(${(pos?.at(0) ?? 0) - 0 * width / 2}px) translateY(${(pos?.at(1) ?? 0) - height / 2}px) rotate(${angle}rad)`,
				}}
			></div>
			<Circle
				radius={height / 2}
				pos={pos}
				style={{
					backgroundColor: color,
				}}
			/>
		</div>
	)
}

function clampAngle(angle){
	if(angle <= 0){
		angle += Math.ceil(-angle / (2 * Math.PI)) * (2 * Math.PI);
	}
	return angle;
}

export default function PieChartInput({
	primaryColor, secondaryColor, accentColor,
	radius, accentSize,
	onChange, max, value,
}){
	value = (value ?? 0) * -2 * Math.PI / max + (value > 0 ? 1e-6:0);

	let [angle, setAngle] = useState(value);
	let [pos, setPos] = useState([undefined, undefined]);
	let [active, setActive] = useState(false);
	let container = useRef(null);

	accentSize = accentSize ?? 10;
	radius = radius ?? 300;
	primaryColor = primaryColor ?? "cyan";
	secondaryColor = secondaryColor ?? "purple";
	accentColor = accentColor ?? "red";

	function mouseToAngle(ev){
		let center = getPos(container.current);
		let mpos = [ev.pageX, ev.pageY];
		mpos = vecSub(mpos, center);
		let theta = Math.atan2(mpos[1], mpos[0]);

		applyAngle(theta);
	}

	function applyAngle(theta){
		let center = getPos(container.current);
		let pos = [radius * Math.cos(theta), radius * Math.sin(theta)];
		pos = vecAdd(pos, center);
		pos = pos.map(p => p - accentSize / 2);

		if(onChange){
			// normalize theta to be in between 0 and 1
			let t = -theta;
			if(t <= 0){
				t += Math.ceil(-t / (2 * Math.PI)) * (2 * Math.PI);
			}
			t = Math.round(t / (2 * Math.PI) * max);

			onChange(t);
		}

		setAngle(theta);
		setPos(pos);
	}

	useEffect(() => {
		setAngle(value);
	}, [value]);

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
			ref={container}
			onMouseDown={ev => {
				if(!(ev.buttons & 1)) return;

				mouseToAngle(ev);
				setActive(true);
			}}
			style={{
				height: radius * 2,
				width: radius * 2,
				margin: accentSize / 2,

				display: "grid",

				userDrag: "none",
				userSelect: "none",
			}}>

			{/* TODO: make only one color visible at the edge of the cirlces */}
			<Circle
				radius={radius}
				pos={[radius, radius]}
				style={{
					backgroundColor: primaryColor,
				}}
			/>
			<Circle
				radius={radius}
				pos={[radius, radius]}
				style={{
					backgroundColor: secondaryColor,
					clipPath: `path("${svgHelper(radius, clampAngle(angle))}")`,
				}}
			/>
			<Rod
				angle={0}
				width={radius}
				height={accentSize}
				pos={[radius, radius]}
				color={accentColor}
			/>
			<Rod
				angle={angle}
				width={radius}
				height={accentSize}
				pos={[radius, radius]}
				color={accentColor}
			/>
		</div>
	);
}
