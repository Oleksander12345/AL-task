import Papa from "papaparse";
import type { LogEntry } from "../types/experiment";

self.onmessage = function (e) {
  const csvText = e.data;
  const totalLength = csvText.length;

  Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,

    step: function (row) {
      const rowData = row.data as Record<string, unknown>;

      const experiment_id = rowData["experiment_id"];
      const metric_name = rowData["metric_name"];
      const step = rowData["step"];
      const value = rowData["value"];

      if (
        typeof experiment_id === "string" &&
        typeof metric_name === "string" &&
        typeof step === "number" &&
        typeof value === "number"
      ) {
        const entry: LogEntry = {
          experiment_id,
          metric_name,
          step,
          value,
        };

        const cursor = row.meta.cursor ?? 0;
        const progress = totalLength > 0 ? cursor / totalLength : 0;

        self.postMessage({ type: "chunk", data: [entry], progress });
      }
    },

    complete: function () {
      self.postMessage({ type: "done" });
    },

    error: function (err) {
      self.postMessage({ type: "error", data: err.message });
    },
  });
};

export default {} as typeof Worker & (new () => Worker);
