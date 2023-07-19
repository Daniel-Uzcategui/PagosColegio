<template>
  <div
    class="bordd row justify-center items-center text-white"
    :class="'bg-' + colors[index]"
    :style="'height:' + size + 'px; width:' + size + 'px;'"
  >
    {{ getUserLetters(name) }}
  </div>
</template>
<script setup>
defineProps(["name", "index", "size"]);
const colors = [
  "green",
  "blue",
  "red",
  "purple",
  "orange",
  "pink",
  "brown",
  "yellow",
  "indigo",
  "cyan",
  "teal",
  "light-blue",
];
function getUserLetters(name) {
  let nameSplit = name.split(" ");
  let letter = nameSplit[0].slice(0, 1);
  if (nameSplit.length > 1) {
    letter = letter + nameSplit[1].slice(0, 1);
  }
  return letter;
}
</script>
<style lang="scss">
.bordd {
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid $yellow-7;
}
</style>
