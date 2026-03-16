import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mutate } from 'swr';
import { useSupaWR } from './client';

vi.mock('swr', () => ({
  mutate: vi.fn(),
  default: vi.fn(),
}));

const mockDatabase = {
  public: {
    Tables: {
      devices: { Row: {} },
      detections: { Row: {} },
    },
    Views: {
      device_stats: { Row: {} },
    },
  },
} as const;

describe('supaCacheKey', () => {
  it('should create cache key for single table', () => {
    useSupaWR(mockDatabase);
    
    const key = JSON.stringify({
      tables: ['devices'],
      params: null,
    });
    
    expect(key).toBe('{"tables":["devices"],"params":null}');
  });

  it('should create cache key for multiple tables', () => {
    useSupaWR(mockDatabase);
    
    const key = JSON.stringify({
      tables: ['devices', 'detections'],
      params: null,
    });
    
    expect(key).toBe('{"tables":["devices","detections"],"params":null}');
  });

  it('should create cache key with params', () => {
    useSupaWR(mockDatabase);
    
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
    const supaWR = useSupaWR(mockDatabase);
    
    supaWR.refetchTables('devices');
    
    expect(mutate).toHaveBeenCalledTimes(1);
    const callback = (mutate as ReturnType<typeof vi.fn>).mock.calls[0][0];
    
    expect(callback('{"tables":["devices"],"params":null}')).toBe(true);
    expect(callback('{"tables":["detections"],"params":null}')).toBe(false);
  });

  it('should call mutate for multiple tables', () => {
    const supaWR = useSupaWR(mockDatabase);
    
    supaWR.refetchTables(['devices', 'detections']);
    
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('should pass revalidate option', () => {
    const supaWR = useSupaWR(mockDatabase);
    
    supaWR.refetchTables('devices');
    
    const mutateCall = (mutate as ReturnType<typeof vi.fn>).mock.calls[0];
    const thirdArg = mutateCall[2];
    
    expect(thirdArg).toEqual({ revalidate: true });
  });
});

describe('useSupaWR', () => {
  it('should create client with default options', () => {
    const supaWR = useSupaWR(mockDatabase);
    
    expect(supaWR).toHaveProperty('query');
    expect(supaWR).toHaveProperty('refetchTables');
  });

  it('should create client with custom SWR options', () => {
    const supaWR = useSupaWR(mockDatabase, {
      swr: {
        revalidateOnFocus: false,
        dedupingInterval: 2000,
      },
    });
    
    expect(supaWR).toHaveProperty('query');
    expect(supaWR).toHaveProperty('refetchTables');
  });
});
