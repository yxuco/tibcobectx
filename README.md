# TIBCO BE context provider for OpenCtx

This is a context provider for [OpenCtx](https://openctx.org) that fetches source code from one of more TIBCO BE projects to be used as context for AI models.

## Usage

Add the following to your settings in any OpenCtx client, e.g. Cody for VS Code.  Specify one or more URLs of TIBCO BE projects.

```json
"openctx.providers": {
    // ...other providers...
    "file:///path/to/tibcobectx/dist/bundle.js": {
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

To add a context to Cody chat window, type '@', then select 'TibcoBE', then select a query from the displayed list.  To select multiple contexts, type queries separated by ':', e.g., '@rule:rdbms' would return 2 contexts, 'rule' and 'rdbms'.

## Development

* `pnpm install`: Install dependencies
* `pnpm run bundle`: Build the provider
* `pnpm run update-fixtures`: Prepare fixtures for testing
* `pnpm run test`: Run unit tests

References:
- [Docs](https://openctx.org/docs/creating-a-provider)
- License: Apache 2.0
