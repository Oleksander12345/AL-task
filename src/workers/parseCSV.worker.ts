import Papa from "papaparse";
import type { LogEntry } from "../types/experiment";

function compressEntries(entries: LogEntry[], groupSize: number = 5): LogEntry[] {
  const grouped: Map<string, LogEntry[]> = new Map();

  for (const entry of entries) {
    const groupKey = `${entry.experiment_id}|${entry.metric_name}|${Math.floor(entry.step / groupSize) * groupSize}`;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }
    grouped.get(groupKey)!.push(entry);
  }

  const result: LogEntry[] = [];

  for (const [groupKey, groupEntries] of grouped.entries()) {
    const [experiment_id, metric_name, stepStr] = groupKey.split("|");
    const step = Number(stepStr);

    const avg =
      groupEntries.reduce((sum, e) => sum + e.value, 0) / groupEntries.length;

    result.push({
      experiment_id,
      metric_name,
      step,
      value: parseFloat(avg.toFixed(4)),
    });
  }

  return result;
}

self.onmessage = function (e) {
  const csvText = e.data;
  const totalLength = csvText.length;

  const rawEntries: LogEntry[] = [];

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
        rawEntries.push({ experiment_id, metric_name, step, value });

        const cursor = row.meta.cursor ?? 0;
        const progress = totalLength > 0 ? cursor / totalLength : 0;

        if (rawEntries.length % 500 === 0) {
          self.postMessage({ type: "progress", progress });
        }
      }
    },

    complete: function () {
      const compressed = compressEntries(rawEntries, 5);
      self.postMessage({ type: "chunk", data: compressed });
      self.postMessage({ type: "done" });
    },

    error: function (err) {
      self.postMessage({ type: "error", data: err.message });
    },
  });
};

export default {} as typeof Worker & (new () => Worker);
