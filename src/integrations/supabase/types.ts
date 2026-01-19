// Mock database types - Supabase is no longer used
export type Database = {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
};
