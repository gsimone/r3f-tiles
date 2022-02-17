import create, { State, StateCreator } from "zustand";
import produce, { Draft } from "immer";
import { map } from "./map";

// Immer V9
const immer =
  <T extends State>(
    config: StateCreator<T, (fn: (draft: Draft<T>) => void) => void>
  ): StateCreator<T> =>
  (set, get, api) =>
    config((fn) => set(produce<T>(fn)), get, api);

type MyState = {
  map: number[];
  editorMode: "voxel" | "tiles";
};

const useStore = create<MyState>(
  immer((set) => ({
    map: map,
    editorMode: 'voxel',
    toggleTileAt: (index: number) => {
      set((state) => {
        state.map[index] = state.map[index] === 1 ? 0 : 1;
      })
    }
  }))
);

// useStore.subscribe(console.log)

export default useStore;
