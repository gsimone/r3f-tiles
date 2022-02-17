import create, { State, StateCreator } from "zustand";
import produce, { Draft } from "immer";
import { WebGLRenderTarget } from "three";

// Immer V9
const immer =
  <T extends State>(
    config: StateCreator<T, (fn: (draft: Draft<T>) => void) => void>
  ): StateCreator<T> =>
  (set, get, api) =>
    config((fn) => set(produce<T>(fn)), get, api);

type MyState = {
  fbos: Record<string, WebGLRenderTarget>;
  map: number[];
};

const useStore = create<MyState>(
  immer((set, get) => ({
    fbos: {},
  }))
);

// useStore.subscribe(console.log)

export default useStore;
