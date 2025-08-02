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
    <div className="my-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-300 text-center sm:text-left">
        Select Experiments (max 3):
      </h2>

      {error && (
        <p className="text-red-500 mb-3 text-center sm:text-left">{error}</p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {experimentIds.map((id) => (
          <li
            key={id}
            onClick={() => toggleSelection(id)}
            className={`cursor-pointer text-center px-4 py-2 rounded-lg font-medium transition duration-200
              ${
                selected.includes(id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
