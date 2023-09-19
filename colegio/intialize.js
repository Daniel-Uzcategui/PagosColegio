
import admin from "firebase-admin";
import {onDocumentCreated, onDocumentWritten, onDocumentUpdated } from "firebase-functions/v2/firestore";
import {setGlobalOptions} from "firebase-functions/v2/options";
import {onCall, onRequest} from "firebase-functions/v2/https";
setGlobalOptions({maxInstances: 10, timeoutSeconds: 300});
admin.initializeApp();
export {admin, onDocumentCreated, onDocumentWritten, onCall, onDocumentUpdated, onRequest}