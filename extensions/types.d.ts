import {default as a} from "axios";
import {err as e, ok as o, Result as r, ResultAsync as ra} from "neverthrow";
import {getSetting, setSetting} from "../src/lib/settings";
import * as s from "../src/lib/store"

declare global {
    const axios: typeof a;
    const Result: typeof r;
    const err: typeof e;
    const ok: typeof o;
    const ResultAsync: typeof ra;
    const store: {
        set: typeof s.set;
        get: typeof s.get;
    };
    const settings: {
        set: typeof setSetting;
        get: typeof getSetting;
    };
}


