<template>
        <q-field style="min-width: 200px;" :readonly="readonly" filled :model-value="modelValue" @update:model-value="(e)=>$emit('update:modelValue', e)" :label="label || 'Monto'">
            <template
            v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
            >
            <Money3Component
                :id="id"
                :readonly="readonly"
                class="q-field__input text-right"
                v-bind="moneyFormatForDirective"
                :model-value="modelValue"
                @update:model-value="e => emitValue(parseFloat(e))"
                v-show="floatingLabel"
            />
            </template>
        </q-field>
</template>
<script setup>
import { Money3Component } from 'v-money3';
// import { defineProps, defineEmits } from 'vue'
const props = defineProps(['modelValue', 'readonly', 'label'])
defineEmits(['update:modelValue'])
const moneyFormatForDirective = {
number: true,
decimal: '.',
thousands: ',',
precision: 2,
masked: false /* doesn't work with directive */
}
</script>