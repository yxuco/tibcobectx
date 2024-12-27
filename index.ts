import type {
    ItemsParams,
    ItemsResult,
    MentionsParams,
    MentionsResult,
    MetaParams,
    MetaResult,
    Provider,
} from '@openctx/provider'

import { Cache } from './cache.js'
import { fetchDoc, fetchIndex } from './tibcobe.js'

// The default URLs for TIBCO BE cookbook projects.
const DEFAULT_URLS = [
    'https://raw.githubusercontent.com/yxuco/Petstore/'
]

// GitHub ref URL for the main branch.
const GIT_REF = 'refs/heads/main/'

/**
 * Settings for the TIBCO BE OpenCtx provider.
 */
export type Settings = {
    /**
     * The list of URLs to serve. Defaults to DEFAULT_URLS.
     *
     * These should be top-level URLs of a TIBCO BE cookbook project.  For GitHub repo, 
     * this should be the URL of raw source code of the project root, e.g.,
     * https://raw.githubusercontent.com/yxuco/Petstore/
     *
     * Additionally this supports file:// URLs for local development.
     */
    urls?: string[]
}

/**
 * An OpenCtx provider that fetches the content from a TIBCO BE project.
 * It is assumed that the project contains a index.json file that defines
 * the index of cookbook items within the project.
 * 
 * The index.json file should be replaced by a real indexed search engine.
 */
const tibcobe: Provider<Settings> = {
    meta(_params: MetaParams, settings: Settings): MetaResult {
        const urls = settings.urls ?? DEFAULT_URLS
        const slugs = urls.map(u => {
            try {
                return new URL(u).pathname;
            } catch {
                return '';
            }
        }).filter(Boolean)
        return {
            name: 'TibcoBE',
            mentions: { label: `Search BE repos... (${slugs.join(', ')})` },
        }
    },

    async mentions(params: MentionsParams, settings: Settings): Promise<MentionsResult> {
        const urls = settings.urls ?? DEFAULT_URLS
        const indexes = await Promise.all(urls.map(url => getMentionIndex(url)))

        const entries = indexes.flatMap(index => {
            return index.entries.map(entry => ({
                title: entry.name,
                uri: new URL(entry.path, index.url).toString(),
            }))
        })

        entries.sort((a, b) => b.title.localeCompare(a.title))

        const results = entries.filter(entry => {
            if (params.query === undefined || params.query.length === 0) {
                return true
            }
            else {
                const queries = params.query.toLowerCase().split(':')
                return queries.some(query => entry.title.toLowerCase().includes(query))
            }
        }).slice(0, 20)

        if (params.query === undefined || params.query.length === 0) {
            return [{
                title: 'all',
                uri: results.map(r => r.uri).join(', '),
            }]
        }
        else if (params.query?.includes(':')) {
            // Cody takes only one item per query, so join them together.
            return [{
                title: params.query,
                uri: results.map(r => r.uri).join(', '),
            }]
        }
        else {
            return results
        }
    },

    async items(params: ItemsParams): Promise<ItemsResult> {
        const mention = params.mention
        if (!mention) {
            return []
        }

        const uris = mention.uri.split(', ')
        return Promise.all(uris.map(async (uri, index) => {
            const { content } = await fetchDoc(uri)
            return ({
                title: `${mention.title}_${index + 1}`,
                url: uri,
                ai: {
                    content: content,
                },
            })
        }))
    }
}

// Use cache to avoid refetching index on each request.
const cache = new Cache<MentionIndex>({
    ttlMS: 1000 * 60 * 60 * 12, // 12 hours
})

interface MentionIndex {
    // The normalized base URL of the indexed entries.
    url: string
    entries: { name: string; path: string }[]
}

async function getMentionIndex(tibURL: string): Promise<MentionIndex> {
    // ensure urls end with / to ensure we treat path as a dir when creating new relative paths.
    if (!tibURL.endsWith('/')) {
        tibURL = tibURL + '/'
    }

    if ((new URL(tibURL)).protocol !== 'file:' && tibURL.includes("githubusercontent")) {
        // attach GitHub ref URL if the file is in a GitHub repo.
        tibURL = tibURL + GIT_REF
    }

    return await cache.getOrFill(tibURL, async () => {
        const index = await fetchIndex(tibURL)
        const entries = index.entries.map(entry => ({
            name: entry.name,
            path: entry.path,
        }))

        return {
            url: tibURL,
            entries: entries,
        }
    })
}

export default tibcobe
