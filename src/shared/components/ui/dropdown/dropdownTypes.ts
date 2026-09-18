import type { ReactNode } from 'react';
import type { QueryKey } from '@tanstack/react-query';

export interface DropdownOption {
  id: string | number;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  dividerBefore?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface DropdownPage<T extends DropdownOption> {
  items: T[];
  hasMore: boolean;
}

export interface DropdownRequest {
  search: string;
  page: number;
  signal: AbortSignal;
}

export interface DropdownRemoteSource<T extends DropdownOption> {
  loadOptions: (request: DropdownRequest) => Promise<DropdownPage<T>>;
  queryKey: QueryKey;
  items?: never;
}

interface DropdownStaticSource<T extends DropdownOption> {
  items: readonly T[];
  loadOptions?: never;
  queryKey?: never;
}

interface DropdownBaseProps<T extends DropdownOption> {
  label: string;
  onSelect: (item: T) => void;
  trigger?: ReactNode;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  retryLabel?: string;
  clearSearchLabel?: string;
  loadMoreLabel?: string;
}

interface DropdownSelectionProps<T extends DropdownOption> {
  mode?: 'select';
  selectedItem?: T | null;
}

interface DropdownActionProps {
  mode: 'action';
  selectedItem?: never;
}

export type DropdownProps<T extends DropdownOption> = DropdownBaseProps<T> &
  (DropdownSelectionProps<T> | DropdownActionProps) &
  (DropdownStaticSource<T> | DropdownRemoteSource<T>);
