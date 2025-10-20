import {useState, useEffect} from "react";

export default function TextInput({value, max, onChange}){
	let [prev, setPrev] = useState(value?.toString() ?? "");

	useEffect(() => {
		setPrev(value);
	}, [value]);

	return (
		<input
			type="text"
			value={prev}
			onInput={ev => {
				// TODO: allow a period for decimal numbers?
				ev.target.value = ev.target.value.replace(/[^0-9]/g, "");
			}}
			onChange={ev => {
				let curr = ev.target.value;
				if(curr == prev) return;

				let num = 0;
				if(curr !== ""){
					num = parseFloat(curr);
				}
				if(num > max){
					// TODO: let the user know that the number was too high
					ev.target.value = prev;
				}else{
					if(onChange) onChange(num);

					setPrev(curr);
				}
			}}
		/>
	)
}
