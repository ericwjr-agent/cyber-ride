'use client';

import type { ScheduleData } from '@/lib/types';
import { ASAP_WAIT_MINUTES } from '@/lib/trip';
import { IconClock } from '@/components/icons';

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
      <label className="block text-sm font-medium text-gray-400">When do you need pickup?</label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ mode: 'now' })}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
            value.mode === 'now'
              ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
              : 'border-brand-border text-gray-500 hover:border-brand-gold/20 hover:text-gray-300'
          }`}
        >
          Right Now
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'scheduled', dateTime: value.dateTime ?? '' })}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
            value.mode === 'scheduled'
              ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5'
              : 'border-brand-border text-gray-500 hover:border-brand-gold/20 hover:text-gray-300'
          }`}
        >
          <IconClock className="w-4 h-4" />
          Schedule Ahead
        </button>
      </div>

      {value.mode === 'now' ? (
        <p className="text-xs text-gray-600">
          We&#39;ll dispatch a driver right away. Estimated wait: <span className="text-brand-gold">~{ASAP_WAIT_MINUTES} minutes</span>.
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
          <p className="text-xs text-gray-600 mt-1.5">Choose when you&#39;d like to be picked up.</p>
        </div>
      )}
    </div>
  );
}
