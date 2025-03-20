import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { name: "T1", value: 400 },
  { name: "T2", value: 300 },
  { name: "T3", value: 600 },
  { name: "T4", value: 800 },
  { name: "T5", value: 500 },
  { name: "T6", value: 900 },
  { name: "T7", value: 750 },
];

const SimpleAreaChart = () => {
  return (
    <BarChart width={300} height={200} data={data} className="mx-auto">
      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
      <XAxis dataKey="name" stroke="#ffffff" />
      <YAxis stroke="#ffffff" />
      <Tooltip
        contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
        labelStyle={{ color: "#ffffff" }}
      />
      <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} />
    </BarChart>
  );
};

export default SimpleAreaChart;
