# TIBCO BE context provider for OpenCtx

This is a context provider for [OpenCtx](https://openctx.org) that fetches source code from one or more TIBCO BE projects to be used as context for AI models.

## Usage

Add the following to your settings in any OpenCtx client, e.g. [Cody for VS Code](https://sourcegraph.com/cody).  Specify one or more URLs of TIBCO BE projects.

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

To add contexts to Cody's chat window, type '@', then select 'TibcoBE', then select a query from the displayed list.  To select multiple contexts, type queries separated by ':', e.g., '@rule:rdbms' would return 2 contexts, 'rule' and 'rdbms'.  Press the Enter key to select the context, and then write your request for Cody to generate code for TIBCO BE.

## Cody for VS Code examples

Install [Cody for VS Code](https://sourcegraph.com/cody), and configure the settings as described above.

Open any TIBCO project in VS Code, and start Cody's chat window.  Type a request:

```
@rule:rdbms write rule that queries database using the sql statement and result concept uri specified by an event.
```

It should return a TIBCO BE rule that queries a database, and returns an event containing the resulting concepts.

Type another request:

```
@concept create a Student concept that contains properties of name, major, gpa, class, and department.
```

It should return the definition of a TIBCO BE concept containing the specified properties.

## Development

* `pnpm install`: Install dependencies
* `pnpm run bundle`: Build the provider
* `pnpm run update-fixtures`: Prepare fixtures for testing
* `pnpm run test`: Run unit tests

References:
- [Docs](https://openctx.org/docs/creating-a-provider)
- License: Apache 2.0
