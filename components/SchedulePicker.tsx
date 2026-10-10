'use client';

import type { ScheduleData } from '@/lib/types';
import { ASAP_WAIT_MINUTES } from '@/lib/trip';

interface Props {
  value: ScheduleData;
  onChange: (value: ScheduleData) => void;
}

function nowLocalDatetimeString(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function SchedulePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">When do you need pickup?</label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ mode: 'now' })}
          className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            value.mode === 'now'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/10'
              : 'border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          ⚡ Right Now
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'scheduled', dateTime: value.dateTime ?? '' })}
          className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            value.mode === 'scheduled'
              ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/10'
              : 'border-gray-700 text-gray-400 hover:border-gray-600'
          }`}
        >
          📅 Schedule Ahead
        </button>
      </div>

      {value.mode === 'now' ? (
        <p className="text-xs text-gray-500">
          We&apos;ll dispatch a driver right away. Estimated wait: <span className="text-brand-cyan">~{ASAP_WAIT_MINUTES} minutes</span>.
        </p>
      ) : (
        <div>
          <input
            type="datetime-local"
            value={value.dateTime ?? ''}
            min={nowLocalDatetimeString()}
            onChange={(e) => onChange({ mode: 'scheduled', dateTime: e.target.value })}
            className="input-brand"
          />
          <p className="text-xs text-gray-600 mt-1">Choose when you&apos;d like to be picked up.</p>
        </div>
      )}
    </div>
  );
}
