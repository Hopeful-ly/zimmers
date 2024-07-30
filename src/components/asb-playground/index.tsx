import {ExtensionMetadata,} from "@/lib/extension-manager";
import {listen} from "@tauri-apps/api/event";
import {Result} from "neverthrow";
import {useCallback, useEffect, useState} from "react";
import LookupResults from "../lookup-results";
import {invoke} from "@tauri-apps/api/core";
import {flattenLookupResults, LookupResult, lookupResultsToAnkiNoteParams, performLookup} from "@/lib/lookup.ts";
import {Button} from "@/components/ui/button.tsx";
import {addNote, ensureDeckExists, ensureModelExists, NoteParams} from "@/lib/anki-connect.ts";
import {useSettings} from "@/lib/settings.ts";
import {message} from "@tauri-apps/plugin-dialog";
import {getZimmersModel} from "@/lib/flash-card.tsx";

export default function ASBPlayground() {
    const [input, setInput] = useState("");
    const [word, setWord] = useState("");
    const [lookup, setLookup] = useState<
        [ExtensionMetadata, Result<LookupResult[], Error>][]
    >([]);

    const {get} = useSettings()

    useEffect(() => {
        listen("clipboard-update", (e) => {
            setInput(e.payload as string);
        }).catch((e) => console.error(e));
    }, []);

    const [lemma, setLemma] = useState("");

    useEffect(() => {
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


        return () => clearTimeout(syncDelay);
    }, [word])

    useEffect(() => {
        const lookupAction = async () => {
            const lookups = await performLookup(lemma)
            setLookup(lookups)
        }

        lookupAction()
    }, [lemma])

    const addFlashcard = useCallback(async () => {
        const modelName = get("lookup.flashcard.modelname")
        const deckName = get("lookup.flashcard.deckname")

        const deckEnsuranceResult = await ensureDeckExists(deckName)
        if (deckEnsuranceResult.isErr()) {
            await message("Failed to ensure deck exists: " + deckEnsuranceResult.error.message)
            return
        }

        const modelEnsuranceResult = await ensureModelExists(modelName, getZimmersModel())
        if (modelEnsuranceResult.isErr()) {
            await message("Failed to ensure model exists: " + modelEnsuranceResult.error.message)
            return
        }


        const lookups = [
            {
                targetField: "word",
                value: word
            },
            {
                targetField: "sentence",
                value: input,
            },
            ...flattenLookupResults(lookup),
        ]satisfies LookupResult[]
        const partialParams = lookupResultsToAnkiNoteParams(lookups)
        const params = {
            ...partialParams,
            deckName,
            modelName,
        } as NoteParams
        console.log("PARAMS!",params)
        const result = await addNote(params)
        if (result.isErr()) {
            await message("Failed to add note: " + result.error.message)
        } else {
            await message("Note added successfully")
        }

    }, [word, input, lookup])


    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">
                ASB Player Playground
            </h1>
            <div className="mt-4">
                <div
                    className="mb-5 flex items-center justify-left p-2 rounded cursor-pointer border transition flex-wrap"
                >
                    {
                        input === "" ?

                            (
                                <span className="opacity-50">
                                    No pasted text
                                </span>
                            )
                            : (
                                input.replace(/\s+/g, " ").split(" ").filter((word) => word.length > 0).map((word, index) => (
                                    <span key={index}
                                          className="p-1 font-bold rounded cursor-pointer hover:bg-gray-100 transition"
                                          onClick={() => setWord(word.replace(
                                              /[^\p{L}\p{N}\s]/gu
                                              , ''
                                          ))}
                                    >
                                        {word}
                                    </span>
                                ))
                            )
                    }
                </div>

                <div>
                    <input type="text"
                           value={word}
                           onChange={(e) => setWord(e.target.value)}
                           className="w-full p-2 border outline-none"
                    />
                </div>
                <h2 className="text-lg font-semibold">{lemma}</h2>
            </div>
            <Button disabled={!lookup.length} onClick={addFlashcard}>Add Flashcard</Button>
            <LookupResults lookups={lookup}/>
        </div>
    );
}
