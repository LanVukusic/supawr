import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import { mutate } from 'swr';
import { toSupabasePromise } from './supabasePromise';
import type { AnyResponse, SupabaseDatabase } from './typeUtils';

export type TableName<TDatabase extends SupabaseDatabase> =
  | keyof TDatabase['public']['Tables']
  | keyof TDatabase['public']['Views'];

export type TableNames<TDatabase extends SupabaseDatabase> =
  | TableName<TDatabase>
  | TableName<TDatabase>[];

export interface SupaQueryConfig<
  TDatabase extends SupabaseDatabase,
  TTable extends TableNames<TDatabase> = TableNames<TDatabase>,
  TParams = unknown,
> {
  table: TTable;
  params?: TParams;
  query: () => PromiseLike<AnyResponse<unknown>>;
}

export interface SupaWRClientOptions {
  swr?: SWRConfiguration;
}

function supaCacheKey<TTable, TParams>(
  config: { table: TTable; params?: TParams; },
): string {
  const tables = Array.isArray(config.table) ? config.table : [config.table];
  return JSON.stringify({
    tables,
    params: config.params ?? null,
  });
}

export function createSupaWR<TDatabase extends SupabaseDatabase>(
  _database: TDatabase,
  options: SupaWRClientOptions = {},
) {
  function useSupaWR<
    _T,
    TTable extends TableNames<TDatabase>,
    TParams = unknown,
  >(config: SupaQueryConfig<TDatabase, TTable, TParams>) {
    const key = supaCacheKey(config);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useSWR(key, () => toSupabasePromise<any>(config.query() as any), options.swr) as any;
  }

  function refetchTables(tables: TableName<TDatabase> | TableName<TDatabase>[]) {
    const tableList = Array.isArray(tables) ? tables : [tables];
    for (const table of tableList) {
      mutate(
        (key: string) => {
          try {
            const parsed = JSON.parse(key);
            return parsed && parsed.table === table;
          } catch {
            return false;
          }
        },
        undefined,
        { revalidate: true },
      );
    }
  }

  return {
    getSupaWR: useSupaWR,
    refetchTables,
  };
}

export type SupaWRClient<TDatabase extends SupabaseDatabase> = ReturnType<
  typeof createSupaWR<TDatabase>
>;
