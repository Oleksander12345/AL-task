import React, { useState } from "react";

interface ExperimentListProps {
  experimentIds: string[];
  selected: string[];
  onChange: (selectedIds: string[]) => void;
}

const ExperimentList: React.FC<ExperimentListProps> = ({
  experimentIds,
  selected,
  onChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setError(null);
      onChange(selected.filter((item) => item !== id));
    } else {
      if (selected.length >= 3) {
        setError("You can select up to 3 experiments only.");
        return;
      }
      setError(null);
      onChange([...selected, id]);
    }
  };

  return (
    <div className="my-4">
      <h2 className="text-lg font-semibold mb-2">Select Experiments (max 3):</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {experimentIds.map((id) => (
          <li
            key={id}
            onClick={() => toggleSelection(id)}
            className={`cursor-pointer px-4 py-2 border rounded transition ${
              selected.includes(id)
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExperimentList;
