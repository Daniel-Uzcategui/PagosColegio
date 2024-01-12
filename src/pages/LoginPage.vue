<template>
    <q-page class="flex flex-center">
      <q-form @submit="submitForm">
        <q-input filled v-model="email" label="Email" type="email" />
        <q-input filled v-model="password" label="Password" type="password" />
        <q-btn label="Login" type="submit" color="primary" />
      </q-form>
    </q-page>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useUsersStore } from 'stores/User.js';
  import { useRouter } from 'vue-router';
  export default {
    setup() {
      const router = useRouter();
      const email = ref('');
      const password = ref('');
      const userStore = useUsersStore();
  
      const submitForm = async () => {
        const result = await userStore.login(email.value, password.value);
          if (result) {
            router.push('/students');
          }
      };
  
      return { email, password, submitForm };
    },
  };
  </script>
  