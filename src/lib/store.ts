import {createStore} from "zustand/vanilla";
import {atomWithStore} from "jotai-zustand";
import _ from "lodash";
import {produce} from "immer";
import {useAtom, useAtomValue} from "jotai";
import {BaseDirectory, exists, readTextFile} from "@tauri-apps/plugin-fs";
import {ok} from "neverthrow";
import {useCallback} from "react";

export const store = createStore<Record<string, any>>(() => ({}));

export const storeInitialization = async () => {
    const storePath = "store.json";
    if (await exists(storePath, {baseDir: BaseDirectory.AppData})) {
        const data = await readTextFile(storePath);
        store.setState(JSON.parse(data));
    }

    return ok(true)
}

export const storeAtom = atomWithStore(store)

export function get(key: string, defaultValue: any = null) {
    return _.get(store.getState(), key, defaultValue)
}

export function set(key: string, value: any) {
    store.setState(produce((state) => {
        _.set(state, key, value);
    }));
}

export function useStore() {
    const [store, setStore] = useAtom(storeAtom);

    const get = useCallback((key: string) => _.get(store, key), [store]);
    const set = useCallback((key: string, value: any) => setStore(produce((state) => {
        _.set(state, key, value);

    })), [setStore]);

    return {store, get, set}
}

export function useStoreValue() {
    const store = useAtomValue(storeAtom);

    const get = useCallback((key: string) => _.get(store, key), [store]);

    return {store, get}
}