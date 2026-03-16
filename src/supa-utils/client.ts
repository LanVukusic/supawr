import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import { mutate } from 'swr';
import type { SupabaseClient } from '@supabase/supabase-js';
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
  supabase: SupabaseClient<SupabaseDatabase>;
  swr?: SWRConfiguration;
}

function supaCacheKey<TTable, TParams>(
  config: { table: TTable; params?: TParams },
): string {
  const tables = Array.isArray(config.table) ? config.table : [config.table];
  return JSON.stringify({
    tables,
    params: config.params ?? null,
  });
}

export function createSupaWRClient<TDatabase extends SupabaseDatabase>(
  options: SupaWRClientOptions,
) {
  const { supabase, swr: swrOptions } = options;

  function useSupaWR<
    _T,
    TTable extends TableNames<TDatabase>,
    TParams = unknown,
  >(config: SupaQueryConfig<TDatabase, TTable, TParams>) {
    const key = supaCacheKey(config);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useSWR(key, () => toSupabasePromise<any>(config.query() as any), swrOptions) as any;
  }

  function refetchTables(tableNames: TableName<TDatabase> | TableName<TDatabase>[]) {
    const tables = Array.isArray(tableNames) ? tableNames : [tableNames];
    for (const table of tables) {
      mutate(
        (key: string) => {
          try {
            const parsed = JSON.parse(key);
            return parsed && parsed.tables?.includes(table);
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
    supabase,
    useSupaWR,
    refetchTables,
  };
}

export type SupaWRClient<TDatabase extends SupabaseDatabase> = ReturnType<
  typeof createSupaWRClient<TDatabase>
>;
