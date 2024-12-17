import fs from 'node:fs/promises'
import url from 'node:url'

/** The source code file found in the index.json of a TIBCO BE cookbook project. */
interface Index {
    entries: {
        /** @example "concept, event, rule, or function" */
        name: string
        /** @example "Concepts/Product.concept */
        path: string
        /** @example "concept" */
        type: string
    }[]
    types: {
        /** @example "rule" */
        name: string
        /** @example 56 */
        count: number
        /** not used */
        slug: string
    }[]
}

export async function fetchIndex(tibURL: string): Promise<Index> {

    const baseURL = new URL(tibURL)
    const indexURL = new URL('index.json', baseURL)
    if (baseURL.protocol === 'file:') {
        return JSON.parse(await fs.readFile(url.fileURLToPath(indexURL), 'utf8'))
    }

    const response = await fetch(indexURL.toString())
    const index = JSON.parse(await response.text())

    return index
}

export async function fetchDoc(docURL: string): Promise<{ content: string, hash: string }> {
    const contentURL = new URL(docURL)

    const hash = contentURL.hash
    contentURL.hash = ''

    if (contentURL.protocol === 'file:') {
        return { content: await fs.readFile(url.fileURLToPath(contentURL), 'utf8'), hash }
    }

    const response = await fetch(contentURL.toString())
    return { content: await response.text(), hash }
}
