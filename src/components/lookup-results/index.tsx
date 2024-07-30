import {ExtensionMetadata} from "@/lib/extension-manager";
import {Result} from "neverthrow";
import {LookupResult} from "@/lib/lookup.ts";

export default function LookupResults({
                                          lookups,
                                      }: {
    lookups: [ExtensionMetadata, Result<LookupResult[], Error>][];
}) {
    return (
        <div className="flex p-5 gap-3 flex-wrap">
            {lookups.map(([metadata, result], i) => (
                <LookupResultView key={i} metadata={metadata} result={result}/>
            ))}
        </div>
    );
}

function LookupResultView({
                              metadata,
                              result,
                          }: {
    metadata: ExtensionMetadata;
    result: Result<LookupResult[], Error>;
}) {
    return (
        <div className="p-4 border w-full md:w-1/2 lg:w-1/3">
            <h2 className="text-lg font-semibold">{metadata.name}</h2>
            <div className="pt-2 mt-2 border-t">
                {result.isOk() ? <>

                    {
                        result.value.map((lookup, i) => (
                            <div key={i} className="mt-2">
                                <h3 className="text-md font-semibold">{lookup.targetField}</h3>
                                <p>{lookup.value}</p>
                            </div>
                        ))
                    }

                </> : <p>Error: {result.error.message}</p>}
            </div>
        </div>
    );
}
