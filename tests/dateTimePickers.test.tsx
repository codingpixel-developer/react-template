import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DatePicker } from '@/shared/components/ui/datePicker/datePicker';
import { TimePicker } from '@/shared/components/ui/timePicker/timePicker';

afterEach(cleanup);
const noop = () => {};

it('renders a controlled date as text without timezone conversion', () => {
  const { rerender } = render(
    <DatePicker label="Start date" value="2026-09-18" onChange={noop} />,
  );
  const input = screen.getByRole('textbox', {
    name: 'Start date',
  }) as HTMLInputElement;
  expect(input.type).toBe('text');
  expect(input.value).toBe('2026-09-18');
  rerender(
    <DatePicker label="Start date" value="2026-10-01" onChange={noop} />,
  );
  expect(input.value).toBe('2026-10-01');
});

it('selects a calendar date and reports a date-only string', async () => {
  let value: string | null = null;
  render(
    <DatePicker
      label="Start date"
      value="2026-09-18"
      onChange={(next) => {
        value = next;
      }}
    />,
  );
  fireEvent.click(screen.getByRole('textbox', { name: 'Start date' }));
  fireEvent.click(
    screen.getByLabelText(/Choose Sunday, September 20th, 2026/i),
  );
  expect(value).toBe('2026-09-20');
});

it('clears a date through its custom control', async () => {
  let value: string | null = '2026-09-18';
  render(
    <DatePicker
      label="Start date"
      value={value}
      onChange={(next) => {
        value = next;
      }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));
  expect(value).toBeNull();
});

it('rejects dates outside the allowed bounds', async () => {
  let value = 'unchanged';
  render(
    <DatePicker
      label="Start date"
      value="2026-09-18"
      minDate="2026-09-18"
      maxDate="2026-09-20"
      onChange={(next) => {
        value = next ?? '';
      }}
    />,
  );
  fireEvent.click(screen.getByRole('textbox', { name: 'Start date' }));
  const day = screen.getByLabelText(/September 21st, 2026/i);
  expect(day.getAttribute('aria-disabled')).toBe('true');
  fireEvent.click(day);
  expect(value).toBe('unchanged');
});

it('selects a time from the custom popup and reports HH:mm', async () => {
  let value: string | null = null;
  render(
    <TimePicker
      label="Start time"
      value="09:00"
      onChange={(next) => {
        value = next;
      }}
    />,
  );
  const input = screen.getByRole('textbox', {
    name: 'Start time',
  }) as HTMLInputElement;
  expect(input.type).toBe('text');
  expect(input.value).toBe('09:00');
  fireEvent.click(input);
  fireEvent.click(screen.getByText('10:30'));
  expect(value).toBe('10:30');
});

it('supports a single time bound and prevents out-of-range selection', async () => {
  let value = 'unchanged';
  render(
    <TimePicker
      label="Start time"
      value="09:00"
      minTime="09:00"
      onChange={(next) => {
        value = next ?? '';
      }}
    />,
  );
  fireEvent.click(screen.getByRole('textbox', { name: 'Start time' }));
  const early = screen.getByText('08:30');
  expect(early.getAttribute('aria-disabled')).toBe('true');
  fireEvent.click(early);
  expect(value).toBe('unchanged');
});

it('associates errors and disables input and clear controls', () => {
  render(
    <TimePicker
      label="Start time"
      value="09:00"
      onChange={noop}
      error="Choose a later time"
      disabled
    />,
  );
  const input = screen.getByRole('textbox', {
    name: 'Start time',
  }) as HTMLInputElement;
  expect(input.disabled).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(
    document.getElementById(input.getAttribute('aria-describedby') ?? '')
      ?.textContent,
  ).toBe('Choose a later time');
  expect(screen.queryByRole('button', { name: 'Clear time' })).toBeNull();
  fireEvent.click(input);
  expect(screen.queryByRole('listbox')).toBeNull();
});

it('does not display an out-of-range time after keyboard navigation', () => {
  let value = '09:00';
  render(
    <TimePicker
      label="Start time"
      value={value}
      minTime="09:00"
      onChange={(next) => {
        value = next ?? '';
      }}
    />,
  );
  const input = screen.getByRole('textbox', {
    name: 'Start time',
  }) as HTMLInputElement;
  fireEvent.click(input);
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.value).toBe('09:00');
  expect(value).toBe('09:00');
});
