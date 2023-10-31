import axios from "axios";
import {logger} from "firebase-functions/v1";
import {FieldValue} from "firebase-admin/firestore";
import {v4 as uuidv4} from "uuid";

const SEMADB_COLLECTION = process.env.SEMADB_COLLECTION || "mycollection";
const SEMADB_HOST = "semadb.p.rapidapi.com";
const SEMADB_ENDPOINT = "https://" + SEMADB_HOST;
const FIRESTORE_VECTOR_FIELD = process.env.FIRESTORE_VECTOR_FIELD || "vector";
const SEMADB_POINT_ID_FIELD = "_semadbPointId";
const POINTS_URL = SEMADB_ENDPOINT + "/collections/" +
  SEMADB_COLLECTION + "/points";

// We export axiosInstance so we can mock it in tests
export const axiosInstance = axios.create({
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
  }).then((response) => {
    logger.debug("Point inserted:", response.data);
    return docSnap.ref.update({
      [SEMADB_POINT_ID_FIELD]: newPointId,
    });
  }).catch((err) => {
    logger.error("Error inserting point:", err?.response?.data);
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
  }).then((response) => {
    logger.debug("Point updated:", response.data);
  }).catch((err) => {
    logger.error("Error updating point:", err?.response?.data);
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
  }).then((response) => {
    logger.debug("Point deleted:", response.data);
  }).catch((err) => {
    logger.error("Error deleting point:", err?.response?.data);
  });
  if (docSnap.exists) {
    const fieldRemovePromise = docSnap.ref.update({
      [SEMADB_POINT_ID_FIELD]: FieldValue.delete(),
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

/**
 * Handles sync between firestore and semadb
 * @param {firestore.DocumentSnapshot} oldDocSnap
 * @param {firestore.DocumentSnapshot} newDocSnap
 * @return {Promise<*>}
 */
export function handleSemaDBSync(oldDocSnap, newDocSnap) {
  const oldDoc = oldDocSnap.data();
  const newDoc = newDocSnap.data();
  const pointId = newDoc?.[SEMADB_POINT_ID_FIELD];
  const oldVector = oldDoc?.[FIRESTORE_VECTOR_FIELD];
  const newVector = newDoc?.[FIRESTORE_VECTOR_FIELD];
  // -----------------------------
  if (!pointId && isValidVector(newVector)) {
    // Insert point
    logger.debug("Inserting point:", newDocSnap.id);
    return insertPoint(newDocSnap, newVector);
  }
  // -----------------------------
  if (pointId && !isValidVector(newVector)) {
    // Delete point
    logger.debug("Deleting point:", pointId);
    return deletePoint(newDocSnap, pointId);
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
}

/**
 * Makes a search request to semadb
 * @param {number[]} vector
 * @param {number} limit
 * @return {Promise<object[]>} Array of points
 */
export async function handleSemaDBSearch(vector, limit) {
  if (!isValidVector(vector)) {
    throw new Error("Invalid vector");
  }
  logger.debug("Handling vector search with limit:", limit);
  try {
    const res = await axiosInstance({
      method: "POST",
      url: "/search",
      data: {
        vector: vector,
        limit: limit,
      },
    });
    // Sample return:
    // [
    //  {
    //    "id": "ba8c42b7-0d11-47f5-9bf8-ddc11d61dda7",
    //    "distance": 0,
    //    "metadata": {
    //      "firestoreDocId": "dcbR9jrc8p81cd0gegSx"
    //    }
    //  }
    // ]
    //
    return {"points": res.data.points};
  } catch (err) {
    logger.error("Error searching for vector:", err?.response?.data);
    return {"points": [], "error": err?.response?.data?.error};
  }
  // -----------------------------
}
