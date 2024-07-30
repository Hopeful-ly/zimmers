import {default as a} from "axios";
import {err as e, ok as o, Result as r, ResultAsync as ra} from "neverthrow";
import {getSetting, registerSetting, setSetting} from "../src/lib/settings";
import * as s from "../src/lib/store"
import type {LookupProviderExtension} from "../src/lib/lookup"


declare global {
    declare var axios: typeof a;
    declare var Result: typeof r;
    declare var err: typeof e;
    declare var ok: typeof o;
    declare var ResultAsync: typeof ra;
    declare var store: {
        set: typeof s.set;
        get: typeof s.get;
    };
    declare var settings: {
        set: typeof setSetting;
        get: typeof getSetting;
        register: typeof registerSetting
    };

    declare type LookupProvider = LookupProviderExtension;
    declare type LookupResult = lr;
}
