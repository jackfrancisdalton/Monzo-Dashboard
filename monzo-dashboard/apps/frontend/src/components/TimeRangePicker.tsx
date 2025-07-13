import { useState } from 'react';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subWeeks
} from 'date-fns';

interface TimeRangePickerProps {
  onChange: (range: { start: Date; end: Date }) => void;
  disabled?: boolean;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ onChange, disabled = false }) => {
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const today = new Date();

  const selectWeekSoFar = () => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = today;
    onChange({ start, end });
  };

  const selectThisFullWeek = () => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    onChange({ start, end });
  };

  const selectLastWeek = () => {
    const lastWeek = subWeeks(today, 1);
    const start = startOfWeek(lastWeek, { weekStartsOn: 1 });
    const end = endOfWeek(lastWeek, { weekStartsOn: 1 });
    onChange({ start, end });
  };

  const selectMonth = (month: number) => {
    const year = today.getFullYear();
    const date = new Date(year, month, 1);
    onChange({ start: startOfMonth(date), end: endOfMonth(date) });
  };

  const selectThisYear = () => {
    onChange({ start: startOfYear(today), end: endOfYear(today) });
  };

  const selectLastYear = () => {
    const lastYearDate = new Date(today.getFullYear() - 1, 0, 1);
    onChange({ start: startOfYear(lastYearDate), end: endOfYear(lastYearDate) });
  };

  const applyCustom = () => {
    if (customStart && customEnd) {
      onChange({ start: customStart, end: customEnd });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl shadow bg-gray-900 text-sm">
      {/* Weeks */}
      <div className="flex gap-1">
        <button
          onClick={selectWeekSoFar}
          disabled={disabled}
          className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Week so far
        </button>
        <button
          onClick={selectThisFullWeek}
          disabled={disabled}
          className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          This week
        </button>
        <button
          onClick={selectLastWeek}
          disabled={disabled}
          className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Last week
        </button>
      </div>

      {/* Months */}
      <div className="flex gap-1 ml-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <button
            key={i}
            onClick={() => selectMonth(i)}
            disabled={disabled}
            className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
          >
            {new Date(0, i).toLocaleString('default', { month: 'short' })}
          </button>
        ))}
      </div>

      {/* Year */}
      <div className="flex gap-1 ml-4">
        <button
          onClick={selectThisYear}
          disabled={disabled}
          className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
        >
          This year
        </button>
        <button
          onClick={selectLastYear}
          disabled={disabled}
          className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
        >
          Last year
        </button>
      </div>

      {/* Custom */}
      <div className="flex gap-1 items-center ml-4">
        <input
          type="date"
          onChange={(e) => setCustomStart(new Date(e.target.value))}
          disabled={disabled}
          className={`px-1 py-1 border rounded ${disabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
        />
        <span>to</span>
        <input
          type="date"
          onChange={(e) => setCustomEnd(new Date(e.target.value))}
          disabled={disabled}
          className={`px-1 py-1 border rounded ${disabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
        />
        <button
          onClick={applyCustom}
          disabled={disabled}
          className={`p-2 rounded cursor-pointer ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default TimeRangePicker;