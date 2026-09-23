// Public server data shared across routes. Failed requests can be retried, and
// invalidation prevents older in-flight responses from replacing newer data.
export function createResource<T>(fetcher: () => Promise<T>, staleTime = 30_000) {
  let snapshot: { data: T | undefined; error: unknown; fetching: boolean } = {
    data: undefined,
    error: null,
    fetching: false,
  };
  let updatedAt = 0;
  let version = 0;
  let pending: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  const load = (): Promise<void> => {
    if (pending) return pending;
    if (updatedAt && Date.now() - updatedAt < staleTime) {
      return Promise.resolve();
    }
    const requestVersion = version;
    snapshot = { ...snapshot, error: null, fetching: true };
    pending = Promise.resolve()
      .then(fetcher)
      .then((data) => {
        if (requestVersion !== version) return;
        updatedAt = Date.now();
        snapshot = { data, error: null, fetching: false };
      })
      .catch((error: unknown) => {
        if (requestVersion !== version) return;
        snapshot = { ...snapshot, error, fetching: false };
      })
      .finally(() => {
        if (requestVersion !== version) return;
        pending = undefined;
        emit();
      });
    emit();
    return pending;
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    update: (transform: (data: T) => T) => {
      if (snapshot.data === undefined) return;
      snapshot = { ...snapshot, data: transform(snapshot.data) };
      emit();
    },
    invalidate: () => {
      version += 1;
      updatedAt = 0;
      pending = undefined;
      snapshot = { ...snapshot, error: null, fetching: false };
      if (listeners.size) void load();
      else emit();
    },
  };
}
