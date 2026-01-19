// Mock Supabase client - Supabase is no longer used, use your custom API instead
// This file exists only to prevent import errors in components
// Please migrate to your custom API at NEXT_PUBLIC_BASE_URL

// Create a mock client that returns null for all operations
const createMockClient = () => {
  const mockResponse = {
    data: null,
    error: null,
  };

  const mockQuery = {
    select: () => mockQuery,
    eq: () => mockQuery,
    single: () => Promise.resolve(mockResponse),
    then: (cb: any) => {
      cb(mockResponse);
      return Promise.resolve(mockResponse);
    },
  };

  return {
    from: () => mockQuery,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase is disabled' } }),
      signIn: () => Promise.resolve({ data: null, error: { message: 'Supabase is disabled' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
};

export const supabase = createMockClient() as any;

export type Database = any;
