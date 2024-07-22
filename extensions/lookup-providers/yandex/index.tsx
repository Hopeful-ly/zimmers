(function () {

    settings.register("yandex-key", {
        title: "Yandex API Key",
        description: "API key for Yandex",
        defaultValue: "",
        type: "string",
        storeKey: "yandex-key",
    });
    const genderToArticleMapping = {
        m: "Der",
        f: "Die",
        n: "Das",
    };
    const getMetadata = () => {
        return {
            name: "Yandex",
            description: "Lookup provider for Yandex",
            version: "0.1.0",
            extensionType: "lookup-provider",
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
            })
        );

        if (res.isErr()) {
            return err(new Error("Failed to fetch data"));
        }
        const data = res.value.data;

        console.debug(data);

        if (!data.def || data.def.length === 0) {
            return err(new Error("No results"));
        }

        return ok(
            <>
                {data.def
                    .map((def: any) => {
                        if (!def.tr || def.tr.length === 0) return;
                        const article = genderToArticleMapping[data.def[0].gen];

                        const definitions = def.tr.map((tr: any) => tr.text as string);

                        const info = def.fl;

                        return (
                            <div key={def.text}>
                                <h2>
                                    {article || ""}
                                    {def.text}
                                </h2>
                                <p>{info}</p>
                                <ul>
                                    {definitions.map((definition: string) => (
                                        <li key={definition}>{definition}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })
                    .filter(Boolean)}
            </>
        );
    };

    return {
        getMetadata,
        getSupportedLookupRegex,
        performLookup,
    };
})();
