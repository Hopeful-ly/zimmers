import {err, ok, Result, ResultAsync} from "neverthrow";
import {FIELDS} from "@/lib/flash-card.tsx";
import {invoke as rustInvoke} from "@tauri-apps/api/core";


type AnkiConnectResponse<T> = {
    result: T;
    error: string | null;
}


async function invoke<T>(action: string, params: any) {

    const responseResult = await ResultAsync.fromPromise(rustInvoke("anki", {
            data: JSON.stringify({
                action,
                params,
                version: 6
            })
        }),
        (error) => new Error(`Failed to invoke anki: ${error}`)
    )

    if (responseResult.isErr()) {
        return err(responseResult.error);
    }

    const response = responseResult.value as string;

    const ankiResponseResult = Result.fromThrowable(() => JSON.parse(response) as AnkiConnectResponse<T>)();
    if (ankiResponseResult.isErr()) {
        return err(new Error(`Failed to parse anki response.`));
    }

    const ankiResponse = ankiResponseResult.value;

    if (ankiResponse.error) {
        return err(new Error(`Anki error: ${ankiResponse.error}`));
    }

    const result = ankiResponse.result;


    return ok(result);
}

const getDeckNames = async () => {
    return await invoke<string[]>("deckNames", {});
}
const getModelNames = async () => {
    return await invoke<string[]>("modelNames", {});
}

const createDeck = async (deckName: string) => {
    return await invoke<number>("createDeck", {deck: deckName});
}
const createModel = async (model: any) => {
    return await invoke<number>("createModel", model);
}

export const deckExists = async (deckName: string) => {
    const deckNamesResult = await getDeckNames();
    if (deckNamesResult.isErr()) {
        return err(new Error(`Failed to get deck names: ${deckNamesResult.error.message}`));
    }
    const deckNames = deckNamesResult.value;

    return ok(deckNames.includes(deckName));
}

export const modelExists = async (modelName: string) => {
    const modelNamesResult = await getModelNames();
    if (modelNamesResult.isErr())
        return err(new Error(`Failed to get model names: ${modelNamesResult.error.message}`));
    const modelNames = modelNamesResult.value;
    return ok(modelNames.includes(modelName));
}

export const ensureDeckExists = async (deckName: string) => {
    const deckExistsResult = await deckExists(deckName);
    if (deckExistsResult.isErr()) {
        return deckExistsResult;
    }

    if (!deckExistsResult.value) {
        const creationResult = await createDeck(deckName);
        if (creationResult.isErr()) {
            return err(new Error(`Failed to create deck: ${creationResult.error.message}`));
        }
    }

    return ok(undefined);
}

export const ensureModelExists = async (modelName: string, model: Model) => {
    const modelExistsResult = await modelExists(modelName);
    if (modelExistsResult.isErr()) {
        return modelExistsResult;
    }

    if (!modelExistsResult.value) {
        const creationResult = await createModel(model);
        if (creationResult.isErr()) {
            return err(new Error(`Failed to create model: ${creationResult.error.message}`));
        }
    }

    return ok(undefined);
}


export const checkConnection = async () => {
    const result = await invoke("version", {});
    if (result.isErr()) {
        return false;
    }
    return true;
}

export type NoteParams = {
    deckName: string;
    modelName: string;
    fields: Record<keyof typeof FIELDS, string>;
    tags: string[];
    audio?: {
        url: string;
        filename: string;
        fields: string[];
    }[];
    video?: {
        url: string;
        filename: string;
        fields: string[];
    }[];
    picture?: {
        url: string;
        filename: string;
        fields: string[];
    }[];
    options:{
        allowDuplicate: boolean;
    }

}

export const addNote = async (note: NoteParams) => {
    return await invoke("addNote", {note});
}


export type Model = {
    modelName: string;
    inOrderFields: (keyof typeof FIELDS)[];
    css: string;
    isCloze: boolean;
    cardTemplates: {
        Front: string;
        Back: string;
    }[];
}


