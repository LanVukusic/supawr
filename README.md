# supa-wr

SWR hooks for Supabase with built-in caching and type safety.

## Installation

```bash
npm install supa-wr @supabase/supabase-js swr
```

## Usage

### 1. Create your Supabase client

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 2. Initialize useSupaWR with your Database type

```ts
import { useSupaWR } from 'supa-wr';
import type { Database } from './types/supabase';

const supaWR = useSupaWR<Database>();
```

### 3. Use in components

```tsx
function DetectionChart({ from, to }: { from: string; to: string }) {
  const { data: hourlyData, error, isLoading } = supaWR.query({
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

### 4. Refetch/invalidate cache

```ts
// After mutations, refetch specific tables
supaWR.refetchTables('detections');

// Or multiple tables
supaWR.refetchTables(['detections', 'devices']);
```

## API

### `useSupaWR<TDatabase>(options?)`

Creates a typed SupaWR instance bound to your Database type.

```ts
const supaWR = useSupaWR<Database>({
  swr: {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  },
});
```

### `supaWR.query(config)`

Hook that returns SWR response with caching.

```ts
const { data, error, isLoading, mutate } = supaWR.query({
  table: 'table_name',
  params: { /* optional params for cache key */ },
  query: () => supabase.from('table').select('*'),
});
```

### `supaWR.refetchTables(tables)`

Invalidates and refetches cached data for specified tables.

```ts
supaWR.refetchTables('devices');
```

## TypeScript

The library is fully typed. Pass your Supabase `Database` type to get autocomplete for table names:

```ts
const supaWR = useSupaWR<Database>();
// table: autocomplete shows 'devices', 'detections', etc.
```
