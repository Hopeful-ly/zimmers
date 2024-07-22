import { ReactNode } from "react";
import { Extension, ExtensionMetadata, extensions } from "./extension-manager";
import { Result } from "neverthrow";

export interface LookupProviderExtension extends Extension {
  getSupportedLookupRegex: () => RegExp[];
  performLookup: (query: string) => Promise<Result<ReactNode, Error>>;
}

export const performLookup = async (
  input: string
): Promise<[ExtensionMetadata, Result<ReactNode, Error>][]> => {
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
          await provider.performLookup.bind({
            Result: Result,
          })(input),
        ] satisfies [ExtensionMetadata, Result<ReactNode, Error>]
    )
  );

  console.log("Results", results);

  return results;
};
