import Papa from "papaparse";

self.onmessage = function (e) {
  const csvText = e.data;

  Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function (results) {
      const data = results.data;

      const parsed = (data as Record<string, unknown>[]).map((row) => {
        const {
          experiment_id,
          metric_name,
          step,
          value,
        } = row;

        if (
          typeof experiment_id !== "string" ||
          typeof metric_name !== "string" ||
          typeof step !== "number" ||
          typeof value !== "number"
        ) {
          return null;
        }

        return { experiment_id, metric_name, step, value };
      }).filter(Boolean);

      self.postMessage(parsed);
    },
  });
};

export default {} as typeof Worker & (new () => Worker);