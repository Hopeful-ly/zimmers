// @ts-nocheck
import { readFile } from "fs/promises";
import { ResultAsync, Result, err, ok } from "neverthrow";
import axios from "axios";

globalThis.ResultAsync = ResultAsync;
globalThis.Result = Result;
globalThis.err = err;
globalThis.ok = ok;
globalThis.axios = axios;

globalThis.window = {
  store: new Map(),
};

globalThis.window.store.set(
  "yandex-key",
  "dict.1.1.20240415T090157Z.889b775aac57037a.cb52e6579b9fe4869b3b710800c1a2a76219a7b6"
);

const extensionContent = await readFile(
  "C:/Users/himas/Documents/devs/UmamiTurtle/projects/zimmers/tests/test.zjs",
  "utf-8"
);

const extension = eval(extensionContent);
const res = await extension.performLookup("Hallo");

if (res.isErr()) {
  console.error(res.error.message);
} else {
  const data = res.value;
  console.log(data);
}
