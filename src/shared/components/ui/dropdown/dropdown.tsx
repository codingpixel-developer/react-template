import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { DropdownList } from './dropdownList';
import { DropdownRemote } from './dropdownRemote';
import { getDropdownOptions } from './dropdownOptions';
import type { DropdownOption, DropdownProps } from './dropdownTypes';
import styles from './dropdown.module.scss';

export type {
  DropdownOption,
  DropdownPage,
  DropdownProps,
  DropdownRequest,
} from './dropdownTypes';

export function Dropdown<T extends DropdownOption>(props: DropdownProps<T>) {
  const {
    label,
    mode = 'select',
    selectedItem,
    onSelect,
    trigger,
    placeholder = 'Select an option',
    searchable = true,
    searchPlaceholder = 'Search…',
    debounceMs = 300,
    disabled = false,
    align = 'left',
    className = '',
    onOpen,
    onClose,
    emptyMessage = 'No results found',
    loadingMessage = 'Loading…',
    errorMessage = 'Could not load options.',
    retryLabel = 'Retry',
    clearSearchLabel = 'Clear search',
    loadMoreLabel = 'Load more',
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [composing, setComposing] = useState(false);
  const [activeId, setActiveId] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const open = isOpen && !disabled;
  if (disabled && isOpen) {
    setIsOpen(false);
    setActiveId(undefined);
  }

  const close = useCallback(
    (restoreFocus = false) => {
      setIsOpen(false);
      setActiveId(undefined);
      onClose?.();
      if (restoreFocus) triggerRef.current?.focus();
    },
    [onClose],
  );

  const show = () => {
    setSearch('');
    setCommittedSearch('');
    setComposing(false);
    setActiveId(undefined);
    setIsOpen(true);
    onOpen?.();
  };

  useEffect(() => {
    if (composing || !props.loadOptions || search === committedSearch) return;
    const timer = window.setTimeout(
      () => setCommittedSearch(search),
      debounceMs,
    );
    return () => window.clearTimeout(timer);
  }, [search, committedSearch, composing, debounceMs, props.loadOptions]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      )
        close();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [open, close]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const changeSearch = (value: string) => {
    setSearch(value);
    setActiveId(undefined);
    if (!value) setCommittedSearch('');
  };

  const select = (item: T) => {
    close(true);
    onSelect(item);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || composing || event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        show();
      }
      return;
    }
    const options = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]:not(:disabled), [role="menuitem"]:not(:disabled)',
      ) ?? [],
    );
    const focusedIndex = options.findIndex(
      (option) => option === document.activeElement,
    );
    const current =
      focusedIndex >= 0
        ? focusedIndex
        : options.findIndex((option) => option.id === activeId);
    if (event.key === 'Enter' && event.target === searchRef.current) {
      event.preventDefault();
      if (current >= 0) options[current].click();
      else setCommittedSearch(search);
      return;
    }
    const inSearch = event.target === searchRef.current;
    if (
      !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) ||
      (inSearch && (event.key === 'Home' || event.key === 'End'))
    )
      return;
    event.preventDefault();
    const index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : event.key === 'ArrowDown'
            ? Math.min(current + 1, options.length - 1)
            : current < 0
              ? options.length - 1
              : Math.max(0, current - 1);
    const option = options[index];
    if (option) {
      setActiveId(option.id);
      if (mode === 'action' || !searchable) option.focus();
      option.scrollIntoView?.({ block: 'nearest' });
    }
  };

  const listProps = {
    id: listId,
    label,
    mode,
    selectedItem,
    onSelect: select,
    activeId,
    autoFocus: !searchable,
    emptyMessage,
    loadingMessage,
    errorMessage,
    retryLabel,
    loadMoreLabel,
  };

  return (
    <div
      ref={containerRef}
      className={[styles.dropdown, className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles['dropdown-trigger']}
        disabled={disabled}
        aria-label={
          mode === 'select' && selectedItem
            ? `${label}: ${selectedItem.label}`
            : label
        }
        aria-haspopup={mode === 'action' ? 'menu' : 'listbox'}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : show())}
      >
        <span>
          {trigger ??
            (mode === 'select' ? (selectedItem?.label ?? placeholder) : label)}
        </span>
        <span aria-hidden="true" className={styles['dropdown-chevron']} />
      </button>
      {open && (
        <div
          className={[
            styles['dropdown-menu'],
            styles[`dropdown-menu--${align}`],
          ].join(' ')}
        >
          {searchable && (
            <div className={styles['dropdown-search']}>
              <input
                ref={searchRef}
                role={mode === 'select' ? 'combobox' : undefined}
                aria-label={`${label}: ${searchPlaceholder}`}
                aria-expanded={mode === 'select' ? true : undefined}
                aria-controls={listId}
                aria-autocomplete={mode === 'select' ? 'list' : undefined}
                aria-activedescendant={mode === 'select' ? activeId : undefined}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                onCompositionStart={() => setComposing(true)}
                onCompositionEnd={() => setComposing(false)}
              />
              {search && (
                <button
                  type="button"
                  aria-label={clearSearchLabel}
                  onClick={() => {
                    changeSearch('');
                    searchRef.current?.focus();
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}
          {props.loadOptions ? (
            <DropdownRemote
              {...listProps}
              source={props}
              search={committedSearch}
              pendingSearch={composing || search !== committedSearch}
            />
          ) : (
            <DropdownList
              {...listProps}
              items={getDropdownOptions([props.items], selectedItem, search)}
            />
          )}
        </div>
      )}
    </div>
  );
}
