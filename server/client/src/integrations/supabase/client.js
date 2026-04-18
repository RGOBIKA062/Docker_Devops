// Lightweight mock replacement for Supabase client.
// This keeps the app running without hitting Supabase services.

const noopPromise = (value = null) => Promise.resolve({ data: value, error: null });

const auth = {
  signInWithPassword: async ({ email, password }) => {
    // Return a fake user object. Adjust as needed.
    return { data: { user: { id: "mock-user-id", email } }, error: null };
  },
  signUp: async (opts) => {
    return { data: { user: { id: "mock-user-id", email: opts.email } }, error: null };
  },
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: (cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signOut: async () => ({ error: null })
};

const fromBuilder = (table) => {
  return {
    select: (cols) => ({ eq: (col, val) => ({ single: async () => ({ data: null, error: null }) }) }),
    update: (data) => ({ eq: async (col, val) => ({ data: null, error: null }) })
  };
};

const supabase = {
  auth,
  from: fromBuilder,
};

export { supabase };
