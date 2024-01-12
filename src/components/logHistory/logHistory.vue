<template>
        <q-item-section v-if="isObject(value)">
            <div v-for="(v, k, i) of value" :key="i">
                <div v-if="isObject(v)">
                    <span>{{ k }}:</span>
                    <log-history :value="v" />
                </div>
                <div v-else>
                    <span>{{ k }}: {{ v }}</span>
                </div>
            </div>
        </q-item-section>
        <q-item-section v-else>
            <span>{{ value }}</span>
        </q-item-section>
</template>

<script setup>
import { defineProps } from 'vue';

const isObject = (value) => typeof value === 'object' && value !== null;

// define the component props
const props = defineProps({
    value: {
        type: Object,
        required: true,
    },
});
</script>
