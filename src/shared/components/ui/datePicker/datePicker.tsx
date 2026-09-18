import { useId } from 'react';
import ReactDatePicker from 'react-datepicker';
import {
  formatDate,
  parseDate,
} from '@/shared/components/ui/dateTimePicker/dateTimePicker';
import type { PickerFieldProps } from '@/shared/components/ui/dateTimePicker/dateTimePicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@/shared/components/ui/dateTimePicker/dateTimePicker.module.scss';

export interface DatePickerProps extends PickerFieldProps {
  minDate?: string;
  maxDate?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  id,
  name,
  placeholder = 'YYYY-MM-DD',
  helpText,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  clearable = true,
  clearLabel = 'Clear date',
  className,
  locale,
  onBlur,
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId =
    error || helpText ? `${inputId}-description` : undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <ReactDatePicker
        id={inputId}
        name={name}
        selected={parseDate(value)}
        onChange={(date: Date | null) =>
          onChange(date ? formatDate(date) : null)
        }
        minDate={parseDate(minDate) ?? undefined}
        maxDate={parseDate(maxDate) ?? undefined}
        dateFormat="yyyy-MM-dd"
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
