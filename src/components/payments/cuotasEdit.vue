<template>
    <q-dialog @hide="$emit('hide'); reset()" full-width :model-value="modelValue"
    @update:model-value="(e) => $emit('update:modelValue', e)">
    <q-card class="full-width">
      <div v-if="cuotaRef" class="text-center text-bold">
        {{ cuotaRef.Periodo.from ? 'Editando cuota: ' + cuotaRef.Periodo.from.toDate().toLocaleDateString("es-MX") : '' }}

      </div>
        <q-form
          @submit="onSubmit"
          class="q-gutter-md column items-center"
        >
          <q-date
            v-model="Periodo"
            mask="MM/DD/YYYY"
            range
            minimal
          />
          <q-input v-model.number="Monto" type="number" label="Monto" />
          <q-select style="min-width: 30%;" v-model="Tipo" :options="options" label="Tipo" filled />
          <div>
            <q-btn label="Submit" type="submit" color="primary"/>
            <!-- <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" /> -->
          </div>
        </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, toRef, watch } from 'vue';
import { useCuotaStore } from 'src/stores/Cuotas.js';
import { useQuasar } from 'quasar'
const $q = useQuasar()
const cuotaStore = useCuotaStore()
const props = defineProps(['modelValue', 'editCuota'])
const cuotaRef = toRef(props, 'editCuota')
defineEmits(['update:modelValue'])
const options = ['A', 'B', 'C', 'D']
const Periodo = ref()
const Monto = ref()
const Tipo = ref()
function reset () {
  Periodo.value = undefined
  Monto.value = undefined
  Tipo.value = undefined
}
function dateFromPeriodo (string) {
  let mm = string.slice(0,2)
  let dd = string.slice(3,5)
  let yy = string.slice(6,10)
  return new Date(yy,mm -1,dd)
}
async function onSubmit() {
  try {
    let periodo = { from: dateFromPeriodo(Periodo.value.from), to: dateFromPeriodo(Periodo.value.to)}
    if(props.editCuota?.id) {
      await cuotaStore.set({
        id: props.editCuota.id,
        Periodo: periodo,
        Monto: Monto.value,
        lastChange: new Date(),
        Tipo: Tipo.value
      })
    } else {
      await cuotaStore.add({
          Periodo: periodo,
          Monto: Monto.value,
          Tipo: Tipo.value,
          addedIn: new Date(),
        })
    }
  } catch (error) {
    return $q.notify("Error al crear o editar la cuota")
  }
  return $q.notify(props.editCuota?.id ? "Cuota Editada" :"Cuota Creada")
}
watch(cuotaRef, ()=> {
  let cuota = cuotaRef.value
  if(cuota) {
     Periodo.value = {from: cuota.Periodo.from.toDate().toLocaleDateString('en-US', {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}), to: cuota.Periodo.to.toDate().toLocaleDateString('en-US', {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})}
     Monto.value = cuota.Monto
     Tipo.value = cuota.Tipo
  }
  console.log(Periodo.value)
})
</script>