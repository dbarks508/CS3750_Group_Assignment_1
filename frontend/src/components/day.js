import {useEffect, useState} from "react";

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MS_PER_DAY = 24 * 60 * 60 * 1_000;

const TIME_MULT = 1;
const POLL_INTERVAL = 1_000;

// (good dev values)
// const REAL_TIME_SECS_PER_DAY = 10;
// const TIME_MULT = 24 * 60 * 60 / REAL_TIME_SECS_PER_DAY;
// const POLL_INTERVAL = 100;

function getDayOffset(start, end){
	end = end ?? new Date().getTime();
	return Math.floor((end - start) * TIME_MULT / MS_PER_DAY);
}

export default function Day({startTime}){
	let [start,] = useState(startTime ?? new Date().getTime());
	let [offset,] = useState(new Date(start).getDay());
	let [currDay, setDay] = useState(getDayOffset(start));

	useEffect(() => {
		let handle = setInterval(() => {
			let tmp = getDayOffset(start);
			if(currDay != tmp){
				setDay(tmp);
			}
		}, POLL_INTERVAL);

		return () => clearInterval(handle);
	}, [currDay]);

	return (
		<div>
			Day: {`${currDay} (${WEEK_DAYS[(currDay + offset) % WEEK_DAYS.length]})`}
		</div>
	);
}