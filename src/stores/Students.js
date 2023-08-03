import { defineStore } from "pinia";
import { computed } from "vue";
import { collection, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "src/boot/vuefire";
import { useCollection } from "vuefire";

export const useStudentStore = defineStore(
  "Students",
  () => {
    try {
      const studentSource = computed(
        () => collection(db,'/students')
      )
      const studentLastSource = computed(() => query(
        collection(db,'/students'),
        orderBy("dateIn", 'desc'),
        limit(1)
      ))
      const queryStudents = query(
        collection(db,'/students'),
        orderBy("dateIn", 'desc'),
        limit(10)
      )
      const lastStudent = useCollection(studentLastSource)
      // contact will always be in sync with the data source
      const list = useCollection(studentSource)
      async function add(payload) {
        try {
          let date = new Date()
          const docRef = doc(collection(db, '/students/'));
          await setDoc(
            docRef,
            {
              ...payload,
              id: docRef.id,
              dateIn: date,
              lastModified: date,
            },
            { merge: true }
          );
        } catch (error) {
          console.error(error);
        }
      }
      async function set(payload) {
        try {
          const docRef = doc(db, '/students', payload.id);
          await setDoc(
            docRef,
            {
              ...payload,
              lastModified: new Date(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error(error);
        }
      }
      return {
        queryStudents,
        add,
        set,
        lastStudent,
        list
      };
    } catch (error) {
      console.error(error);
    }
  },
  {
    persist: true
  }
);
