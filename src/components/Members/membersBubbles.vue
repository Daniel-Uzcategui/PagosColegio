<template>
  <div class="relative-position">
    <transition-group
      name="list"
      appear
      enter-active-class="leaveactive animated duration-1000 rubberBand"
      leave-to-class="animated duration-1000 jello"
    >
      <memberBubble
        v-for="(user, id, index) in members"
        :key="user.name"
        :index="index"
        :name="user.name"
        :size="size || 30"
        :style="`left: ${index * 25}px`"
        class="overlapping absolute"
        v-show="isUserInCard(id)"
      />
      <q-avatar
        :size="(size || 30) + 'px'"
        text-color="blue-grey-9"
        key="settings"
        color="blue-grey-2"
        class="overlapping absolute cursor-pointer"
        icon="settings"
        :style="`left: ${Object.keys(members).length * 25 + 5}px`"
      >
        <q-menu
          class="overflow-hidden"
          transition-show="flip-right"
          transition-hide="flip-left"
        >
          <membersAdd />
        </q-menu>
      </q-avatar>
    </transition-group>
  </div>
</template>
<script setup>
import { useListsStore } from "src/stores/lists";
import { useProjectStore } from "src/stores/Project";
import { computed } from "vue";
import memberBubble from "./memberBubble.vue";
import membersAdd from "./membersAdd.vue";
const props = defineProps(["members", "size"]);
const members = computed(() => props.members || card.value.members || {});
const list = useProjectStore().members;
const card = computed(() => useListsStore().selectedCard);
function isUserInCard(id) {
  if (members.value?.[id]) {
    return "check";
  }
  return "";
}
</script>
<style lang="sass" scoped>
.list-move,
.list-enter-active,
.list-leave-active
  transition: all 0.5s ease
.overlapping:hover
  transform: scale(1.1)
/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active
  position: absolute
</style>
