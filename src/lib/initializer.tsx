import {ok, Result, ResultAsync} from "neverthrow";
import {ReactNode, useEffect, useState} from "react";

import {extensionInitialization} from "@/lib/extension-manager";
import {storeInitialization} from "@/lib/store.ts";
import {invoke} from "@tauri-apps/api/core";
import {lookupInitialization} from "@/lib/lookup.ts";


export type Initialization = () => Promise<Result<any, Error>>
export const initializations: Record<string, Initialization> = {
    'extension-loader': extensionInitialization,
    'store': storeInitialization,
    'lemmatizer': async () =>
        await ResultAsync.fromPromise(
            invoke(
                "initialize_spacy",
                {}
            ),
            (error) => new Error(`Failed to initialize spacy: ${error}`
            )
        ),
    'lookups': lookupInitialization

}

export async function initialize(logStage: (stage: string, type: 'warning' | 'error' | "info" | "success") => any) {
    logStage("Beginning initialization", "info");

    for (const [name, init] of Object.entries(initializations)) {
        logStage(`Initializing ${name}`, "info");
        const result = await init();
        if (result.isErr()) {
            logStage(`Failed to initialize ${name}: ${result.error.message}`, "error");
            return result;
        }
        logStage(`Initialized ${name}`, "success");
    }

    logStage(`Initialization complete`, "success");

    logStage(`Waiting for 1 second`, "info");
    return ok(undefined);
}

export default function InitializationProvider({children}: { children: ReactNode }) {


    const [isInitialized, setIsInitialized] = useState(false);

    const [logs, setLogs] = useState<string[]>([]);


    useEffect(() => {
        function logStage(stage: string, type: 'warning' | 'error' | "info" | "success") {
            console.log(`[INITIALIZATION] ${type.toUpperCase()} ${stage}`)
            setLogs(prev => [...prev, `[${type.toUpperCase()}] ${stage}`])
        }

        const initializationTask = async () => {
            setIsInitialized(false);
            return await initialize(logStage)
        }
        initializationTask().then(() => setIsInitialized(true)).catch(() => console.error("ERROR! FAILED TO INITIALIZE"))
    }, [])

    return (<div
        className="flex flex-col w-full h-full"
    >
        {isInitialized ? children : <div className="flex flex-col w-full h-full items-center justify-center p-10">
            <div className="text-2xl font-bold">Initializing...</div>
            <div className="flex flex-col w-full h-full items-center justify-center">
                {logs.map((log, index) => <div key={index}>{log}</div>)}
            </div>
        </div>}
    </div>)

}