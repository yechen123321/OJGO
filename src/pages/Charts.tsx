import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Typography } from "antd";

const data = [
  { name: "周一", uv: 400 },
  { name: "周二", uv: 300 },
  { name: "周三", uv: 200 },
  { name: "周四", uv: 278 },
  { name: "周五", uv: 189 },
  { name: "周六", uv: 239 },
  { name: "周日", uv: 349 },
];

const Charts: React.FC = () => {
  return (
    <div style={{ width: "100%", height: 360 }}>
      <Typography.Title level={3}>图表示例（Recharts）</Typography.Title>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="uv" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
