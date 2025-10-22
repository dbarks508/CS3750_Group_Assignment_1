function toMoneyStr(num){
	let out = Math.floor(num).toString().split("").reverse();

	let c_count = out.length / 3 - 1;
	for(let i = 0; i < c_count; i++){
		out.splice(i + 3 * (i + 1), 0, ",");
	}
	out = "$" + out.reverse().join("");

	const DECIMALS = 2;
	let offset = Math.pow(10, DECIMALS);
	out += "." + (Math.floor(num * offset) % offset).toString().padStart(2, "0");

	return out;
}

export default function PostGamePage({start, end, day}){
	let diff = end - start;
	let gain = diff >= 0;

	return (
		<div style={{fontSize: 32}}>
			<p>
				Elapsed period of time: {day} Days
				<button style={{fontSize: "inherit", float: "right"}} onClick={() =>{
					window.location.href = "/";
				}}>Reset Game</button>
			</p>
			<p>Starting amount: {toMoneyStr(start ?? 10_000)}</p>
			<p>Ending amount: {toMoneyStr(end)}</p>
			<p>{gain ? "Gain":"Loss"}: {gain ? "+":"-"}{toMoneyStr(Math.abs(diff))}</p>
		</div>
	);
}
