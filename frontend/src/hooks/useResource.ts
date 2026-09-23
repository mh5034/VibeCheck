import { useEffect, useSyncExternalStore } from "react";
import { createResource } from "../api/resource";

export function useResource<T>(resource: ReturnType<typeof createResource<T>>) {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot);

  useEffect(() => {
    void resource.load();
    const refresh = () => {
      void resource.load();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [resource]);

  return {
    ...snapshot,
    loading: snapshot.data === undefined && !snapshot.error,
    retry: resource.invalidate,
  };
}
