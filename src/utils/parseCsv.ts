import type { LogEntry } from "../types/experiment";

export const parseCSV = (csvText: string): LogEntry[] => {
  const rows = csvText.split("\n").filter((row) => row.trim().length > 0);
  const result: LogEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const parts = rows[i].split(",");

    if (parts.length !== 5) continue;

    const experiment_id = parts[1].trim();
    const metric_name = parts[2].trim();
    const step = Number(parts[3]);
    const value = Number(parts[4]);

    if (!experiment_id || !metric_name) continue;
    if (isNaN(step) || isNaN(value)) continue;

    result.push({
      experiment_id,
      metric_name,
      step,
      value,
    });
  }

  return result;
};