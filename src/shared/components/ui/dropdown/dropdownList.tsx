import { useEffect, useRef } from 'react';
import type { DropdownOption } from './dropdownTypes';
import styles from './dropdown.module.scss';

export interface DropdownListProps<T extends DropdownOption> {
  id: string;
  label: string;
  mode: 'select' | 'action';
  items: readonly T[];
  selectedItem?: T | null;
  onSelect: (item: T) => void;
  activeId?: string;
  autoFocus?: boolean;
  emptyMessage: string;
  loadingMessage: string;
  errorMessage: string;
  retryLabel: string;
  loadMoreLabel: string;
  loading?: boolean;
  error?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

export function DropdownList<T extends DropdownOption>({
  id,
  label,
  mode,
  items,
  selectedItem,
  onSelect,
  activeId,
  emptyMessage,
  loadingMessage,
  errorMessage,
  retryLabel,
  loadMoreLabel,
  autoFocus = false,
  loading = false,
  error = false,
  hasMore = false,
  onLoadMore,
  onRetry,
}: DropdownListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  useEffect(() => {
    if (!autoFocus || focused.current) return;
    const first = listRef.current?.querySelector<HTMLButtonElement>(
      'button:not(:disabled)',
    );
    if (first) {
      first.focus();
      focused.current = true;
    }
  }, [autoFocus, items]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      !hasMore ||
      loading ||
      error ||
      !onLoadMore ||
      typeof IntersectionObserver === 'undefined'
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root: listRef.current, rootMargin: '0px 0px 48px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, error, onLoadMore, items.length]);

  return (
    <>
      <div
        ref={listRef}
        id={id}
        role={mode === 'action' ? 'menu' : 'listbox'}
        aria-label={label}
        aria-busy={loading}
        className={styles['dropdown-list']}
        onScroll={(event) => {
          const list = event.currentTarget;
          if (
            hasMore &&
            !loading &&
            !error &&
            list.scrollHeight - list.scrollTop - list.clientHeight <= 48
          )
            onLoadMore?.();
        }}
      >
        {items.map((item) => {
          const optionId = `${id}-option-${typeof item.id}-${encodeURIComponent(item.id)}`;
          return (
            <div key={optionId} role="presentation">
              {item.dividerBefore && (
                <div
                  role={mode === 'action' ? 'separator' : 'presentation'}
                  className={styles['dropdown-divider']}
                />
              )}
              <button
                id={optionId}
                type="button"
                role={mode === 'action' ? 'menuitem' : 'option'}
                aria-selected={
                  mode === 'select' ? item.id === selectedItem?.id : undefined
                }
                disabled={item.disabled}
                tabIndex={-1}
                className={[
                  styles['dropdown-item'],
                  item.destructive && styles['dropdown-item--destructive'],
                  optionId === activeId && styles['dropdown-item--active'],
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(item)}
              >
                {item.leftIcon && (
                  <span className={styles['dropdown-item-left']}>
                    {item.leftIcon}
                  </span>
                )}
                <span className={styles['dropdown-item-content']}>
                  {item.label}
                </span>
                {item.id === selectedItem?.id && (
                  <span
                    aria-hidden="true"
                    className={styles['dropdown-check']}
                  />
                )}
                {item.rightIcon && (
                  <span className={styles['dropdown-item-right']}>
                    {item.rightIcon}
                  </span>
                )}
              </button>
            </div>
          );
        })}
        <div
          ref={sentinelRef}
          role="presentation"
          className={styles['dropdown-sentinel']}
        />
      </div>
      {loading && (
        <div role="status" className={styles['dropdown-status']}>
          {loadingMessage}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div role="status" className={styles['dropdown-status']}>
          {emptyMessage}
        </div>
      )}
      {error && (
        <div className={styles['dropdown-status']}>
          <span role="alert">{errorMessage}</span>
          <button type="button" onClick={onRetry}>
            {retryLabel}
          </button>
        </div>
      )}
      {hasMore && !error && (
        <button
          type="button"
          className={styles['dropdown-more']}
          disabled={loading}
          onClick={onLoadMore}
        >
          {loadMoreLabel}
        </button>
      )}
    </>
  );
}
