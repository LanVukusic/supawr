# supa-wr

SWR hooks for Supabase with built-in caching and type safety.

## Installation

```bash
npm install supa-wr @supabase/supabase-js swr
```

## Usage

### 1. Create client (once, outside components)

```ts
import { createSupaWRClient } from 'supa-wr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const client = createSupaWRClient({ supabase });
```

### 2. Use in components

```tsx
function DetectionChart({ from, to }: { from: string; to: string }) {
  const { data: hourlyData, error, isLoading } = client.useSupaWR({
    table: 'detections',
    params: [from, to],
    query: () =>
      supabase.rpc('get_detection_counts_by_type', {
        time_from: from,
        time_to: to,
        resolution: '1hour',
      }),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <Chart data={hourlyData} />;
}
```

### 3. Refetch/invalidate cache

```ts
// After mutations, refetch specific tables
client.refetchTables('detections');

// Or multiple tables
client.refetchTables(['detections', 'devices']);
```

## API

### `createSupaWRClient(options)`

Creates a typed SupaWR client bound to your Database type.

```ts
const client = createSupaWRClient({
  supabase,
  swr: {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  },
});
```

### `client.useSupaWR(config)`

Hook that returns SWR response with caching.

```ts
const { data, error, isLoading, mutate } = client.useSupaWR({
  table: 'table_name',
  params: { /* optional params for cache key */ },
  query: () => supabase.from('table').select('*'),
});
```

### `client.refetchTables(tables)`

Invalidates and refetches cached data for specified tables.

```ts
client.refetchTables('devices');
```

## TypeScript

The library is fully typed. Pass your Supabase `Database` type to get autocomplete for table names:

```ts
const client = createSupaWRClient({ supabase });
// table: autocomplete shows 'devices', 'detections', etc.
```
