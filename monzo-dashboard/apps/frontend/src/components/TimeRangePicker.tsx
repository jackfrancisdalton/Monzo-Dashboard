import React, { useState } from 'react';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subWeeks
} from 'date-fns';

interface TimeRangePickerProps {
  onChange: (range: { start: Date; end: Date }) => void;
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ onChange }) => {
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
        <button onClick={selectWeekSoFar} className="p-2 bg-blue-500 text-white rounded">Week so far</button>
        <button onClick={selectThisFullWeek} className="p-2 bg-blue-500 text-white rounded">This week</button>
        <button onClick={selectLastWeek} className="p-2 bg-blue-500 text-white rounded">Last week</button>
      </div>

      {/* Months */}
      <div className="flex gap-1 ml-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <button
            key={i}
            onClick={() => selectMonth(i)}
            className="p-2 bg-purple-500 text-white rounded"
          >
            {new Date(0, i).toLocaleString('default', { month: 'short' })}
          </button>
        ))}
      </div>

      {/* Year */}
      <div className="flex gap-1 ml-4">
        <button onClick={selectThisYear} className="p-2 bg-orange-500 text-white rounded">This year</button>
        <button onClick={selectLastYear} className="p-2 bg-orange-500 text-white rounded">Last year</button>
      </div>

      {/* Custom */}
      <div className="flex gap-1 items-center ml-4">
        <input type="date" onChange={(e) => setCustomStart(new Date(e.target.value))} className="px-1 py-1 border rounded"/>
        <span>to</span>
        <input type="date" onChange={(e) => setCustomEnd(new Date(e.target.value))} className="px-1 py-1 border rounded"/>
        <button onClick={applyCustom} className="p-2 bg-green-500 text-white rounded">Apply</button>
      </div>
    </div>
  );
};
