# TIBCO BE context provider for OpenCtx

This is a context provider for [OpenCtx](https://openctx.org) that fetches contents from a TIBCO BE project for use as context.

## Usage

Add the following to your settings in any OpenCtx client, e.g. Cody for VS Code.  Specify one or more URLs of TIBCO BE projects.

```json
"openctx.providers": {
    // ...other providers...
    "file:///path/to/openctx/provider/tibcobe/dist/bundle.js": {
        "urls": ["https://raw.githubusercontent.com/yxuco/Petstore/"]
    }
},
```

If this provider is uploaded to public npm repository, you can use it like this:

```json
"openctx.providers": {
    // ...other providers...
    "https://openctx.org/npm/@openctx/provider-tibcobe": {
        "urls": ["https://raw.githubusercontent.com/yxuco/Petstore/", "https://raw.githubusercontent.com/tibco/Sample/"]
    }
},
```

The specified TIBCO BE projects should each contain an `index.json` file, such as the sample [index.json](./__fixtures__/yxuco/Petstore/index.json) file, which specifies the artifacts to be fetched as context for AI code assistants.

To add a context to Cody chat window, type '@', then select 'TibcoBE', then select query from the list.  To select multiple contexts, type ':' and then select another query, e.g., '@rule:rdbms' would return 2 contexts, 'rule' and 'rdbms'.

## Development

* `pnpm install`: Install dependencies
* `pnpm run bundle`: Build the provider
* `pnpm run update-fixtures`: Prepare fixtures for testing
* `pnpm run test`: Run the tests

References:
- [Docs](https://openctx.org/docs/creating-a-provider)
- License: Apache 2.0
