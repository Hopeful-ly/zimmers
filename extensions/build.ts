import fs from 'fs/promises'
import path from 'path'


const targetBase = "./target"

async function build(filePath: string) {
    const fileFolder = path.dirname(filePath);
    const targetFolder = path.join(targetBase, fileFolder);

    await fs.mkdir(targetFolder, {recursive: true});

    await Bun.build({
        entrypoints: [filePath],
        outdir: targetFolder,
        minify: true,
        splitting: false,
        target: "browser",
        sourcemap: "none",
        format: "esm",
    })
    console.log(`Built ${filePath} to ${targetFolder}`);
}


async function buildAllInFolder(folderPath: string) {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if ((await fs
            .stat(filePath))
            .isDirectory())
            await buildAllInFolder(filePath)
        else
            await build(filePath);
    }
}

await buildAllInFolder("./lookup-providers");
