<template>
  <q-page padding class="flex flex-center text-center">
    <h3 class="text-weight-thin">There is nothing you can't build...</h3>
    <p v-if="user">Hello {{ user.uid }}</p>
    {{ settings }}
    <q-btn
      color="white"
      text-color="black"
      label="Standard"
      @click="settings.var = 11"
    />
    <q-btn
      color="white"
      text-color="black"
      label="Standard"
      @click="settings.var = settings.var * 2"
    />
  </q-page>
</template>

<script setup>
import { useDocument, useCurrentUser } from "vuefire";
import { doc, getFirestore, collection } from "firebase/firestore";
import { computed } from "vue";
import { useAuthState } from "@vueauth/core";
const authState = useAuthState();
console.log({ ...authState });
const user = authState.user;
const contactSource = computed(() =>
  doc(collection(getFirestore(), "settings"), "some_id")
);
const settings = useDocument(contactSource);
</script>
