import {ExtensionMetadata,} from "@/lib/extension-manager";
import {performLookup} from "@/lib/lookup";
import {listen} from "@tauri-apps/api/event";
import {Result} from "neverthrow";
import {ReactNode, useEffect, useState} from "react";
import LookupResults from "../lookup-results";
import {invoke} from "@tauri-apps/api/core";

export default function ASBPlayground() {
    const [input, setInput] = useState("");
    const [word, setWord] = useState("");

    const [lookup, setLookup] = useState<
        [ExtensionMetadata, Result<ReactNode, Error>][]
    >([]);

    useEffect(() => {
        listen("clipboard-update", (e) => {
            setInput(e.payload as string);
        }).catch((e) => console.error(e));
// detect text selection
        const selectionChangeListener = async () => {
            const selection = window.getSelection();
            if (selection) {
                const lookup = await performLookup(selection.toString());
                setLookup(lookup);
            }
        };
        window.addEventListener("selectionchange", selectionChangeListener);
        return () =>
            window.removeEventListener("selectionchange", selectionChangeListener);
    }, []);

    useEffect(() => {
        const lookupDelay = setTimeout(async () => {
            console.log("Performing lookup");
            const lookup = await performLookup(input);
            console.log(lookup);
            setLookup(lookup);
        }, 300);
        return () => clearTimeout(lookupDelay);
    }, [input]);

    const [lemma, setLemma] = useState("");

    useEffect(() =>{

        const syncDelay = setTimeout(async () => {
            if (word === "") {
                return;
            }
            console.log("Performing lemmatization");
            const lemma = await invoke<string>("lemmatize", {word}).catch((e) => {
                return "Error: " + e;
            });
            console.log(lemma);
            setLemma(lemma);
        }, 300);


        return  () => clearTimeout(syncDelay);
    },[word])

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">
                ASB Player Playground
            </h1>
            <div className="flex items-center mt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 border outline-none"
                />
                <input type="text"
                       value={word}
                          onChange={(e) => setWord(e.target.value)}
                            className="w-full p-2 border outline-none"
                />
                <h2 className="text-lg font-semibold">{lemma}</h2>
            </div>
            <LookupResults lookups={lookup}/>
        </div>
    );
}
