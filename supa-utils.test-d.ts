import { expectType } from 'tsd';
import { useSupaWR } from './src/supa-utils/client';
import type { SupabaseDatabase } from './src/supa-utils/typeUtils';

interface TestDatabase extends SupabaseDatabase {
  public: {
    Tables: {
      devices: { Row: { id: number; name: string } };
      detections: { Row: { id: number; timestamp: string } };
    };
    Views: {
      device_stats: { Row: { device_id: number; count: number } };
    };
  };
}

const testDatabase = {} as TestDatabase;

const supaWR = useSupaWR(testDatabase);

expectType<{ query: typeof supaWR.query; refetchTables: typeof supaWR.refetchTables }>(supaWR);

const supaWRWithOptions = useSupaWR(testDatabase, { swr: { revalidateOnFocus: false } });

expectType<{ query: typeof supaWRWithOptions.query; refetchTables: typeof supaWRWithOptions.refetchTables }>(supaWRWithOptions);

const result = supaWR.query({
  table: 'devices',
  query: async () => ({ data: [{ id: 1, name: 'test' }], error: null } as any),
});

expectType<{ data: any; error: any; mutate: any; isValidating: any }>(result);

supaWR.refetchTables('devices');
supaWR.refetchTables(['devices', 'detections']);
