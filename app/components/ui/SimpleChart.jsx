"use client"
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const lineChartData = {
  labels: ['Monday', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sales',
      data: [3, 2, 2, 1, 5, 3, 7],
      borderColor: 'rgb(75, 192, 192)',
    }
  ]
}

export default function SimpleChart() {
  const [temporalBars, setTemporalBars] = useState([344.43, 362.43, 384.43, 400.43, 420.43, 430.43, 440.43]);
  
    return(
      <Line options={{}} data={lineChartData} />
    )
}