# Post-installation Notes

This extension will now sync documents in `${param:FIRESTORE_COLLECTION}` which have a valid vector in the `${param:FIRESTORE_VECTOR_FIELD}` field to SemaDB `${param:SEMADB_COLLECTION}` collection.

Please refer to [callable functions](https://firebase.google.com/docs/functions/callable?gen=1st#call_the_function) to make a search request using `semadbSearch` function from your application. Note that the callable function name will be that of the extension and not `semadbSearch`, for example:

```javascript
const app = firebase.initializeApp(firebaseConfig);
const functions = app.functions("europe-west2");
const semadbSearch = functions.httpsCallable('ext-firestore-semadb-search-semadbSearch');
semadbSearch({ vector: vector }).then(/* ... */)
```

# See it in action

Create or edit a document in `${param:FIRESTORE_COLLECTION}` with a valid vector `${param:FIRESTORE_VECTOR_FIELD}` and the extension will make a request to SemaDB to index the document. The document should now have a `_semadbPointId` field.

# Monitoring

You can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
