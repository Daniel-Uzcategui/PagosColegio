<template>
  <q-layout view="lHh Lpr lFf">
    <div class="column items-center">
      <transition
        appear
        enter-active-class="animated slideInRight"
        leave-active-class="animated slideOutRight"
      >
        <LogoTitle></LogoTitle>
      </transition>
    </div>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import LogoTitle from "../components/logoTitle.vue";
const route = useRoute();

const path = computed(() => route.meta.title);
</script>
