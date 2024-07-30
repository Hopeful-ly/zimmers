(function (): LookupProvider {
    settings.register("yandex-key", {
        title: "Yandex API Key",
        description: "API key for Yandex",
        defaultValue: "",
        type: "string",
        storeKey: "yandex-key",
    });
    const genderToArticleMapping: Record<string, string> = {
        m: "Der",
        f: "Die",
        n: "Das",
    };
    const getMetadata = () => {
        return {
            name: "Yandex",
            description: "Lookup provider for Yandex",
            version: "0.1.0",
            extensionType: "lookup-provider" as const,
        };
    };

    const getSupportedLookupRegex = () => {
        return [/\w+/];
    };

    const performLookup = async (query: string) => {
        const key = store.get("yandex-key");
        if (!key) {
            return err(new Error("Yandex API key not set"));
        }

        const res = await ResultAsync.fromPromise(
            axios.get("https://dictionary.yandex.net/api/v1/dicservice.json/lookup", {
                params: {
                    key,
                    lang: "de-en",
                    text: query,
                },
            }),
            () => ''
        );

        if (res.isErr()) {
            return err(new Error("Failed to fetch data"));
        }
        const data = res.value.data;

        console.debug(data);

        if (!data.def || data.def.length === 0) {
            return err(new Error("No results"));
        }

        const results = [] as LookupResult[];

        data.def
            .forEach((def: any) => {
                if (!def.tr || def.tr.length === 0) return;

                const article = genderToArticleMapping[data.def[0].gen];
                const definitions = def.tr.map((tr: any) => tr.text as string);
                const info = def.fl;

                if (article)
                    results.push({
                        targetField: "article",
                        value: article,
                    })
                if (info)
                    results.push({
                        targetField: "extra",
                        value: info,
                    })
                for (const definition of definitions) {
                    results.push({
                        targetField: "definition",
                        value: definition,
                    });
                }
            })

        return ok(results);
    };

    return {
        getMetadata,
        getSupportedLookupRegex,
        performLookup,
    };
})();
