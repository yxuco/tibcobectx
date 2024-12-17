import path from 'node:path'
import url from 'node:url'
import type { Item, Mention, MentionsParams } from '@openctx/provider'
import { describe, expect, test } from 'vitest'
import tibcobe, { type Settings } from './index.js'

// We only run this if INTEGRATION is true to avoid flakiness.
// define INTEGRATION = true in .env and load it in vitest.config.ts for integration tests.
const INTEGRATION = !!process.env.INTEGRATION

describe('tibcobe', () => {
    const fixturesDir = path.join(__dirname, '__fixtures__/yxuco/Petstore')
    const fixturesSettings = {
        urls: [url.pathToFileURL(fixturesDir).toString()],
    }

    test('meta', () => {
        expect(tibcobe.meta({}, {})).toEqual({
            name: 'TibcoBE',
            mentions: { label: 'Search BE repos... (/yxuco/Petstore/)' },
        })

        expect(
            tibcobe.meta(
                {},
                {
                    urls: [
                        'https://raw.githubusercontent.com/yxuco/Petstore/',
                        'https://raw.githubusercontent.com/yxuco/be_sample/'
                    ],
                },
            ),
        ).toEqual({
            name: 'TibcoBE',
            mentions: { label: 'Search BE repos... (/yxuco/Petstore/, /yxuco/be_sample/)' },
        })

        expect(tibcobe.meta({}, { urls: ['https://raw.githubusercontent.com/yxuco/Petstore/'] })).toEqual({
            name: 'TibcoBE',
            mentions: { label: 'Search BE repos... (/yxuco/Petstore/)' },
        })
    })

    test('meta malformed', () => {
        expect(
            tibcobe.meta(
                {},
                {
                    urls: [
                        'https://raw.githubusercontent.com/yxuco/Petstore/',
                        'https://www.google.com/webhp',
                        'hello world',
                        '',
                    ],
                },
            ),
        ).toEqual({
            name: 'TibcoBE',
            mentions: { label: 'Search BE repos... (/yxuco/Petstore/, /webhp)' },
        })
    })

    test('empty query returns results', async () => {
        const settings = fixturesSettings

        const mentions = await tibcobe.mentions!({ query: '' }, settings)
        expect(mentions).toBeInstanceOf(Array)
        expect(mentions).toBeTruthy()
    })

    test('test query returns multiple files', async () => {
        const settings = fixturesSettings

        const mentions = await tibcobe.mentions!({ query: 'rule:rdbms' }, settings)
        expect(mentions).toHaveLength(1)
        expect(mentions[0].title).toEqual('rule:rdbms')
        expect(mentions[0].uri).toContain(url.pathToFileURL(path.join(fixturesDir, 'Rules/AddItemToCart.rule')).toString())
        expect(mentions[0].uri).toContain(url.pathToFileURL(path.join(fixturesDir, 'TestData/FunctionSamples/rdbmFunctions.rulefunction')).toString())
    })

    test.runIf(INTEGRATION)('integration test query returns multiple files', async () => {
        const baseURL = 'https://raw.githubusercontent.com/yxuco/Petstore/'

        const mentions = await tibcobe.mentions!({ query: 'rule:rdbms' }, {urls: [baseURL]} as Settings)
        expect(mentions).toHaveLength(1)
        expect(mentions[0].title).toEqual('rule:rdbms')
        expect(mentions[0].uri).toContain(new URL('refs/heads/main/Rules/AddItemToCart.rule', baseURL).toString())
        expect(mentions[0].uri).toContain(new URL('refs/heads/main/TestData/FunctionSamples/rdbmFunctions.rulefunction', baseURL).toString())
    })

    test('test rule content', async () => {
        const settings = fixturesSettings
        const mentionPath = path.join(fixturesDir, 'Rules/AddItemToCart.rule')
        const item = await expectMentionItem({ query: 'rule' }, settings, {
            title: 'rule',
            uri: url.pathToFileURL(mentionPath).toString(),
        })
        expect(item.ai?.content).toContain(
            'rule Rules.AddItemToCart {',
        )
    })

    test.runIf(INTEGRATION)('integration test rule content', async () => {
        const settings = {
            urls: ['https://raw.githubusercontent.com/yxuco/Petstore/'],
        }

        const item = await expectMentionItem({ query: 'rule' }, settings, {
            title: 'rule',
            uri: 'https://raw.githubusercontent.com/yxuco/Petstore/refs/heads/main/Rules/AddItemToCart.rule',
        })
        expect(item.ai?.content).toContain(
            'rule Rules.AddItemToCart {',
        )
    })

    test('missing code has no results', async () => {
        const settings = fixturesSettings
        const mentions = await tibcobe.mentions!({ query: 'abort' }, settings)
        expect(mentions).toHaveLength(0)
    })

    test.runIf(INTEGRATION)('integration test missing code', async () => {
        const settings = {}
        const mentions = await tibcobe.mentions!({ query: 'abort' }, settings)
        expect(mentions).toHaveLength(0)
    })
})

/**
 * Helper which expects a certain mention back and then passes it on to items
 */
async function expectMentionItem(
    params: MentionsParams,
    settings: Settings,
    mention: Mention,
): Promise<Item> {
    const mentions = await tibcobe.mentions!(params, settings)
    expect(mentions).toContainEqual(mention)

    const items = await tibcobe.items!({ mention }, settings)
    expect(items).toHaveLength(1)
    const item = items[0]

    expect(item.title).toContain(mention.title)
    expect(item.url).toEqual(mention.uri)

    return item
}
