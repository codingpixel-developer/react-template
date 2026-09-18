import { useId, useRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import {
  formatTime,
  parseTime,
} from '@/shared/components/ui/dateTimePicker/dateTimePicker';
import type { PickerFieldProps } from '@/shared/components/ui/dateTimePicker/dateTimePicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/shared/components/ui/dateTimePicker/dateTimePicker.module.scss';

export interface TimePickerProps extends PickerFieldProps {
  minTime?: string;
  maxTime?: string;
  minuteStep?: number;
  timeCaption?: string;
}

export function TimePicker({
  label,
  value,
  onChange,
  minTime,
  maxTime,
  minuteStep = 15,
  timeCaption = 'Time',
  id,
  name,
  placeholder = 'HH:mm',
  helpText,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  clearable = true,
  clearLabel = 'Clear time',
  className,
  locale,
  onBlur,
}: TimePickerProps) {
  const generatedId = useId();
  const pickerRef = useRef<ReactDatePicker>(null);
  const minimum = parseTime(minTime);
  const maximum = parseTime(maxTime);
  const inputId = id ?? generatedId;
  const descriptionId =
    error || helpText ? `${inputId}-description` : undefined;
  const step =
    Number.isInteger(minuteStep) && minuteStep > 0 && minuteStep <= 60
      ? minuteStep
      : 15;
  const isAllowed = (date: Date) => {
    const time = formatTime(date);
    return (
      (!minimum || time >= formatTime(minimum)) &&
      (!maximum || time <= formatTime(maximum))
    );
  };
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <ReactDatePicker
        ref={pickerRef}
        id={inputId}
        name={name}
        selected={parseTime(value)}
        onChange={(date: Date | null) => {
          if (!date || isAllowed(date))
            onChange(date ? formatTime(date) : null);
          else pickerRef.current?.resetInputValue();
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={step}
        timeCaption={timeCaption}
        timeFormat="HH:mm"
        dateFormat="HH:mm"
        filterTime={isAllowed}
        strictParsing
        placeholderText={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        isClearable={clearable && !disabled && !readOnly}
        ariaLabelClose={clearLabel}
        clearButtonTitle={clearLabel}
        ariaInvalid={error ? 'true' : 'false'}
        ariaDescribedBy={descriptionId}
        onBlur={onBlur}
        locale={locale}
        autoComplete="off"
        className={styles.input}
        wrapperClassName={styles.wrapper}
        calendarClassName={styles.calendar}
        popperClassName={styles.popper}
        showPopperArrow={false}
        popperPlacement="bottom-start"
      />
      {(error || helpText) && (
        <span
          id={descriptionId}
          role={error ? 'alert' : undefined}
          className={error ? styles.error : styles.help}
        >
          {error || helpText}
        </span>
      )}
    </div>
  );
}
