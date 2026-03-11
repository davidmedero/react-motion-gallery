'use client';

type StoreEntry = {
  value: unknown;
  dispose?: (value: unknown) => void;
};

export type RmgSlideStoreBag = {
  getOrCreate: <T>(
    key: string,
    create: () => T,
    dispose?: (value: T) => void
  ) => T;
  destroyAll: () => void;
};

export function createRmgSlideStoreBag(): RmgSlideStoreBag {
  const stores = new Map<string, StoreEntry>();

  return {
    getOrCreate<T>(
      key: string,
      create: () => T,
      dispose?: (value: T) => void
    ): T {
      const existing = stores.get(key);
      if (existing) return existing.value as T;

      const value = create();

      stores.set(key, {
        value,
        dispose: dispose
          ? (storedValue: unknown) => dispose(storedValue as T)
          : undefined,
      });

      return value;
    },

    destroyAll() {
      for (const entry of stores.values()) {
        try {
          entry.dispose?.(entry.value);
        } catch {}
      }
      stores.clear();
    },
  };
}