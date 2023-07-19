<template>
  <q-item @click="updateData" clickable v-ripple>
    <q-item-section avatar>
      <memberBubble
        size="40"
        :key="user.name"
        :index="index"
        :name="user.name"
      />
    </q-item-section>
    <q-item-section>{{ user.name }}</q-item-section>
    <q-item-section side
      ><q-icon :name="isUserInCard" size="xs"
    /></q-item-section>
  </q-item>
</template>
<script setup>
import { deleteField } from "@firebase/firestore";
import { useListsStore } from "src/stores/lists";
import { useFilterStore } from "src/stores/filter";
import { computed } from "vue";
import memberBubble from "./memberBubble.vue";
const filterStore = useFilterStore();
const members = computed(() => filterStore.filter.members);
function updateData() {
  if (prop.updateCard) {
    return isUserInCard.value === "check" ? DeleteValues() : updateValues();
  }
  if (members.value[prop.user.id]) {
    return delete filterStore.filter.members[prop.user.id];
  }
  filterStore.filter.members[prop.user.id] = true;
}
const prop = defineProps({
  user: Object,
  index: Number,
  updateCard: {
    type: Boolean,
    default: true,
  },
});
const userProp = computed(() => prop.user);
const card = computed(() => useListsStore().selectedCard);
const isUserInCard = computed(() => {
  if (
    card.value.members?.[userProp.value.id] ||
    (!prop.updateCard && members.value[prop.user.id])
  ) {
    return "check";
  }
  return "";
});
const listStore = useListsStore();
const update = listStore.update;
const updateValues = async () =>
  update({
    id: card.value.listId,
    ["cards." + card.value.id + "." + "members." + userProp.value.id]:
      userProp.value,
  });
const DeleteValues = async () =>
  update({
    id: card.value.listId,
    ["cards." + card.value.id + "." + "members." + userProp.value.id]:
      deleteField(),
  });
</script>
