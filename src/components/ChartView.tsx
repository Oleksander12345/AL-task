import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { LogEntry } from "../types/experiment";

interface ChartViewProps {
  logData: LogEntry[];
  selectedExperiments: string[];
  selectedMetric: string | null;
}

const ChartView: React.FC<ChartViewProps> = ({
  logData,
  selectedExperiments,
  selectedMetric,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  useEffect(() => {
    if (
      !selectedMetric ||
      selectedExperiments.length === 0 ||
      !chartRef.current
    )
      return;

    const filtered = logData.filter(
      (d) =>
        d.metric_name === selectedMetric &&
        selectedExperiments.includes(d.experiment_id)
    );

    const steps = [...new Set(filtered.map((d) => d.step))].sort((a, b) => a - b);

    const datasets: Record<string, (number | null)[]> = {};

    selectedExperiments.forEach((expId) => {
      datasets[expId] = steps.map((step) => {
        const point = filtered.find(
          (d) => d.step === step && d.experiment_id === expId
        );
        return point ? point.value : null;
      });
    });

    const uplotData: uPlot.AlignedData = [
      steps,
      ...selectedExperiments.map((expId) => datasets[expId]),
    ];

    const series: uPlot.Series[] = [
      { label: "Step" },
      ...selectedExperiments.map((expId) => ({
        label: expId,
        stroke: "#" + intToColor(expId),
        width: 2,
      })),
    ];

    const options = {
      width: chartRef.current.clientWidth,
      height: 350,
      pixelRatio: window.devicePixelRatio, // ✅ згладжування
      series,
      scales: {
        x: { time: false },
        y: { auto: true },
      },
      axes: [
        { stroke: "#999", grid: { stroke: "#eee" } },
        { stroke: "#999", grid: { stroke: "#eee" } },
      ],
    };

    if (plotRef.current) {
      plotRef.current.setData(uplotData);
    } else {
      plotRef.current = new uPlot(options, uplotData, chartRef.current);
    }

    return () => {
      plotRef.current?.destroy();
      plotRef.current = null;
    };
  }, [logData, selectedExperiments, selectedMetric]);

  return (
    <div className="w-full mt-4">
        <div className="w-full mt-4 min-h-[350px] relative">
            {selectedExperiments.length > 3 ? (
                <p className="text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                Please select up to 3 experiments to avoid performance issues.
                </p>
            ) : (
                <div ref={chartRef} className="w-full h-[350px]" />
            )}
        </div>
    </div>
  );
};

export default React.memo(ChartView);

// 🔧 Хелпер для кольорів
function intToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = ((hash >> 24) ^ (hash >> 16) ^ (hash >> 8) ^ hash) & 0x00ffffff;
  return ("00000" + color.toString(16)).slice(-6);
}
