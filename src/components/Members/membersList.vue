<template>
  <div>
    <q-list>
      <transition-group
        enter-active-class="leaveactive animated duration-50 rubberBand"
      >
        <memberListItem
          v-for="(user, id, index) of filterList()"
          :key="index"
          :index="index"
          :user="user"
          v-model:condition="condition"
          :updateCard="updateCard"
        ></memberListItem>
      </transition-group>
      <q-item v-if="condition">
        <q-item-section>
          <q-item-label class="text-center text-bold">
            No member found,
            <p>Enter an email to add them</p>
            <slot></slot>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script setup>
import { useProjectStore } from "src/stores/Project";
import { useUtilities } from "src/stores/utilities";
import { computed, watch, onMounted } from "vue";
import memberListItem from "./membersListItem.vue";
const props = defineProps({
  search: { type: String, default: "" },
  cond: { type: String, default: "" },
  updateCard: {
    type: Boolean,
    default: true,
  },
});
const condition = computed(() => Object.keys(filterList()).length === 0);
function filterList() {
  return useUtilities().ObjectFilter(list, (x) =>
    x?.name?.toLowerCase().includes(props.search.toLowerCase())
  );
}
const emits = defineEmits(["update:cond"]);
const list = useProjectStore().members;

watch(condition, (e) => emits("update:cond", e));
onMounted(() => {
  if (condition.value) emits("update:cond", true);
});
</script>
