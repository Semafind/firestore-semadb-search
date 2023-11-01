import {firestore, https} from "firebase-functions/v1";
import {handleSemaDBSync, handleSemaDBSearch} from "./semadb.js";

// eslint-disable-next-line max-len
export const semadbSync = firestore.document(`/${process.env.FIRESTORE_COLLECTION}/{docId}`).onWrite((change, context) => {
  // -----------------------------
  return handleSemaDBSync(change.before, change.after);
});

export const semadbSearch = https.onCall(async (data, context) => {
  return handleSemaDBSearch(data.vector, data.limit);
});
