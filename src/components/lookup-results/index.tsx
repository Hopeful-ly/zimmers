import { ExtensionMetadata } from "@/lib/extension-manager";
import { Result } from "neverthrow";
import {ReactNode} from "react";

export default function LookupResults({
  lookups,
}: {
  lookups: [ExtensionMetadata, Result<ReactNode, Error>][];
}) {
  return (
    <div className="flex p-5 gap-3">
      {lookups.map(([metadata, result], i) => (
        <LookupResult key={i} metadata={metadata} result={result} />
      ))}
    </div>
  );
}

function LookupResult({
  metadata,
  result,
}: {
  metadata: ExtensionMetadata;
  result: Result<ReactNode, Error>;
}) {
  return (
    <div className="p-4 border w-1/3">
      <h2 className="text-lg font-semibold">{metadata.name}</h2>
      <div className="pt-2 mt-2 border-t">
        {result.isOk() ? result.value : <p>Error: {result.error.message}</p>}
      </div>
    </div>
  );
}
