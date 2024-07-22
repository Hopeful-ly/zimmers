import axios from "axios";
import { err, ok, ResultAsync } from "neverthrow";

export interface AnkiConnectResponse<T = any> {
  result: T;
  error: string | null;
}

export const getDeckNames = async () => {
    return await invoke<string[]>("deckNames", {});
}

export const createDeck = async (deckName: string) => {
    return await invoke<number>("createDeck", {deck: deckName});
}



export async function invoke<T>(action: string, params: any) {
  const requestData = {
    action,
    params,
    version: 6,
  };
  const responseResult = await ResultAsync.fromPromise(
    axios.get<AnkiConnectResponse<T>>("http://localhost:8765", requestData),
    () => new Error("Failed to connect to AnkiConnect")
  );

  if (responseResult.isErr()) {
    return responseResult;
  }

  const requestResponse = responseResult.value;
  const data = requestResponse.data;
  if (data.error) {
    return err(new Error(`AnkiConnect error: ${data.error}`));
  }

  return ok(data.result);
}
