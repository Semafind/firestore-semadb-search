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
import axios from "axios";

const SEMADB_HOST = "semadb.p.rapidapi.com";
const SEMADB_ENDPOINT = "https://" + SEMADB_HOST;

const axiosInstance = axios.create({
  baseURL: SEMADB_ENDPOINT,
  timeout: 1000,
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': process.env.SEMADB_API_KEY,
    'X-RapidAPI-Host': SEMADB_HOST,
  },
});

export const semadbSync = firestore.document(`/${process.env.FIRESTORE_COLLECTION}/{docId}`).onWrite((change, context) => {
  const semadbCollection = process.env.SEMADB_COLLECTION;
  console.log("semadbSync: ", change, context);
  const docId = context.params.docId;
  return null;
});

export const semadbSearch = https.onCall(async (data, context) => {
  console.log("semadbSearch: ", data, context);
});
