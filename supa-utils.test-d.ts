import { expectType } from 'tsd';
import { createSupaWRClient } from './src/supa-utils/client';
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

const mockSupabase = {} as any;

const client = createSupaWRClient<TestDatabase>({ supabase: mockSupabase });

expectType<{
  supabase: typeof mockSupabase;
  useSupaWR: typeof client.useSupaWR;
  refetchTables: typeof client.refetchTables;
}>(client);

const clientWithOptions = createSupaWRClient<TestDatabase>({
  supabase: mockSupabase,
  swr: { revalidateOnFocus: false },
});

expectType<{
  supabase: typeof mockSupabase;
  useSupaWR: typeof clientWithOptions.useSupaWR;
  refetchTables: typeof clientWithOptions.refetchTables;
}>(clientWithOptions);

const result = client.useSupaWR({
  table: 'devices',
  query: async () => ({ data: [{ id: 1, name: 'test' }], error: null } as any),
});

expectType<{ data: any; error: any; mutate: any; isValidating: any }>(result);

client.refetchTables('devices');
client.refetchTables(['devices', 'detections']);
