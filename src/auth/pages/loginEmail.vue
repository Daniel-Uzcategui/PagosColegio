<template>
  <div>Hola</div>
</template>
<script setup>
import { useUsersStore } from "src/stores/User";
import { onMounted } from "vue";

onMounted(() => {
  useUsersStore().LoginWithEmail();
});
</script>
