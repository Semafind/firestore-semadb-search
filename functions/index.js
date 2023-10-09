/*
 * This template contains a HTTP function that
 * responds with a greeting when called
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about building extensions in the docs:
 * https://firebase.google.com/docs/extensions/publishers
 */

import {firestore, https} from "firebase-functions/v1";
import {handleSemaDBSync} from "./semadb.js";

// eslint-disable-next-line max-len
export const semadbSync = firestore.document(`/${process.env.FIRESTORE_COLLECTION}/{docId}`).onWrite((change, context) => {
  // -----------------------------
  return handleSemaDBSync(change.before, change.after);
});

export const semadbSearch = https.onCall(async (data, context) => {
  console.log("semadbSearch: ", data, context);
});
