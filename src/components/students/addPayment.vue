<template>
  <q-dialog :model-value="modelRef" @hide="$emit('update:modelValue', false)">
    <q-card>
      <q-form
        @submit="onSubmit"
        class="q-pa-md"
      >
        <q-select v-model="Tipo" :options="options" label="Tipo" filled />
        <q-field
            filled
            v-model="Monto"
            label="Monto"
            hint="$ #,###.00 #"
            >
            <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                <input :id="id" class="q-field__input text-right" :value="modelValue" @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective" v-show="floatingLabel">
            </template>
            </q-field>
        <q-input v-model="Referencia" type="text" label="Referencia" />
        <div>
            <q-btn label="Submit" type="submit" color="primary"/>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { toRef, ref } from 'vue';
const moneyFormatForDirective = {
  decimal: '.',
  thousands: ',',
  prefix: '$ ',
  suffix: ' #',
  precision: 2,
  masked: false /* doesn't work with directive */
}
const options = ['Punto de venta', 'Efectivo $', 'Efectivo BS', 'Zelle', 'Otros' ]
const props = defineProps(['modelValue', 'student'])
const modelRef = toRef(props, 'modelValue')
const studentRef = toRef(props, 'student')
const Tipo = ref()
const Monto = ref()
const Referencia = ref()
</script>