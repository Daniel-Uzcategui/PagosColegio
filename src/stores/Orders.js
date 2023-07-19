import { defineStore } from "pinia";
import { computed } from "vue";
import { collection, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "src/boot/vuefire";
import { useCollection } from "vuefire";

export const useOrderStore = defineStore(
  "Order",
  () => {
    try {
      const orderSource = computed(
        () => collection(db,'/ambiente/ruedalo/orders')
      )
      const orderLastSource = computed(() => query(
        collection(db,'/ambiente/ruedalo/orders'),
        orderBy("dateIn", 'desc'),
        limit(1)
      ))
      const lastOrder = useCollection(orderLastSource)
      // contact will always be in sync with the data source
      const list = useCollection(orderSource)
      async function set(payload) {
        try {
          const docRef = doc(db, '/ambiente/ruedalo/orders', payload.id);
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
        set,
        lastOrder,
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
