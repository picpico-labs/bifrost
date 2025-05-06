import { core } from "@picpico-labs/bifrost-core";

export function useBifrost() {
  return core().replace("core", "react");
}
