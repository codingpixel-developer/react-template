import { useState } from 'react';
import { DatePicker } from '@/shared/components/ui/datePicker/datePicker';
import { TimePicker } from '@/shared/components/ui/timePicker/timePicker';

export function DateTimePickerExamples() {
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DatePicker
        label="Appointment date"
        value={date}
        onChange={setDate}
        helpText="Choose a date from the calendar or type YYYY-MM-DD."
      />
      <TimePicker
        label="Appointment time"
        value={time}
        onChange={setTime}
        helpText="Choose a time or type HH:mm (24-hour)."
      />
    </div>
  );
}
