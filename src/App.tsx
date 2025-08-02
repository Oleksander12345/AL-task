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
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 py-10 font-sans">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Experiment Log Visualizer
      </h1>

      {isLoading && (
        <p className="text-blue-500 text-base sm:text-lg mb-6 text-center">
          Loading file, please wait...
        </p>
      )}

      <div className="max-w-5xl w-full mx-auto">
        <FileUploader onDataParsed={handleParsedData} />

        {experimentIds.length > 0 && (
          <ExperimentList
            experimentIds={experimentIds}
            selected={selectedExperiments}
            onChange={setSelectedExperiments}
          />
        )}

        {metrics.length > 0 && (
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-300 text-sm sm:text-base">
              Select metric to view:
            </label>
            <select
              className="w-full sm:w-2/3 md:w-1/2 bg-gray-800 border border-gray-700 text-white rounded px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => setSelectedMetric(e.target.value)}
              value={selectedMetric ?? ""}
            >
              <option value="" className="text-gray-400">
                -- Choose a metric --
              </option>
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
            <h2 className="text-lg sm:text-xl font-semibold my-6">
              Viewing Metric:{" "}
              <span className="text-purple-400 break-all">
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
    </div>
  );
}

export default App;
