

import useExtensions from "@/lib/extension-manager/use-extensions"
import {Button} from "@/components/ui/button.tsx";
import {promptAndInstallExtension} from "@/lib/extension-manager";
import {message} from "@tauri-apps/plugin-dialog";
export default function Extensions() {
    const {extensions} =  useExtensions()
    return (
        <div
            className="p-4"
        >
            <h1
                className="text-2xl font-bold flex justify-between items-center"
            >Extensions

                <Button
                    onClick={async () => {
                        const res = await promptAndInstallExtension()
                        if (res.isErr()) {
                            console.error(res.error)
                            await message(res.error.message)
                            return
                        }
                        await message("Extension installed")
                    }}

                >
                    Import
                </Button>
            </h1>




            <div
                className="p-4 flex flex-col gap-4"
            >
                {Object.entries(extensions).map(([type, extensions]) => (
                    <div
                        className="p-4 border border-gray-200 rounded-lg"
                        key={type}>
                        <h2
                            className="text-xl font-bold"
                        >{type}</h2>
                        <div
                            className="p-4"
                        >
                            {Array.from(extensions.values()).map((extension) => (
                                <div
                                    className="p-2 border border-gray-200 rounded m-2"
                                    key={extension.getMetadata().name}>
                                    {extension.getMetadata().name} - {extension.getMetadata().version}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}