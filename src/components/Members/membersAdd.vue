<template>
  <div>
    <q-card class="text-blue-grey-10">
      <q-card-section>
        <div class="text-h6 text-center">Members</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="search" type="text" placeholder="Name or email">
          <template v-slot:append>
            <q-icon
              :class="{ 'cursor-pointer': condition }"
              :name="inputIcon"
            />
          </template>
        </q-input>
      </q-card-section>
      <membersList v-model:search="search" v-model:cond="condition">
        <span
          v-if="!testPattern.email(search) && condition && search !== ''"
          class="text-red"
        >
          Please Enter a Valid email
        </span>
      </membersList>
    </q-card>
  </div>
</template>
<script setup>
import membersList from "./membersList.vue";
import { ref, computed } from "vue";
import { testPattern } from "quasar/src/utils/patterns";
console.log({ testPattern });
const condition = ref(false);
const search = ref("");
const inputIcon = computed(() => {
  if (!condition.value && !testPattern.email(search.value)) return "search";
  if (testPattern.email(search.value)) return "add";
  return "";
});
</script>
