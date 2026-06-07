import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Simple listeners for custom mock auth flows
const listeners: any[] = [];
function triggerAuthChange(event: string, session: any) {
  listeners.forEach((cb) => cb(event, session));
}

export function getMockSession() {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("mock_supabase_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          session: {
            access_token: `${user.id}:${user.user_metadata?.username || "user"}:${user.email}`,
            expires_at: 9999999999,
            expires_in: 9999999999,
            refresh_token: "mock-refresh-token",
            token_type: "bearer",
            user: user,
          },
          user,
        };
      } catch (e) {
        return { session: null, user: null };
      }
    }
  }
  return { session: null, user: null };
}

export async function loadMockDb(): Promise<any> {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("mock_supabase_db");
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
  } else {
    const g = globalThis as any;
    if (!g._mockSupabaseDb) {
      g._mockSupabaseDb = {};
      try {
        const fs = await new Function("return import('fs')")();
        if (fs.existsSync("mock-db.json")) {
          const text = fs.readFileSync("mock-db.json", "utf-8");
          g._mockSupabaseDb = JSON.parse(text);
        }
      } catch (e) {
        // ignore
      }
    }
    return g._mockSupabaseDb;
  }
  return {};
}

export async function saveMockDb(db: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_supabase_db", JSON.stringify(db));
  } else {
    const g = globalThis as any;
    g._mockSupabaseDb = db;
    try {
      const fs = await new Function("return import('fs')")();
      fs.writeFileSync("mock-db.json", JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      // ignore
    }
  }
}

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<{ field: string; op: "eq" | "gte"; value: any }> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isMaybeSingle: boolean = false;
  private isSingle: boolean = false;
  private isDelete: boolean = false;
  private insertData: any = null;
  private upsertData: any = null;
  private updateData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string) {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, op: "eq", value });
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push({ field, op: "gte", value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  insert(data: any) {
    this.insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  upsert(data: any) {
    this.upsertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  async execute() {
    const db = await loadMockDb();
    if (!db[this.tableName]) {
      db[this.tableName] = [];
    }
    const table = db[this.tableName] as any[];

    const matchingIndexes: number[] = [];
    const matchingItems: any[] = [];

    table.forEach((item, index) => {
      let isMatch = true;
      for (const filter of this.filters) {
        if (filter.op === "eq") {
          if (item[filter.field] !== filter.value) {
            isMatch = false;
            break;
          }
        } else if (filter.op === "gte") {
          if (item[filter.field] < filter.value) {
            isMatch = false;
            break;
          }
        }
      }
      if (isMatch) {
        matchingIndexes.push(index);
        matchingItems.push(item);
      }
    });

    if (this.isDelete) {
      db[this.tableName] = table.filter((_, i) => !matchingIndexes.includes(i));
      await saveMockDb(db);
      return { data: null, error: null };
    }

    if (this.insertData) {
      const inserted: any[] = [];
      for (const row of this.insertData) {
        const item = {
          id: row.id || `mock-id-${Math.random().toString(36).substring(2, 11)}`,
          logged_at: row.logged_at || new Date().toISOString().split("T")[0],
          created_at: row.created_at || new Date().toISOString(),
          ...row,
        };
        db[this.tableName].push(item);
        inserted.push(item);
      }
      await saveMockDb(db);
      return { data: this.isSingle || this.isMaybeSingle ? inserted[0] : inserted, error: null };
    }

    if (this.upsertData) {
      const upserted: any[] = [];
      for (const row of this.upsertData) {
        const uniqueField = this.tableName === "profiles" ? "user_id" : "id";
        const existingIndex = db[this.tableName].findIndex(
          (item: any) => item[uniqueField] === row[uniqueField],
        );
        const item = {
          id:
            row.id ||
            (existingIndex >= 0
              ? db[this.tableName][existingIndex].id
              : `mock-id-${Math.random().toString(36).substring(2, 11)}`),
          logged_at:
            row.logged_at ||
            (existingIndex >= 0
              ? db[this.tableName][existingIndex].logged_at
              : new Date().toISOString().split("T")[0]),
          created_at:
            row.created_at ||
            (existingIndex >= 0
              ? db[this.tableName][existingIndex].created_at
              : new Date().toISOString()),
          updated_at: new Date().toISOString(),
          ...row,
        };
        if (existingIndex >= 0) {
          db[this.tableName][existingIndex] = item;
        } else {
          db[this.tableName].push(item);
        }
        upserted.push(item);
      }
      await saveMockDb(db);
      return { data: this.isSingle || this.isMaybeSingle ? upserted[0] : upserted, error: null };
    }

    if (this.updateData) {
      const updated: any[] = [];
      for (const idx of matchingIndexes) {
        db[this.tableName][idx] = {
          ...db[this.tableName][idx],
          ...this.updateData,
          updated_at: new Date().toISOString(),
        };
        updated.push(db[this.tableName][idx]);
      }
      await saveMockDb(db);
      return { data: this.isSingle || this.isMaybeSingle ? updated[0] : updated, error: null };
    }

    let results = [...matchingItems];

    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      results.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      if (results.length === 0) {
        return { data: null, error: { message: "Row not found", code: "PGRST116" } };
      }
      return { data: results[0], error: null };
    }

    if (this.isMaybeSingle) {
      return { data: results.length > 0 ? results[0] : null, error: null };
    }

    return { data: results, error: null };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createMockSupabaseClient() {
  return {
    auth: {
      async getUser() {
        const session = getMockSession();
        return { data: { user: session.user }, error: null };
      },
      async getSession() {
        return { data: { session: getMockSession().session }, error: null };
      },
      onAuthStateChange(callback: any) {
        listeners.push(callback);
        const session = getMockSession().session;
        setTimeout(() => {
          callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe() {
                const index = listeners.indexOf(callback);
                if (index !== -1) listeners.splice(index, 1);
              },
            },
          },
        };
      },
      async signUp({ email, password, options }: any) {
        const username = options?.data?.username || email.split("@")[0];
        const user = {
          id: `mock-user-${Math.random().toString(36).substring(2, 11)}`,
          email,
          user_metadata: { username },
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("mock_supabase_user", JSON.stringify(user));
        }

        const db = await loadMockDb();
        if (!db.profiles) db.profiles = [];
        db.profiles.push({
          id: user.id,
          user_id: user.id,
          username,
          fitness_goal: "maintain",
          activity_level: "moderate",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        await saveMockDb(db);

        const session = getMockSession().session;
        triggerAuthChange("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      async signInWithPassword({ email }: any) {
        const username = email.split("@")[0];
        const user = {
          id: `mock-user-${email.replace(/[^a-zA-Z0-9]/g, "") || "default"}`,
          email,
          user_metadata: { username },
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("mock_supabase_user", JSON.stringify(user));
        }

        const db = await loadMockDb();
        if (!db.profiles) db.profiles = [];
        const existingProfile = db.profiles.find((p: any) => p.user_id === user.id);
        if (!existingProfile) {
          db.profiles.push({
            id: user.id,
            user_id: user.id,
            username,
            fitness_goal: "maintain",
            activity_level: "moderate",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          await saveMockDb(db);
        }

        const session = getMockSession().session;
        triggerAuthChange("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        if (typeof window !== "undefined") {
          localStorage.removeItem("mock_supabase_user");
        }
        triggerAuthChange("SIGNED_OUT", null);
        return { error: null };
      },
      async signInWithOAuth({ options }: any) {
        const user = {
          id: "mock-google-user",
          email: "google.user@example.com",
          user_metadata: { username: "GoogleUser" },
          created_at: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("mock_supabase_user", JSON.stringify(user));
        }

        const db = await loadMockDb();
        if (!db.profiles) db.profiles = [];
        const existingProfile = db.profiles.find((p: any) => p.user_id === user.id);
        if (!existingProfile) {
          db.profiles.push({
            id: user.id,
            user_id: user.id,
            username: "GoogleUser",
            fitness_goal: "maintain",
            activity_level: "moderate",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          await saveMockDb(db);
        }

        const session = getMockSession().session;
        triggerAuthChange("SIGNED_IN", session);

        if (typeof window !== "undefined") {
          window.location.href = options?.redirectTo || "/dashboard";
        }
        return { error: null };
      },
    },
    from(table: string) {
      return new MockQueryBuilder(table);
    },
  };
}

function createSupabaseClient() {
  const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);
  const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (typeof process !== "undefined" ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined);

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn(`[Supabase] Keys are missing. Booting fallback offline Mock client.`);
    return createMockSupabaseClient() as any;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: any;

export const supabase = new Proxy({} as any, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
