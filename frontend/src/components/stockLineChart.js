// Documentation from MUI X Charts
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';

const margin = { right: 24 };
const xLabels = [
  'Day 1',
  'Day 2',
  'Day 3',
  'Day 4',
  'Day 5',
  'Day 6',
  'Day 7',
  'Day 8',
  'Day 9',
  'Day 10',
  'Day 11',
  'Day 12',
  'Day 13',
  'Day 14',
  'Day 15',
  'Day 16',
  'Day 17',
  'Day 18',
  'Day 19',
  'Day 20',
  'Day 21',
  'Day 22',
  'Day 23',
  'Day 24',
  'Day 25',
  'Day 26',
  'Day 27',
  'Day 28',
  'Day 29',
  'Day 30',
];

export default function SimpleLineChart({ stockHistory }) {
    // Assigning the stock history. And if it is null we will send an empty array
    const dataToDisplay = stockHistory || [];
    // Checking if there is no data
    if (dataToDisplay === 0) {
        return (
            <Box>
                <p>No stock history available</p>
            </Box>
        )
    }
    // Slicing the X axis to see how many days the stock market was open (how many items we have in our array)
    const labelsToUse = xLabels.slice(0, dataToDisplay.length);

  return (
    <Box sx={{ width: '80%', height: 300 }}>
      <LineChart
        series={[
          { data: dataToDisplay, label: 'Stock Price' },
        ]}
        xAxis={[{ scaleType: 'point', data: labelsToUse }]}
        yAxis={[{ width: 50 }]}
        margin={margin}
      />
    </Box>
  );
}