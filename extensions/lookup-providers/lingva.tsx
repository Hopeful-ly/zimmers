import {LookupResult} from "../../src/lib/lookup.ts";

(function (): LookupProvider {

    const getMetadata = () => ({
        name: "Lingva",
        description: "Lookup provider for Lingva",
        version: "0.1.0",
        extensionType: "lookup-provider" as const,
    });

    // anything (anything)
    const getSupportedLookupRegex = () => [/.+/];

    const performLookup = async (query: string) => {

        const result = await ResultAsync.fromPromise(
            axios.get("https://lingva.lunar.icu/api/v1/de/en/" + query),
            () => ""
        );

        if (result.isErr()) {
            return err(new Error("Failed to fetch data"));
        }

        const data = result.value.data;

        const translation = data.translation;

        return ok([{
            value: translation,
            targetField: "definition",
        }]satisfies LookupResult[]);
    };

    return {
        getMetadata,
        getSupportedLookupRegex,
        performLookup,
    };

})();
