import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";

export default function SimpleAssetChart({ chart }) {

  const formattedData = chart?.bars?.map((bar) => ({
    value: bar.c, // Precio de cierre (close)
  })) ?? [];

  // Get min & max values safely
  const values = formattedData.map((d) => d.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 100; // Default to 100 if empty

  const domain = ([Math.floor(minValue - 2), Math.floor(maxValue + 2)]);

  return (
    <div style={{ maxWidth: "160px", width: "100%" }}>
      <ResponsiveContainer width="100%" height={50}>
        <LineChart data={formattedData}>
            <YAxis hide={true}  domain={domain} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}