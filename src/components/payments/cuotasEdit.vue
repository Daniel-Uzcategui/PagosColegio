<template>
    <q-dialog @hide="$emit('hide'); reset()" full-width :model-value="modelValue"
    @update:model-value="(e) => $emit('update:modelValue', e)">
    <q-card class="full-width">
      <div v-if="cuotaRef" class="text-center text-bold">
        {{ cuotaRef._id && cuotaRef.Periodo.from ? 'Viendo cuota: ' + cuotaRef.Periodo.from?.toDate?.().toLocaleDateString("es-MX") : 'Creando Cuota' }}

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
            :readonly="cuotaRef._id ? true : false"
          />
          <q-input :readonly="cuotaRef._id ? true : false" v-model="Alias" type="text" label="Alias de la cuota" hint="(El alias ayuda a identificar la cuota(ej: Marzo-Abril))" />
          <q-input :readonly="cuotaRef._id ? true : false" v-model.number="Monto" type="number" label="Monto" />
          <div>
            <q-btn v-if="cuotaRef._id ? false : true" class="q-ma-md" label="Submit" type="submit" color="primary"/>
            <q-btn v-if="cuotaRef._id ? true : false" class="q-ma-md" color="red" icon="delete" label="Borrar" @click="deleteCuota" />
            <!-- <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" /> -->
          </div>
        </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { toRef, watch } from 'vue';
import { useCuotaStore } from 'src/stores/Cuotas.js';
import { useQuasar } from 'quasar'
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from 'src/boot/vuefire';
const $q = useQuasar()
const cuotaStore = useCuotaStore()
const props = defineProps(['modelValue', 'editCuota'])
const cuotaRef = toRef(props, 'editCuota')
const emits = defineEmits(['update:modelValue', 'updatedOrCreated', 'hide'])
const Periodo = toRef(props.editCuota, 'Periodo')
const Monto = toRef(props.editCuota, 'Monto')
const Tipo = toRef(props.editCuota, 'Tipo')
const Alias = toRef(props.editCuota, 'Alias')
function reset () {
  Periodo.value = {
    from: undefined,
    to: undefined
  }
  Monto.value = undefined
  Tipo.value = undefined
  Alias.value = undefined
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
    // if(props.editCuota?._id) {
    //   await cuotaStore.set({
    //     id: props.editCuota._id,
    //     Periodo: periodo,
    //     Monto: Monto.value,
    //     lastChange: new Date(),
    //     Alias: Alias.value
    //   })
    // } 
    // else {
      console.log({
          Periodo: periodo,
          Monto: Monto.value,
          dateIn: new Date(),
          Alias: Alias.value

        })
        
      await cuotaStore.add({
          Periodo: periodo,
          Monto: Monto.value,
          dateIn: new Date(),
          Alias: Alias.value

        })
    // }
  } catch (error) {
    return $q.notify({message: "Error al crear o editar la cuota", color: 'red'})
  }
  return afterSubmit()
}
async function deleteCuota () {
  try {
    return $q.dialog({
        title: 'Confirmar la eliminación de la cuota',
        message: 'Está seguro que quiere elimnarla? Los cambios son irreversibles',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        // console.log('>>>> OK')
        try {
          console.log(cuotaRef.value._id)
          await deleteDoc(doc(collection(db, 'cuotas/'),  cuotaRef.value._id)).then(() => $q.notify("cuota eliminada"))
        } catch (error) {
          $q.notify({message: "Error al eliminar la cuota", color: 'red'})
        } finally {
          emits('update:modelValue')
          emits('updatedOrCreated')
          return
        }
      })
  } catch (error) {
    
  }
}
function afterSubmit () {
  $q.notify(props.editCuota?._id ? "Cuota Editada" :"Cuota Creada")
  emits('update:modelValue')
  emits('updatedOrCreated')
}
watch(cuotaRef, ()=> {
  let cuota = cuotaRef.value
  if(cuota) {
     Periodo.value = {from: cuota.Periodo.from?.toDate().toLocaleDateString('en-US', {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}), to: cuota.Periodo.to?.toDate().toLocaleDateString('en-US', {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})}
     Monto.value = cuota.Monto
     Alias.value = cuota.Alias
  }
  console.log(Periodo.value)
})
</script>