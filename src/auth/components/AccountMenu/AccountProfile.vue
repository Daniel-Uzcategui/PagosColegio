<template>
  <q-item v-if="name" clickable>
    <q-item-section side>
      <memberBubble :size="40" :name="name" :index="0" />
    </q-item-section>
    <q-item-section>
      {{ name }}
      <q-popup-edit
        v-model="name"
        style="width: 200px"
        auto-save
        v-slot="scope"
      >
        <q-input
          v-model="scope.value"
          type="text"
          label="Nombre"
          @change="scope.set"
        />
      </q-popup-edit>
    </q-item-section>
  </q-item>
</template>
<script setup>
import { collection, doc } from "firebase/firestore";
import { db } from "src/boot/vuefire";
import memberBubble from "src/components/Members/memberBubble.vue";
import { useUsersStore } from "src/stores/User";
import { computed } from "vue";
import { useDocument } from "vuefire";
const user = useDocument(doc(collection(db, 'users'), useUsersStore().currentUser.uid))
const name = computed({
  get: () => user.value?.name,
  set: (e) => useUsersStore().set({ name: e }),
});
</script>
