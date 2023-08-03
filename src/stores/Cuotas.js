import { defineStore } from "pinia";
import { computed } from "vue";
import { collection, doc, setDoc, query, orderBy, limit, deleteDoc } from "firebase/firestore";
import { db } from "src/boot/vuefire";
import { useCollection } from "vuefire";
import {
  Loading,
} from 'quasar'

export const useCuotaStore = defineStore(
  "Cuotas",
  () => {
    try {
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
        add,
        set,
        del
      };
    } catch (error) {
      console.error(error);
    }
  },
  {
    persist: true
  }
);
