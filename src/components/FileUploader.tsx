import { useState, useRef, type ChangeEvent } from "react";
import CsvWorker from "../workers/parseCSV.worker.ts?worker";
import type { LogEntry } from "../types/experiment";

interface FileUploaderProps {
  onDataParsed: (data: LogEntry[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);
  const bufferRef = useRef<LogEntry[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setIsParsing(true);
        setProgress(0);
        bufferRef.current = [];

        const worker = new CsvWorker();
        workerRef.current = worker;

        worker.postMessage(text);

        worker.onmessage = (e) => {
          const { type, data, progress: p } = e.data;

          if (type === "chunk" && Array.isArray(data)) {
            bufferRef.current.push(...data);
            if (typeof p === "number") {
              setProgress(Math.min(100, Math.round(p * 100)));
            }
          }

          if (type === "done") {
            setIsParsing(false);
            setProgress(100);
            onDataParsed(bufferRef.current);
            worker.terminate();
          }

          if (type === "error") {
            console.error("Worker error:", data);
            setIsParsing(false);
            worker.terminate();
          }
        };

        worker.onerror = (error) => {
          console.error("Worker crash:", error);
          setIsParsing(false);
          worker.terminate();
        };
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="my-6">
      <label className="block mb-2 text-sm sm:text-base font-medium text-gray-300">
        Upload CSV file:
      </label>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-400
          file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4
          file:rounded-md file:border-0
          file:text-sm sm:file:text-base file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700
          transition-all duration-200"
      />

      {isParsing && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-500 h-2.5 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1 text-right sm:text-left">
            {progress}% parsed
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
