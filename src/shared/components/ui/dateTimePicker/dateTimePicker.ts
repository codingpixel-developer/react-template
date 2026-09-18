import type { FocusEventHandler } from 'react';
import type { DatePickerProps as PackagePickerProps } from 'react-datepicker';

export interface PickerFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  className?: string;
  locale?: PackagePickerProps['locale'];
  onBlur?: FocusEventHandler<HTMLElement>;
}

const pad = (value: number) => String(value).padStart(2, '0');

export function formatDate(value: Date): string {
  return `${String(value.getFullYear()).padStart(4, '0')}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function parseDate(value?: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return formatDate(date) === value ? date : null;
}

export function formatTime(value: Date): string {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function parseTime(value?: string | null): Date | null {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute);
}
