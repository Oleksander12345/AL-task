import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { LogEntry } from "../types/experiment";

interface ChartViewProps {
  logData: LogEntry[];
  selectedExperiments: string[];
  selectedMetric: string | null;
}

interface MetricPoint {
  step: number;
  [experimentId: string]: number | string;
}

// 🔧 Генерує унікальний HEX-колір із experiment_id
function intToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = ((hash >> 24) ^ (hash >> 16) ^ (hash >> 8) ^ hash) & 0x00ffffff;
  return ("00000" + color.toString(16)).slice(-6);
}

// 🔧 Усереднює значення кожних N точок
const compressData = (data: MetricPoint[], groupSize: number = 5): MetricPoint[] => {
  const result: MetricPoint[] = [];

  for (let i = 0; i < data.length; i += groupSize) {
    const group = data.slice(i, i + groupSize);
    const base: MetricPoint = { step: group[0].step };

    for (const key of Object.keys(group[0])) {
      if (key === "step") continue;

      const avg =
        group.reduce((sum, d) => sum + (Number(d[key]) || 0), 0) / group.length;
      base[key] = parseFloat(avg.toFixed(4));
    }

    result.push(base);
  }

  return result;
};

const ChartView: React.FC<ChartViewProps> = ({
  logData,
  selectedExperiments,
  selectedMetric,
}) => {
  const data = useMemo(() => {
    if (!selectedMetric || selectedExperiments.length === 0) return [];

    const entries = logData.filter(
      (d) =>
        d.metric_name === selectedMetric &&
        selectedExperiments.includes(d.experiment_id)
    );

    const grouped: Record<number, MetricPoint> = {};

    for (const entry of entries) {
      if (!grouped[entry.step]) {
        grouped[entry.step] = { step: entry.step };
      }
      grouped[entry.step][entry.experiment_id] = entry.value;
    }

    const fullData = Object.values(grouped).sort((a, b) => a.step - b.step);

    return compressData(fullData, 5); // кожні 5 кроків — 1 точка
  }, [logData, selectedExperiments, selectedMetric]);

  // 🔐 Перевірка обмеження
  if (selectedExperiments.length > 3) {
    return (
      <p className="text-red-600 mt-4">
        Please select up to 3 experiments only to avoid performance issues.
      </p>
    );
  }

  if (!selectedMetric || data.length === 0) {
    return <p className="text-gray-500 mt-4">No data to display.</p>;
  }

  return (
    <div className="w-full mt-4">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedExperiments.map((expId) => (
            <Line
              key={expId}
              type="monotone"
              dataKey={expId}
              stroke={`#${intToColor(expId)}`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(ChartView);
