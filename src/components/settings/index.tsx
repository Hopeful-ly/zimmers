import {SettingEntry, SettingEntryType, useSettings} from "@/lib/settings.ts";
import {Input} from "@/components/ui/input.tsx";

export default function SettingsView() {
    const {settings} = useSettings()
    console.log(settings)

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">
                Settings
            </h1>

            {Object.entries(settings).map(([key, value]) => {
                return (
                    <NestedSettingEntryView key={key} entry={value} level={1}/>
                )
            })}
        </div>
    )
}

export function SettingEntryView({entry}: { entry: SettingEntry, level: number }) {
    const {get,set} = useSettings()
    return (
        <div className="p-2">
            <div>{entry.title}</div>
            <div>{entry.description}</div>
            {
                entry.type === "string" && (
                    <Input
                        type="text"
                        value={get(entry.storeKey)}
                        onChange={(e) => set(entry.storeKey, e.target.value)}
                    />
                )
            }
            {
                entry.type === "number" && (
                    <input
                        type="number"
                        value={get(entry.storeKey)}
                        onChange={(e) => set(entry.storeKey, e.target.value)}
                    />
                )
            }
            {
                entry.type === "boolean" && (
                    <input
                        type="checkbox"
                        checked={get(entry.storeKey)}
                        onChange={(e) => set(entry.storeKey, e.target.checked)}
                    />
                )
            }
        </div>
    )
}

export function NestedSettingEntryView({entry, level}: { entry: SettingEntryType, level: number }) {


    if (entry instanceof SettingEntry) {
        return (
            <div className={`p-2`}>
                <SettingEntryView entry={entry} level={level}/>
            </div>
        )
    }

    const entries = Object.entries(entry);
    return (
        <div className={`p-2`}>
            {entries.map(([key, value]) => {
                return (
                    <NestedSettingEntryView key={key} entry={value} level={level + 1}/>
                )
            })}
        </div>
    )


}
