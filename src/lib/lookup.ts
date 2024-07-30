import {Extension, ExtensionMetadata, extensions} from "./extension-manager";
import {ok, Result} from "neverthrow";
import {NoteParams} from "@/lib/anki-connect.ts";
import {FIELDS} from "@/lib/flash-card.tsx";
import {registerSetting} from "@/lib/settings.ts";

export const lookupInitialization = async () => {
    registerSetting("lookup.flashcard.modelname", {
        title: "Flashcard Model Name",
        storeKey: "lookup.flashcard.modelname",
        description: "The name of the flashcard model to save the lookup results",
        defaultValue: "Zimmers-Flashcard-Model",
        type: "string",
    })
    registerSetting("lookup.flashcard.deckname", {
        title: "Flashcard Deck Name",
        storeKey: "lookup.flashcard.deckname",
        description: "The name of the flashcard deck to add the flashcards to",
        defaultValue: "Default",
        type: "string",
    })
    return ok(true)
}


export interface LookupProviderExtension extends Extension {
    getSupportedLookupRegex: () => RegExp[];
    performLookup: (query: string) => Promise<Result<LookupResult[], Error>>;
}

export type LookupResult = {
    targetField: "word" | "sentence" | "image" | "pronunciation" | "definition" | "article" | "extra" | "tag";
    value: string;
} | {
    targetField: "example";
    value: [string, string][];
}

export const performLookup = async (
    input: string
): Promise<[ExtensionMetadata, Result<LookupResult[], Error>][]> => {
    const providers = Array.from(
        extensions["lookup-provider"].values()
    ) as LookupProviderExtension[];
    console.log("Providers", providers);

    const usableProviders = providers.filter((provider) => {
        return provider
            .getSupportedLookupRegex()
            .some((regex) => regex.test(input));
    });

    console.log("Usable Providers", usableProviders);

    const results = await Promise.all(
        usableProviders.map(
            async (provider) =>
                [
                    provider.getMetadata(),
                    await provider.performLookup(input),
                ] satisfies [ExtensionMetadata, Result<LookupResult[], Error>]
        )
    );

    console.log("Results", results);

    return results;
};

export const flattenLookupResults = (
    results: [ExtensionMetadata, Result<LookupResult[], Error>][]
): LookupResult[] => {
    return results.flatMap(([, result]) => {
        if (result.isOk()) {
            return result.value;
        } else {
            return [];
        }
    });
}

export const lookupResultsToAnkiNoteParams = (
    results: LookupResult[]
) => {


    const tags: string[] = []
    const definitions: string[] = []
    const examples: [string, string][] = []
    let word = ''
    let pronunciation = ''
    let image = ''
    let sentence = ''
    let article = ''
    let extra = ''

    console.log("Going through Results", results)
    for (const result of results) {
        switch (result.targetField) {
            case 'word':
                word = result.value
                break
            case 'pronunciation':
                pronunciation = result.value
                break
            case 'definition':
                if (!definitions.includes(result.value))
                    definitions.push(result.value)
                break
            case 'example':
                for (const example of result.value) {
                    examples.push(example)
                }
                break
            case 'image':
                image = result.value
                break
            case 'sentence':
                sentence = result.value
                break
            case 'article':
                article = result.value
                break
            case 'extra':
                extra = result.value
                break
            case 'tag':
                tags.push(result.value)
                break
        }
    }

    const fields: Record<keyof typeof FIELDS, string> = {
        word,
        sentence,
        article,
        extra,
        image: "",
        definition: "",
        example_1: "",
        example_2: "",
        example_3: "",
        example_t_1: "",
        example_t_2: "",
        example_t_3: "",
        pronunciation: ""
    }

    const threeDefinitions = definitions.slice(0, 3)
    fields['definition'] = threeDefinitions.join('<br>')

    const threeExamples = examples.slice(0, 3)
    for (let i = 0; i < threeExamples.length; i++) {
        // @ts-ignore
        fields[`example_${i + 1}`] = threeExamples[i][0]
        // @ts-ignore
        fields[`example_t_${i + 1}`] = threeExamples[i][1]
    }


    const partialParams: Partial<NoteParams> = {
        tags,
        fields,
        options: {
            allowDuplicate: false
        }
    }

    if (image) partialParams.picture = [
        {
            url: image,
            fields: ['image'],
            filename: word + '.jpg'
        }
    ]
    if (pronunciation) partialParams.audio = [{
        url: pronunciation,
        fields: ['pronunciation'],
        filename: word + '.mp3'
    }]

    console.log("Partial Params", partialParams)

    return partialParams

}