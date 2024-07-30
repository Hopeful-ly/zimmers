import {ok} from "neverthrow";
import {createStore} from "zustand";
import {atomWithStore} from "jotai-zustand";
import {produce} from "immer";
import _ from "lodash";
import * as store from "./store"
import {useAtomValue} from "jotai";

export interface NestedSettingEntry {
    [key: string]: SettingEntry | NestedSettingEntry;
}

export type SettingEntryType = NestedSettingEntry | SettingEntry;

export const settingEntriesStore = createStore<NestedSettingEntry>(() => ({}))

export const settingEntriesAtom = atomWithStore(settingEntriesStore);


export const settingsInitialization = async () => {
    return ok(true);
}


export class SettingEntry {
    constructor(
        public title: string,
        public description: string,
        public defaultValue: any,
        public type: "string" | "number" | "boolean",
        public storeKey: string,
    ) {

    }
}

export function registerSetting(key: string, entry: {
    title: string,
    description: string,
    defaultValue: any,
    type: "string" | "number" | "boolean",
    storeKey: string,
}) {
    settingEntriesStore.setState(produce((state) => {
            _.set(
                state,
                key,
                new SettingEntry(
                    entry.title,
                    entry.description,
                    entry.defaultValue,
                    entry.type,
                    entry.storeKey
                )
            );
        })
    );
}

export function getSetting(key: string) {
    return store.get(key)
}

export function setSetting(key: string, value: any) {
    store.set(key, value);
}

export function getSettingEntry(key: string) {
    return _.get(settingEntriesStore.getState(), key)
}

export function useSettings() {
    const settings = useAtomValue(settingEntriesAtom);
    const {get, set} = store.useStore();

    return {
        get, set, settings
    }
}

export function useSettingsValue() {
    const settings = useAtomValue(settingEntriesAtom);
    const {get} = store.useStoreValue();
    return {
        get, settings
    }
}
