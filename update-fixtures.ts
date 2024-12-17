import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { fetchDoc, fetchIndex } from './tibcobe.js'

/**
 * USAGE pnpm run update-fixtures
 *
 * This updates the fixtures from a sample TIBCO BE project yxuco/Petstore in GitHub.
 * We store the files specified by the index.json of the project in the fixtures directory.
 */

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function writeFixture(relPath: string, content: string) {
    const p = path.join(__dirname, '__fixtures__', relPath)
    await fs.mkdir(path.dirname(p), { recursive: true })
    await fs.writeFile(p, content)
}

async function main() {
    const proj = 'yxuco/Petstore'
    const tibURL = `https://raw.githubusercontent.com/${proj}/refs/heads/main/`
    const index = await fetchIndex(tibURL)

    // write out index file
    index.types = []
    await writeFixture(`${proj}/index.json`, JSON.stringify(index))

    for (const entry of index.entries) {
        const url = tibURL + entry.path
        const { content } = await fetchDoc(url)
        await writeFixture(path.join(proj, entry.path), content)
    }
}

await main()
