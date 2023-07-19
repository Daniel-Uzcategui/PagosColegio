import admin from "firebase-admin";
import functions from "firebase-functions";
// // Create and Deploy Your First Cloud Functions
import corsFactory from "cors";
import express from "express";
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
// Your web app's Firebase configuration
const urlAppBase = "https://dev.Restaurant.com/#/";
const app = express();
const cors = corsFactory({ origin: true });
app.use(cors);
app.get("/api/managelink", async (req, res) => {
  try {
    const { u, p, i } = req.query;
    const path = "users/" + u + "/Projects/" + p + "/invites/";
    const inviteDoc = await admin.firestore().collection(path).doc(i).get();
    if (!inviteDoc.exists) {
      return res.redirect(urlAppBase + "404");
    }
    const inviteData = inviteDoc.data();
    if (inviteData.guest) {
      return res.redirect(urlAppBase + "myboard?p=" + p + "&u=" + u);
    }
    if (inviteData.invite) {
      return res.redirect(
        urlAppBase + "myboard?p=" + p + "&u=" + u + "&i=" + i
      );
    }
    res.redirect(urlAppBase + "404");
  } catch (error) {
    console.error(error);
  }
});
app.get("/api/usememberlink", async (req, res) => {
  try {
    const { u, p, i, userId } = req.query;
    const projectPath = "users/" + u + "/Projects/";
    const projectDocPath = projectPath + p;
    const projectRef = admin.firestore().collection(projectPath).doc(p);
    const invitesPath = projectDocPath + "/invites/";
    const inviteRef = admin.firestore().collection(invitesPath).doc(i);
    const inviteDoc = await inviteRef.get();
    if (!inviteDoc.exists) {
      return res.redirect(urlAppBase + "404");
    }
    const inviteData = inviteDoc.data();
    if (inviteData.guest) {
      return res.redirect(urlAppBase + "404");
    }
    if (inviteData.invite) {
      await inviteRef.delete();
      const userRef = admin.firestore().collection("users").doc(userId);
      await projectRef.update({
        ["members." + userId]: userRef,
        ["roles." + userId]: "Collaborator",
      });
      return res.send({ registered: true });
    }
    res.redirect(urlAppBase + "404");
  } catch (error) {
    console.error(error);
  }
});
export const api = functions.https.onRequest(app);
