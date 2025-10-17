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
			position: "absolute",
			left: (pos?.at(0) ?? radius) - radius,
			top: (pos?.at(1) ?? radius) - radius,

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
		<div>
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

					position: "absolute",
					left: pos?.at(0) ?? 0,
					top: (pos?.at(1) ?? 0) - height / 2,
					transformOrigin: "center left",
					transform: `rotate(${angle}rad)`,
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

export default function({onChange, startAngle, radius, primaryColor, secondaryColor, accentSize, accentColor}){
	let [angle, setAngle] = useState(startAngle ?? 0);
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
		let mpos = [ev.clientX, ev.clientY];
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
			ref={container}
			onMouseDown={ev => {
				mouseToAngle(ev);
				setActive(true);
			}}
			style={{
				backgroundColor: primaryColor,
				height: radius * 2,
				width: radius * 2,
				borderRadius: radius,
			}}>
			<Circle
				radius={radius}
				pos={getPos(container?.current)}
				style={{
					backgroundColor: secondaryColor,
					clipPath: `path("${svgHelper(radius, angle)}")`,
				}}
			/>
			<Rod
				angle={0}
				width={radius}
				height={accentSize}
				pos={getPos(container?.current)}
				color={accentColor}
			/>
			<Rod
				angle={angle}
				width={radius}
				height={accentSize}
				pos={getPos(container?.current)}
				color={accentColor}
			/>
		</div>
	);
}
