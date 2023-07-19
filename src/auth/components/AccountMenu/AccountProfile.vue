<template>
  <q-item clickable>
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
          label="Project Name"
          @change="scope.set"
        />
      </q-popup-edit>
    </q-item-section>
  </q-item>
</template>
<script setup>
import memberBubble from "src/components/Members/memberBubble.vue";
import { useUsersStore } from "src/stores/User";
import { computed } from "vue";
const name = computed({
  get: () => useUsersStore().currentUserDoc?.name,
  set: (e) => useUsersStore().set({ name: e }),
});
</script>
