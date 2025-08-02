import { useState, useMemo } from "react";
import FileUploader from "./components/FileUploader";
import ExperimentList from "./components/ExperimentList";
import ChartView from "./components/ChartView";
import type { LogEntry } from "./types/experiment";

function App() {
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 👁️‍🗨️ Перейменування метрик для інтерфейсу
  const metricDisplayMap: Record<string, string> = {
    metric_1: "train_loss",
    metric_2: "val_loss",
    metric_3: "train_accuracy",
    metric_4: "val_accuracy",
  };

  const experimentIds = useMemo(
    () => Array.from(new Set(logData.map((item) => item.experiment_id))),
    [logData]
  );

  const metrics = useMemo(
    () => Array.from(new Set(logData.map((d) => d.metric_name))),
    [logData]
  );

  const handleParsedData = (data: LogEntry[]) => {
    setIsLoading(true);
    setTimeout(() => {
      setLogData(data);
      setSelectedExperiments([]);
      setSelectedMetric(null);
      setIsLoading(false);
    }, 50);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Experiment Log Visualizer
      </h1>

      {isLoading && (
        <p className="text-blue-600 text-lg mb-4">
          Loading file, please wait...
        </p>
      )}

      <FileUploader onDataParsed={handleParsedData} />

      {experimentIds.length > 0 && (
        <ExperimentList
          experimentIds={experimentIds}
          selected={selectedExperiments}
          onChange={setSelectedExperiments}
        />
      )}

      {metrics.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select metric to view:</label>
          <select
            className="border p-2 rounded w-full md:w-1/2"
            onChange={(e) => setSelectedMetric(e.target.value)}
            value={selectedMetric ?? ""}
          >
            <option value="">-- Choose a metric --</option>
            {metrics.map((metric) => (
              <option key={metric} value={metric}>
                {metricDisplayMap[metric] || metric}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMetric && selectedExperiments.length > 0 && (
        <>
          <h2 className="text-xl font-semibold my-4">
            Viewing Metric:{" "}
            <span className="text-blue-700">
              {metricDisplayMap[selectedMetric] || selectedMetric}
            </span>
          </h2>

          <ChartView
            logData={logData}
            selectedExperiments={selectedExperiments}
            selectedMetric={selectedMetric}
          />
        </>
      )}
    </div>
  );
}

export default App;
