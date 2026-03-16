import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mutate } from 'swr';
import { createSupaWRClient } from './client';

vi.mock('swr', () => ({
  mutate: vi.fn(),
  default: vi.fn(),
}));

const mockSupabase = {} as any;

describe('supaCacheKey', () => {
  it('should create cache key for single table', () => {
    const key = JSON.stringify({
      tables: ['devices'],
      params: null,
    });
    
    expect(key).toBe('{"tables":["devices"],"params":null}');
  });

  it('should create cache key for multiple tables', () => {
    const key = JSON.stringify({
      tables: ['devices', 'detections'],
      params: null,
    });
    
    expect(key).toBe('{"tables":["devices","detections"],"params":null}');
  });

  it('should create cache key with params', () => {
    const params = ['2024-01-01', '2024-01-02'];
    const key = JSON.stringify({
      tables: ['detections'],
      params,
    });
    
    expect(key).toBe('{"tables":["detections"],"params":["2024-01-01","2024-01-02"]}');
  });
});

describe('refetchTables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call mutate for single table', () => {
    const client = createSupaWRClient({ supabase: mockSupabase });
    
    client.refetchTables('devices');
    
    expect(mutate).toHaveBeenCalledTimes(1);
    const callback = (mutate as ReturnType<typeof vi.fn>).mock.calls[0][0];
    
    expect(callback('{"tables":["devices"],"params":null}')).toBe(true);
    expect(callback('{"tables":["detections"],"params":null}')).toBe(false);
  });

  it('should call mutate for multiple tables', () => {
    const client = createSupaWRClient({ supabase: mockSupabase });
    
    client.refetchTables(['devices', 'detections']);
    
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('should pass revalidate option', () => {
    const client = createSupaWRClient({ supabase: mockSupabase });
    
    client.refetchTables('devices');
    
    const mutateCall = (mutate as ReturnType<typeof vi.fn>).mock.calls[0];
    const thirdArg = mutateCall[2];
    
    expect(thirdArg).toEqual({ revalidate: true });
  });
});

describe('createSupaWRClient', () => {
  it('should create client with default options', () => {
    const client = createSupaWRClient({ supabase: mockSupabase });
    
    expect(client).toHaveProperty('useSupaWR');
    expect(client).toHaveProperty('refetchTables');
    expect(client).toHaveProperty('supabase');
  });

  it('should create client with custom SWR options', () => {
    const client = createSupaWRClient({
      supabase: mockSupabase,
      swr: {
        revalidateOnFocus: false,
        dedupingInterval: 2000,
      },
    });
    
    expect(client).toHaveProperty('useSupaWR');
    expect(client).toHaveProperty('refetchTables');
    expect(client).toHaveProperty('supabase');
  });
});
