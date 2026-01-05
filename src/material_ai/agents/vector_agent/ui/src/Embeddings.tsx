import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

const distanceLinePlugin = {
  id: 'distanceLines',
  beforeDraw: (chart: any) => {
    const { ctx, scales: { x, y } } = chart;
    const connections = chart.config.options.plugins.distanceLines.connections;

    if (!connections) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';

    connections.forEach((link: any) => {
      // 1. Get Pixel Coordinates
      const sX = x.getPixelForValue(link.from.x);
      const sY = y.getPixelForValue(link.from.y);
      const eX = x.getPixelForValue(link.to.x);
      const eY = y.getPixelForValue(link.to.y);

      // 2. Draw the Line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(sX, sY);
      ctx.lineTo(eX, eY);
      ctx.stroke();

      // 3. Calculate Euclidean Distance
      const dist = Math.sqrt(
        Math.pow(link.to.x - link.from.x, 2) + 
        Math.pow(link.to.y - link.from.y, 2)
      ).toFixed(2);

      // 4. Find Midpoint for Label
      const midX = (sX + eX) / 2;
      const midY = (sY + eY) / 2;

      // 5. Draw Label Background (optional, for readability)
      const textWidth = ctx.measureText(dist).width;
      ctx.fillStyle = 'white';
      ctx.fillRect(midX - (textWidth/2) - 2, midY - 7, textWidth + 4, 14);

      // 6. Draw Text
      ctx.fillStyle = '#1976d2'; // Material Blue
      ctx.fillText(dist, midX, midY);
    });

    ctx.restore();
  }
};

ChartJS.register(distanceLinePlugin);

export const EmbeddingChart = ({
  coords,
}: {
  coords: any
}) => {
  const data = {
    datasets: [
      {
        label: 'Word Embeddings',
        data: coords.nodes,
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => context.raw.label,
        },
      },
      distanceLines: {
        connections: coords.connections
      }
    },
    scales: {
      x: { title: { display: true, text: 'X Axis' } },
      y: { title: { display: true, text: 'Y Axis' } },
    },
  }

  return (
    <div
      className="chart-container"
      style={{
        position: 'relative',
        height: '300px',
        width: '99%',
        overflow: 'scroll',
      }}
    >
      <Scatter data={data} options={options} />
    </div>
  )
}


