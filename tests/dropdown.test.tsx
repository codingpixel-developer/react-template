import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dropdown } from '@/shared/components/ui/dropdown/dropdown';

const alice = { id: 1, label: 'Alice' };
const bob = { id: 2, label: 'Bob' };
const zoe = { id: 9, label: 'Zoe' };
const noop = () => {};
afterEach(cleanup);

function remote(element: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{element}</QueryClientProvider>,
  );
}

function scrollToBottom() {
  const list = screen.getByRole('listbox');
  Object.defineProperties(list, {
    scrollHeight: { configurable: true, value: 600 },
    clientHeight: { configurable: true, value: 200 },
    scrollTop: { configurable: true, value: 400 },
  });
  fireEvent.scroll(list);
}

describe('Dropdown', () => {
  it('pins a missing selected item and filters static items by search', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        label="Person"
        items={[alice, bob]}
        selectedItem={zoe}
        onSelect={noop}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Person/ }));
    expect(
      screen.getAllByRole('option').map((item) => item.textContent),
    ).toEqual(['Zoe', 'Alice', 'Bob']);
    await user.type(screen.getByRole('combobox'), 'Bob');
    expect(
      screen.getAllByRole('option').map((item) => item.textContent),
    ).toEqual(['Zoe', 'Bob']);
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('preserves first-page order when selected item is already present', async () => {
    render(
      <Dropdown
        label="Person"
        items={[alice, zoe, bob]}
        selectedItem={zoe}
        onSelect={noop}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Person/ }));
    expect(
      screen.getAllByRole('option').map((item) => item.textContent),
    ).toEqual(['Alice', 'Zoe', 'Bob']);
  });

  it('selects with keyboard, skips disabled items, closes and restores focus', async () => {
    let selected = '';
    const user = userEvent.setup();
    render(
      <Dropdown
        label="Person"
        items={[{ ...alice, disabled: true }, bob]}
        onSelect={(item) => {
          selected = item.label;
        }}
      />,
    );
    const trigger = screen.getByRole('button', { name: /Person/ });
    await user.click(trigger);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(selected).toBe('Bob');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('uses the same component for actions and never submits its enclosing form', async () => {
    let action = '';
    let submitted = false;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitted = true;
        }}
      >
        <Dropdown
          mode="action"
          label="Actions"
          searchable={false}
          items={[alice, { ...bob, destructive: true, dividerBefore: true }]}
          onSelect={(item) => {
            action = item.label;
          }}
        />
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Bob' }));
    expect(action).toBe('Bob');
    expect(submitted).toBe(false);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('loads subsequent pages once and keeps a selected duplicate pinned', async () => {
    const calls: number[] = [];
    remote(
      <Dropdown
        label="Person"
        queryKey={['people']}
        selectedItem={zoe}
        onSelect={noop}
        loadOptions={async ({ page }) => {
          calls.push(page);
          return page === 1
            ? { items: [alice], hasMore: true }
            : { items: [zoe, bob, alice], hasMore: false };
        }}
      />,
    );
    expect(calls).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: /Person/ }));
    await screen.findByRole('option', { name: 'Alice' });
    scrollToBottom();
    scrollToBottom();
    await screen.findByRole('option', { name: 'Bob' });
    expect(
      screen.getAllByRole('option').map((item) => item.textContent),
    ).toEqual(['Zoe', 'Alice', 'Bob']);
    scrollToBottom();
    expect(calls).toEqual([1, 2]);
  });

  it('debounces remote search, starts at page one and ignores stale results', async () => {
    const calls: string[] = [];
    let finishOld:
      | ((value: { items: (typeof alice)[]; hasMore: boolean }) => void)
      | undefined;
    remote(
      <Dropdown
        label="Person"
        queryKey={['people']}
        debounceMs={10}
        onSelect={noop}
        loadOptions={async ({ page, search }) => {
          calls.push(`${search}:${page}`);
          if (search === 'a')
            return new Promise<{ items: (typeof alice)[]; hasMore: boolean }>(
              (resolve) => {
                finishOld = resolve;
              },
            );
          return { items: search === 'b' ? [bob] : [alice], hasMore: false };
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Person/ }));
    await screen.findByRole('option', { name: 'Alice' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    await waitFor(() => expect(calls).toContain('a:1'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    await screen.findByRole('option', { name: 'Bob' });
    finishOld?.({ items: [zoe], hasMore: false });
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: 'Zoe' })).toBeNull(),
    );
    expect(calls).toEqual([':1', 'a:1', 'b:1']);
  });

  it('preserves loaded items on next-page failure and retries the failed page', async () => {
    let failed = false;
    remote(
      <Dropdown
        label="Person"
        queryKey={['people']}
        onSelect={noop}
        loadOptions={async ({ page }) => {
          if (page === 1) return { items: [alice], hasMore: true };
          if (!failed) {
            failed = true;
            throw new Error('Offline');
          }
          return { items: [bob], hasMore: false };
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Person/ }));
    await screen.findByRole('option', { name: 'Alice' });
    scrollToBottom();
    await screen.findByRole('alert');
    expect(screen.getByRole('option', { name: 'Alice' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('option', { name: 'Bob' });
  });

  it('reflects a changed controlled selection without retaining the old injected item', async () => {
    const { rerender } = render(
      <Dropdown
        label="Person"
        items={[alice]}
        selectedItem={zoe}
        onSelect={noop}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Person/ }));
    rerender(
      <Dropdown
        label="Person"
        items={[alice]}
        selectedItem={bob}
        onSelect={noop}
      />,
    );
    expect(
      screen.getAllByRole('option').map((item) => item.textContent),
    ).toEqual(['Bob', 'Alice']);
  });
  it('keeps keyboard highlight on the same item when the selection prop inserts a row', async () => {
    let selected = '';
    const onSelect = (item: typeof alice) => {
      selected = item.label;
    };
    const { rerender } = render(
      <Dropdown label="Person" items={[alice, bob]} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Person/ }));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    rerender(
      <Dropdown
        label="Person"
        items={[alice, bob]}
        selectedItem={zoe}
        onSelect={onSelect}
      />,
    );
    await userEvent.keyboard('{Enter}');
    expect(selected).toBe('Bob');
  });

  it('focuses a remote action once the first page arrives without search', async () => {
    let selected = '';
    remote(
      <Dropdown
        mode="action"
        label="Actions"
        searchable={false}
        queryKey={['actions']}
        onSelect={(item) => {
          selected = item.label;
        }}
        loadOptions={async () => ({ items: [alice, bob], hasMore: false })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    const first = await screen.findByRole('menuitem', { name: 'Alice' });
    await waitFor(() => expect(document.activeElement).toBe(first));
    await userEvent.keyboard('{Enter}');
    expect(selected).toBe('Alice');
  });

  it('does not reset menu focus when an inline onClose changes on parent rerender', async () => {
    const { rerender } = render(
      <Dropdown
        mode="action"
        label="Actions"
        searchable={false}
        items={[alice, bob]}
        onSelect={noop}
        onClose={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.keyboard('{ArrowDown}');
    const second = screen.getByRole('menuitem', { name: 'Bob' });
    expect(document.activeElement).toBe(second);
    rerender(
      <Dropdown
        mode="action"
        label="Actions"
        searchable={false}
        items={[alice, bob]}
        onSelect={noop}
        onClose={() => {}}
      />,
    );
    expect(document.activeElement).toBe(second);
  });

  it('stays closed after an open dropdown is disabled and enabled again', async () => {
    const { rerender } = render(
      <Dropdown label="Person" items={[alice]} onSelect={noop} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Person' }));
    rerender(
      <Dropdown label="Person" items={[alice]} onSelect={noop} disabled />,
    );
    expect(screen.queryByRole('listbox')).toBeNull();
    rerender(<Dropdown label="Person" items={[alice]} onSelect={noop} />);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
