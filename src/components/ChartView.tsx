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
import { useDebounce } from "../hooks/useDebounce";

interface ChartViewProps {
  logData: LogEntry[];
  selectedExperiments: string[];
  selectedMetric: string | null;
}

interface MetricPoint {
  step: number;
  [experimentId: string]: number | string;
}

interface MetricStats {
  min: number;
  max: number;
  avg: number;
}

const metricColorMap: Record<string, string> = {
  metric_1: "#3b82f6",
  metric_2: "#f87171",
  metric_3: "#22c55e",
  metric_4: "#facc15",
  metric_5: "#8b5cf6",
};

function intToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = ((hash >> 24) ^ (hash >> 16) ^ (hash >> 8) ^ hash) & 0x00ffffff;
  return ("00000" + color.toString(16)).slice(-6);
}

const compressData = (data: MetricPoint[], groupSize = 5): MetricPoint[] => {
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
  const debouncedMetric = useDebounce(selectedMetric, 300);
  const debouncedExperiments = useDebounce(selectedExperiments, 300);

  const { data, stats } = useMemo(() => {
    if (!debouncedMetric || debouncedExperiments.length === 0)
      return { data: [], stats: {} };

    const entries = logData.filter(
      (d) =>
        d.metric_name === debouncedMetric &&
        debouncedExperiments.includes(d.experiment_id)
    );

    const grouped: Record<number, MetricPoint> = {};
    const valueMap: Record<string, number[]> = {};

    for (const entry of entries) {
      if (!grouped[entry.step]) {
        grouped[entry.step] = { step: entry.step };
      }
      grouped[entry.step][entry.experiment_id] = entry.value;

      if (!valueMap[entry.experiment_id]) valueMap[entry.experiment_id] = [];
      valueMap[entry.experiment_id].push(entry.value);
    }

    const stats: Record<string, MetricStats> = {};
    for (const expId of Object.keys(valueMap)) {
      const values = valueMap[expId];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      stats[expId] = { min, max, avg: parseFloat(avg.toFixed(4)) };
    }

    const fullData = Object.values(grouped).sort((a, b) => a.step - b.step);
    const compressed = compressData(fullData, 5);

    return { data: compressed, stats };
  }, [logData, debouncedExperiments, debouncedMetric]);

  const tooMany = debouncedExperiments.length > 3;

  return (
    <div className="w-full mt-6 min-h-[350px]">
      {tooMany ? (
        <p className="text-red-500 font-medium text-sm sm:text-base">
          Please select up to 3 experiments only to avoid performance issues.
        </p>
      ) : !debouncedMetric || data.length === 0 ? (
        <p className="text-gray-400 text-sm sm:text-base">No data to display.</p>
      ) : (
        <>
          <div className="w-full h-[250px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="step" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    borderColor: "#374151",
                    color: "white",
                  }}
                  labelStyle={{ color: "#93c5fd" }}
                />
                <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                {debouncedExperiments.map((expId) => (
                  <Line
                    key={expId}
                    type="monotone"
                    dataKey={expId}
                    stroke={
                      metricColorMap[debouncedMetric!] ||
                      `#${intToColor(expId)}`
                    }
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3 text-sm sm:text-base">
            {debouncedExperiments.map((expId) => {
              const s = stats[expId];
              const color =
                metricColorMap[debouncedMetric!] ||
                `#${intToColor(expId)}`;

              return (
                <div
                  key={expId}
                  className="border border-gray-700 px-4 py-3 rounded-md bg-gray-800 text-gray-300"
                >
                  <strong className="text-white">{expId}</strong> —{" "}
                  <span style={{ color }}>
                    min: {s.min.toFixed(3)}, max: {s.max.toFixed(3)}, avg:{" "}
                    {s.avg.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(ChartView);
