<template>
    <q-dialog v-model:show="showing">
      <q-date v-model="date" @input="onInput" />
    </q-dialog>
  </template>
  
  <script>
  export default {
    props: ['modelValue'],
    data() {
      return {
        date: this.modelValue,
        showing: false,
      };
    },
    watch: {
      modelValue(value) {
        this.date = value;
      },
    },
    methods: {
      show() {
        this.showing = true;
      },
      hide() {
        this.showing = false;
      },
      onInput(value) {
        this.$emit('update:modelValue', value);
        this.hide();
      },
    },
  };
  </script>
  