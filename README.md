# SemaDB Firebase Firestore Vector Search

SemaDB Firebase extension is a thin wrapper around the public [SemaDB API](https://rapidapi.com/semafind-semadb/api/semadb). It attempts to:

- Sync documents in Firestore with a valid vector to SemaDB. It only stores the document ID and the vector without sending other document data.
- Provides a [callable function](https://firebase.google.com/docs/functions/callable?gen=1st#call_the_function) to perform vector search within a Firebase application.

**It doesn't backfill to avoid potentially high costs** and starts indexing updated or newly created documents after the extension is installed.

Please refer to `PREINSTALL.md` for more information on how to install and use the extension.


# Contributing

Thank you for considering to contribute! This repo is hopefully structured in an easy-to-understand manner and you can get started quickly.

Please:

1. Create an issue to track the contribution.
2. Follow the [fork and pull request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) approach.
3. Add documentation, ideally tests and `npm run lint`.
4. Be respectful of others :rocket:

> Thanks again!

## Getting started

Most of the action happens inside the `functions` folder. We start by installing the dependencies:

```bash
cd functions && npm install
```

and then running the emulators, please install [firebase tools](https://www.npmjs.com/package/firebase-tools) if it is not already installed:

```bash
cd integration-tests && firebase emulators:start --project=demo-test
```

You can now navigate to the [emulator UI](http://localhost:4000) to see the emulators running.


## Repo structure

The structure is mostly dictated by the firebase tool that generates the skeleton. The files you are interested in are:

- `extension.yaml` is the declaration of the extension, parameters and functions.
- `semadb.js` where all the work happens.
- `integration-test.spec.js` contains the test cases.

## Manual live testing

If you edit `semadb-firebase.secret.local` with your actual [SemaDB API key](https://rapidapi.com/semafind-semadb/api/semadb), running the emulators will make requests to the public live instance.

1. Create a collection on the public API using the [interactive playground](https://rapidapi.com/semafind-semadb/api/semadb) named `mycollection`.
2. In the Firestore emulator, create a collection called `mycollection` and a document with a `vector` field with 2 numbers. Here 2 is the default vector size in the public API, it should match the SemaDB collection vector size.
3. After you save the document, it should have a point ID which is a successful indexing of the document.
4. You can verify that the SemaDB collection has points by getting the collection (GetCollection endpoint) and searching for points (SearchPoint endpoint) in the interactive playground.
5. Finally, you can make a local search request by using the command in the `tasks.json` file.

## Automated testing

From the `functions` folder you can run:

```bash
npm run test
```

which runs the tests.

## Help needed

We are open to all contributions but here are some ideas to get started:

- [ ] More tests for syncing documents. We are looking for when the extension is making requests to SemaDB using the mock adapter.
- [ ] Documentation for end users. The documentation is lacking examples for users such as how to use the search function in an application
- [ ] Live working example of the extension. If anyone has a public repo using the extension, it would be nice to give reference and credit.