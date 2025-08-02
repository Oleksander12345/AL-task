import type { ChangeEvent } from "react";
import { parseCSV } from "../utils/parseCsv";
import type { LogEntry } from "../types/experiment";

interface FileUploaderProps {
  onDataParsed: (data: LogEntry[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        const parsedData = parseCSV(text)
        onDataParsed(parsedData);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="my-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Upload CSV file:
      </label>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
    </div>
  );
};

export default FileUploader;
