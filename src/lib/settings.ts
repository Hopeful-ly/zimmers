import {BaseDirectory, create, exists, readTextFile, remove, writeTextFile} from "@tauri-apps/plugin-fs";
import {err, ok, Result, ResultAsync} from "neverthrow";
import {confirm, message} from "@tauri-apps/plugin-dialog";
import {createStore} from "zustand";
import {atomWithStore} from "jotai-zustand";
import {produce} from "immer";
import _ from "lodash";
import * as store from "./store"
import {useAtomValue} from "jotai";


export const settingsInitialization = async () => {
    if (!(await exists("settings.json", {baseDir: BaseDirectory.AppData}))) {
        await create("settings.json", {baseDir: BaseDirectory.AppData});
        await writeTextFile("settings.json", JSON.stringify({}), {baseDir: BaseDirectory.AppData});
        return ok(true);
    }

    const file = await ResultAsync.fromPromise(readTextFile("settings.json", {baseDir: BaseDirectory.AppData}),
        (err) => new Error(`Failed to read settings file: ${err}`)
    );

    if (file.isErr()) {
        await message(file.error.message,
            {title: "Error reading settings file"});
        return err(new Error("Failed to read settings file"));
    }

    const settings = Result.fromThrowable(() => JSON.parse(file.value))();
    if (settings.isErr()) {
        const confirmation = await confirm(`Failed to parse settings file. This could be due the settings being invalid: ${file.value}`,
            {
                title: "Error reading settings file",
                kind: "error",
                cancelLabel: "Ignore (not recommended)",
                okLabel: "Reset settings"
            });
        if (!confirmation) {
            return err(new Error("Failed to parse settings file"));
        }
        await remove("settings.json", {baseDir: BaseDirectory.AppData});
    }

    return ok(true);
}


export interface NestedSettingEntry {
    [key: string]: SettingEntry | NestedSettingEntry;
}

export type SettingEntryType = NestedSettingEntry | SettingEntry;

export const settingEntriesStore = createStore<NestedSettingEntry>(() => ({}))

export const settingEntriesAtom = atomWithStore(settingEntriesStore);

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
