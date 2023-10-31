Use this extension as a thin wrapper around [SemaDB](https://rapidapi.com/semafind-semadb/api/semadb) public API. It creates two [functions](https://firebase.google.com/docs/extensions/publishers/functions):

- `semadbSync` listens to collection document writes in Firestore and if the document contains a vector field, it makes a request to SemaDB to index it. *Only the document ID and vector is synced, no other data is sent.*
- `semadbSearch` makes a vector search request to SemaDB and returns the points.

### Additional Setup

Before using this extension you must:

1. Register on [RapidAPI](https://rapidapi.com/semafind-semadb/api/semadb) and get an API key for SemaDB.
2. Create a collection with the desired vector size and distance metric. Take a note of the collection name.

### Billing

SemaDB billing and usage limits are available on [RapidAPI pricing page](https://rapidapi.com/semafind-semadb/api/semadb/pricing).

This extension uses other Firebase or Google Cloud Platform services which may have associated charges:

- Firestore to write SemaDB point IDs on indexing the document.
- Cloud Functions to run the aforementioned functions.

When you use Firebase Extensions, you're only charged for the underlying resources that you use. A paid-tier billing plan is only required if the extension uses a service that requires a paid-tier plan, for example calling to a Google Cloud Platform API or making outbound network requests to non-Google services. All Firebase services offer a free tier of usage. [Learn more about Firebase billing.](https://firebase.google.com/pricing)
