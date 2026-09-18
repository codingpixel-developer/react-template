import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DropdownList } from './dropdownList';
import type { DropdownListProps } from './dropdownList';
import type { DropdownOption, DropdownRemoteSource } from './dropdownTypes';
import { getDropdownOptions } from './dropdownOptions';

interface DropdownRemoteProps<T extends DropdownOption> extends Omit<
  DropdownListProps<T>,
  'items'
> {
  source: DropdownRemoteSource<T>;
  search: string;
  pendingSearch: boolean;
}

export function DropdownRemote<T extends DropdownOption>({
  source,
  search,
  pendingSearch,
  ...props
}: DropdownRemoteProps<T>) {
  const query = useInfiniteQuery({
    queryKey: ['dropdown', ...source.queryKey, search],
    queryFn: ({ pageParam, signal }) =>
      source.loadOptions({ search, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: !pendingSearch,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const { fetchNextPage, isFetching, hasNextPage, isError } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching && !isError && !pendingSearch)
      void fetchNextPage({ cancelRefetch: false });
  }, [hasNextPage, isFetching, isError, pendingSearch, fetchNextPage]);
  const pages = pendingSearch
    ? []
    : (query.data?.pages.map((page) => page.items) ?? []);
  return (
    <DropdownList
      {...props}
      items={getDropdownOptions(pages, props.selectedItem)}
      loading={pendingSearch || query.isPending || isFetching}
      error={!pendingSearch && isError}
      hasMore={!pendingSearch && hasNextPage}
      onLoadMore={loadMore}
      onRetry={() => {
        if (query.isFetchNextPageError)
          void fetchNextPage({ cancelRefetch: false });
        else void query.refetch();
      }}
    />
  );
}
