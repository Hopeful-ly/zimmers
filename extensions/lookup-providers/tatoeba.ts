import {LookupResult} from "../../src/lib/lookup.ts";

(function (): LookupProvider {

    const getMetadata = () => ({
        name: "Tatoeba",
        description: "Lookup provider for Tatoeba",
        version: "0.1.0",
        extensionType: "lookup-provider" as const,
    });

    // support any word ( from any language)
    const getSupportedLookupRegex = () => [/.+/];


    const api = axios.create({
        baseURL: "https://api.dev.tatoeba.org/unstable"
    });

    return {
        getMetadata,
        getSupportedLookupRegex,
        async performLookup(query) {

            const fetchResult = await ResultAsync.fromPromise(
                api.get("/sentences", {
                    params: {
                        q: query,
                        lang: "deu",
                        trans: "eng",
                        page: 1,
                        limit: 4
                    }
                }),
                () => new Error("Failed to fetch data from Tatoeba")
            );
            if (fetchResult.isErr()) {
                return err(fetchResult.error);
            }
            const response = fetchResult.value;

            const sentences = response.data.data;

            const examples = sentences
                .map(
                    (sentence: any) =>
                        [sentence.text,
                            sentence.translations.find(
                                (translationData: any[]) => translationData.length
                            )[0]?.text] as [string, string]
                )
                .filter((entry: [string, string]) => entry[1]);

            return ok([
                {
                    targetField: "example",
                    value: examples
                }
            ] satisfies LookupResult[]);

        },
    }
})()