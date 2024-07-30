import {createStore} from "zustand/vanilla";
import {atomWithStore} from "jotai-zustand";
import _ from "lodash";
import {produce} from "immer";
import {useAtom, useAtomValue} from "jotai";
import {ok} from "neverthrow";
import {useCallback} from "react";

export const store = createStore<Record<string, any>>(() => ({}));

export const storeInitialization = async () => {
    const value = localStorage.getItem("store");
    if (value) {
        store.setState(JSON.parse(value));
    } else {
        localStorage.setItem("store", JSON.stringify(store.getState()));
        store.setState(JSON.parse(localStorage.getItem("store") as string));
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
    localStorage.setItem("store", JSON.stringify(store.getState()));
}

export function useStore() {
    const [store, setStore] = useAtom(storeAtom);

    const getter = useCallback((key: string) => get(key), [store]);
    const setter = useCallback((key: string, value: any) =>
            set(key, value)
        ,
        [setStore]
    )


    return {store, get: getter, set: setter}
}

export function useStoreValue() {
    const store = useAtomValue(storeAtom);

    const get = useCallback((key: string) => _.get(store, key), [store]);

    return {store, get}
}