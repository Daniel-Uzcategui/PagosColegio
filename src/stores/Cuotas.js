import { defineStore } from "pinia";
import { ref } from "vue";
import { collection, doc, setDoc, query, orderBy, limit, deleteDoc } from "firebase/firestore";
import { db, functions } from "src/boot/vuefire";
import {
  Loading,
} from 'quasar'
import { httpsCallable } from "firebase/functions";

export const useCuotaStore = defineStore(
  "Cuotas",
  () => {
    try {
      const BCV = ref(0)
      async function getBCV() {
        if (BCV.value === 0) {
          const getBCV = httpsCallable(
            functions,
            'getBCV'
          );
          const result = await getBCV();
          BCV.value = result.data
          return result.data;
        } else {
          return BCV.value
        }
      }
      async function addStudentCuota(payload) {
        try {
          Loading.show()

          let date = new Date()
          const docRef = doc(collection(db, `/students/${payload.studentId}/cuota_payments`));
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
          throw error
        } finally {
          return Loading.hide()
        }
      }
      async function add(payload) {
        try {
          Loading.show()

          let date = new Date()
          const docRef = doc(collection(db, '/cuotas/'));
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
          throw error
        } finally {
          return Loading.hide()
        }
      }
      async function set(payload) {
        try {
          Loading.show()
          const docRef = doc(db, '/cuotas', payload.id);
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
          throw error
        } finally {
          return Loading.hide()
        }
      }
      async function del(payload) {
        try {
          Loading.show()
          const docRef = doc(db, '/cuotas', payload.id);
          await deleteDoc(
            docRef
          );
        } catch (error) {
          console.error(error);
          throw error
        } finally {
          return Loading.hide()
        }
      }
      return {
        addStudentCuota,
        add,
        set,
        del,
        getBCV
      };
    } catch (error) {
      console.error(error);
    }
  },
  {
    persist: true
  }
);
