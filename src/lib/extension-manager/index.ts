import {confirm, message, open} from "@tauri-apps/plugin-dialog";
import {copyFile, exists, mkdir, readDir, readFile, remove,} from "@tauri-apps/plugin-fs";
import {err, ok, Result, ResultAsync} from "neverthrow";
import {appDataDir, join} from "@tauri-apps/api/path";
import z from "zod";
import axios from "axios";
import {runEvalWithVariables} from "@/lib/utils.ts";
import * as store from "@/lib/store.ts";
import {getSetting, registerSetting, setSetting} from "@/lib/settings.ts";

export const extensions: Record<string, Map<string, Extension>> = {
    "media-support": new Map(),
    "lookup-provider": new Map(),
};


export const extensionInitialization = async () => {

    if (!(await exists(await join(await appDataDir(), "extensions")))) {
        console.log("Creating extensions directory");
        await mkdir(await join(await appDataDir(), "extensions"), {
            recursive: true,
        });
    }

    const extensionDir = await join(await appDataDir(), "extensions");
    const files = await readDir(extensionDir);
    console.log(files);
    for (const file of files) {
        console.log(file);
        const path = await join(extensionDir, file.name);
        const loadResult = await loadExtension(path);
        if (loadResult.isErr()) {
            const error = loadResult.error;
            await message(error.message);
            console.log(error);
            continue;
        }
        const result = await installExtension(loadResult.value);
        if (result.isErr()) {
            const error = result.error;
            await message(`Failed to load extension ${file.name}: ${error.message}`);
        }
    }
    return ok(undefined);
}

export const ExtensionMetadataSchema = z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    extensionType: z.union([
        z.literal("media-support"),
        z.literal("lookup-provider"),
    ]),
});

export type ExtensionMetadata = z.infer<typeof ExtensionMetadataSchema>;


export type Extension = {
    getMetadata: () => ExtensionMetadata;
}

export async function openFilePicker() {
    const response = await ResultAsync.fromPromise(
        open({
            filters: [{extensions: ["js"], name: "Extension Bundle"}],
            canCreateDirectories: true,
            multiple: true,
            title: "Select zimmers extension",
        }),
        () => new Error("Failed to load extension")
    );
    return response.map((res) => (res ? res : []));
}

export async function readExtension(path: string) {
    const bufferResult = await ResultAsync.fromPromise(
        readFile(path),
        () => new Error("Failed to read file")
    );
    if (bufferResult.isErr()) return bufferResult;

    const buffer = bufferResult.value;
    const contentResult = Result.fromThrowable(() => {
        // convert to utf-8 string
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(buffer);
    })();
    if (contentResult.isErr())
        return err(new Error("Extension has invalid content encoding"));

    const content = contentResult.value;
    if (!content) return err(new Error("Extension has no content"));

    return ok(content);
}

export async function parseExtension(content: string) {
    const rawExtension = Result.fromThrowable(() => runEvalWithVariables(content, {
        axios,
        Result,
        err,
        ok,
        ResultAsync,
        store: {
            set: store.set,
            get: store.get,
        },
        settings: {
            set: setSetting,
            get: getSetting,
            register: registerSetting
        }
    }))();
    if (rawExtension.isErr()) return err(new Error("Failed to run extension"));

    const extension = rawExtension.value;
    console.log(extension);

    const rawMetadataResult = Result.fromThrowable(() =>
        extension.getMetadata()
    )();
    if (rawMetadataResult.isErr())
        return err(new Error("Extension is broken: " + rawMetadataResult.error));
    const rawMetadata = rawMetadataResult.value;

    const metadataValidation = ExtensionMetadataSchema.safeParse(rawMetadata);
    if (!metadataValidation.success) return err(new Error("Invalid metadata"));


    return ok(extension)
}

export async function uninstallExtension(extension: Extension) {
    const metadata = extension.getMetadata();
    const extensionType = metadata.extensionType;
    const extensionMap = extensions[extensionType];
    if (!extensionMap) return err(new Error("Unsupported extension type"));
    extensionMap.delete(metadata.name);

    const extensionDir = await join(await appDataDir(), "extensions");
    const path = await join(extensionDir, `${metadata.name}.js`);
    if (!(await exists(path))) return err(new Error("Extension does not exist"));
    await remove(path);

    return ok(undefined);
}

export async function promptAndInstallExtension() {
    const filesResult = await openFilePicker();
    if (filesResult.isErr()) return filesResult;

    if (filesResult.value.length === 0) {
        return err(new Error("No files selected"));
    }

    const files = filesResult.value;

    for (const file of files) {
        const path = file.path;
        if (!path) return err(new Error("No path"));
        const installationResult = await installExtensionFromPath(path);
        if (installationResult.isErr()) {
            const error = installationResult.error;
            await message(error.message);
            console.log(error);
        }
    }
    return ok(undefined);
}

export async function installExtension(extension: Extension) {
    const metadata = extension.getMetadata();
    const extensionType = metadata.extensionType;

    const extensionMap = extensions[extensionType];
    if (!extensionMap) return err(new Error("Unsupported extension type"));
    extensionMap.set(metadata.name, extension);
    return ok(undefined);
}

export async function loadExtension(path: string) {
    const contentResult = await readExtension(path);
    if (contentResult.isErr()) return contentResult;
    const content = contentResult.value;

    // parse the extension file
    return await parseExtension(content);
}

export async function installExtensionFromPath(path: string) {

    const loadResult = await loadExtension(path);
    if (loadResult.isErr()) return loadResult
    const extension = loadResult.value;

    const extensionMetadata = extension.getMetadata();
    if (!extensionMetadata) return err(new Error("Extension has no metadata"));

    if (extensions[extensionMetadata.extensionType].has(extensionMetadata.name)) {
        const existingExtension = extensions[extensionMetadata.extensionType].get(extensionMetadata.name);
        if (!existingExtension) return err(new Error("Failed to get existing extension"));
        const existingVersion = existingExtension.getMetadata().version;
        const newVersion = extensionMetadata.version;
        const message = await confirm(
            `Replace "${extensionMetadata.name}" v${existingVersion} with v${newVersion}?`,
            {
                okLabel: "Replace",
                cancelLabel: "Cancel",
                kind: "warning",
                title: "Replace extension",
            }
        );
        if (!message) return ok(false);

        extensions[extensionMetadata.extensionType].delete(extensionMetadata.name);
        await remove(await join(await appDataDir(), "extensions", `${extensionMetadata.name}.js`));
    }

    const extensionDir = await join(await appDataDir(), "extensions");
    const newPath = await join(
        extensionDir,
        `${extensionMetadata.name}.js`
    );

    // copy the file to the extension directory
    const copyResult = await ResultAsync.fromPromise(
        copyFile(path, newPath),
        (e) => new Error("Failed to copy file " + e)
    );

    if (copyResult.isErr()) return copyResult;

    // read the extension file
    // install the extension
    const installResult = await installExtension(extension);
    if (installResult.isErr()) return installResult;

    return ok(true)
}
