/*
 * This template contains a HTTP function that
 * responds with a greeting when called
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about building extensions in the docs:
 * https://firebase.google.com/docs/extensions/publishers
 */

import {firestore, https, logger} from "firebase-functions/v1";
import axios from "axios";
import {v4 as uuidv4} from "uuid";

const SEMADB_HOST = "semadb.p.rapidapi.com";
const SEMADB_ENDPOINT = "https://" + SEMADB_HOST;
const SEMADB_VECTOR_FIELD = "vector";
const SEMADB_POINT_ID_FIELD = "_semadbPointId";
const POINTS_URL = SEMADB_ENDPOINT + "/collections/" +
  process.env.SEMADB_COLLECTION + "/points";

const axiosInstance = axios.create({
  baseURL: POINTS_URL,
  timeout: 60000, // 60 seconds
  headers: {
    "content-type": "application/json",
    "X-RapidAPI-Key": process.env.SEMADB_API_KEY,
    "X-RapidAPI-Host": SEMADB_HOST,
  },
});

/**
 * Insert a point into semadb and update firestore document
 * @param {firestore.DocumentSnapshot} docSnap
 * @param {number[]} vector
 * @return {Promise<*>} Insert promise
 */
function insertPoint(docSnap, vector) {
  const newPointId = uuidv4();
  const insertPromise = axiosInstance({
    method: "POST",
    url: "",
    data: {
      points: [
        {
          id: newPointId,
          vector: vector,
          metadata: {
            firestoreDocId: docSnap.id,
          },
        },
      ],
    },
  });
  insertPromise.then((response) => {
    logger.debug("Point inserted:", response.data);
    return docSnap.ref.update({
      [SEMADB_POINT_ID_FIELD]: newPointId,
    });
  });
  return insertPromise;
}

/**
 * Update given point with new vector
 * @param {string} pointId
 * @param {number[]} vector
 * @return {Promise<*>} Update promise
 */
function updatePoint(pointId, vector) {
  return axiosInstance({
    method: "PUT",
    url: "",
    data: {
      points: [
        {
          id: pointId,
          vector: vector,
        },
      ],
    },
  });
}

/**
 * Delete given point from semadb and remove point id from firestore document
 * @param {firestore.DocumentSnapshot} docSnap
 * @param {string} pointId
 * @return {Promise<*>} Delete promise
 */
function deletePoint(docSnap, pointId) {
  const deletePromise = axiosInstance({
    method: "DELETE",
    url: "",
    data: {
      ids: [pointId],
    },
  });
  if (docSnap.exists) {
    const fieldRemovePromise = docSnap.ref.update({
      [SEMADB_POINT_ID_FIELD]: firestore.FieldValue.delete(),
    });
    return Promise.all([deletePromise, fieldRemovePromise]);
  }
  return deletePromise;
}

/**
 * Check if given object is a valid vector
 * @param {*} vector
 * @return {boolean}
 */
function isValidVector(vector) {
  if (!Array.isArray(vector)) {
    return false;
  }
  if (vector.length === 0) {
    return false;
  }
  return vector.every((v) => typeof v === "number");
}

/**
 * Compare two numeric arrays for close equality
 * @param {number[]} a First array to check
 * @param {number[]} b Second array to check
 * @return {boolean}
 */
function checkIfTwoNumericArraysAreClose(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((v, i) => Math.abs(v - b[i]) < 0.0001);
}

// eslint-disable-next-line max-len
export const semadbSync = firestore.document(`/${process.env.FIRESTORE_COLLECTION}/{docId}`).onWrite((change, context) => {
  // -----------------------------
  const oldDoc = change.before.data();
  const newDoc = change.after.data();
  const pointId = oldDoc?.[SEMADB_POINT_ID_FIELD];
  const oldVector = oldDoc?.[SEMADB_VECTOR_FIELD];
  const newVector = newDoc?.[SEMADB_VECTOR_FIELD];
  // -----------------------------
  if (!pointId && isValidVector(newVector)) {
    // Insert point
    logger.debug("Inserting point:", change.after.id);
    return insertPoint(change.after, newVector);
  }
  // -----------------------------
  if (pointId && !isValidVector(newVector)) {
    // Delete point
    logger.debug("Deleting point:", pointId);
    return deletePoint(change.after, pointId);
  }
  // -----------------------------
  if (pointId && isValidVector(newVector) &&
      isValidVector(oldVector) &&
      !checkIfTwoNumericArraysAreClose(oldVector, newVector)) {
    // Update point
    logger.debug("Updating point:", pointId);
    return updatePoint(pointId, newVector);
  }
  // -----------------------------
  // Nothing of interest for us
  return null;
});

export const semadbSearch = https.onCall(async (data, context) => {
  console.log("semadbSearch: ", data, context);
});
