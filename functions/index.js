import admin from "firebase-admin";
import functions from "firebase-functions";
admin.initializeApp()

const db = admin.firestore()
const BATCH_SIZE = 500
const LAST_SCHOOL_YEAR = 12

export const updateStudents = functions.https.onCall(async (data, context) => {
  const coll = db.collection('students')
  let snapshot = await coll.get()
  while (!snapshot.empty) {
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      const student = doc.data()
      if (student.schoolYear === LAST_SCHOOL_YEAR) {
        // graduate student
        batch.update(doc.ref, { status: 'graduated' })
      } else {
        // move student up to next school year
        batch.update(doc.ref, { schoolYear: student.schoolYear + 1 })
      }
    })
    await batch.commit()
    snapshot = await coll.startAfter(snapshot.docs[snapshot.docs.length - 1]).limit(BATCH_SIZE).get()
  }
})
