
(function () {

  const getMetadata = () => ({
    name: "Lingva",
    description: "Lookup provider for Lingva",
    version: "0.1.0",
    extensionType: "lookup-provider",
  });

  // anything (anything)
  const getSupportedLookupRegex = () => [/.+/];

  const performLookup = async (query: string) => {

    const result = await ResultAsync.fromPromise(

      axios.get("https://lingva.lunar.icu/api/v1/de/en/" + query),
        () => new Error("Failed to fetch data")

    );

    if (result.isErr()) {
      return err(new Error("Failed to fetch data"));
    }

    const data = result.value.data;

    const translation = data.translation;

    return ok(<p>{translation}</p>);
  };

  return {
    getMetadata,
    getSupportedLookupRegex,
    performLookup,
  };

})();
