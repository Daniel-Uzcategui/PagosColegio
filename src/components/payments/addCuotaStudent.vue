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
import { toRef, ref, watch } from 'vue';
import { useCuotaStore } from 'src/stores/Cuotas.js';
import { useQuasar } from 'quasar'
const $q = useQuasar()
const cuotaStore = useCuotaStore()
const props = defineProps(['modelValue', 'editCuota', 'studentRef', 'houseHold', 'cuotaRef'])
const cuotaRef = toRef(props, 'cuotaRef')
const emits = defineEmits(['update:modelValue', 'updatedOrCreated', 'hide'])
const Periodo = ref()
const Monto = ref(0)
const Alias = ref('')
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
    let today = new Date()
    let periodo = { from: dateFromPeriodo(Periodo.value.from), to: dateFromPeriodo(Periodo.value.to)}
    const Discount = props.studentRef.Discount || 1
    const monto = parseFloat((Monto.value * Discount).toFixed(2))
      await cuotaStore.addStudentCuota({
          cuotaDefault: {
            Periodo: periodo,
          Monto: Monto.value,
          dateIn: today,
          Alias: Alias.value,
          },
          Periodo: periodo,
          Monto: monto,
          dateIn: today,
          lastModified: today,
          Alias: Alias.value,
          RemainingAmountDue: monto,
          studentId: props.studentRef._id,
          totalPaid: 0,
          Discount
        })
    // }
  } catch (error) {
    console.error(error)
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
        try {
          await deleteDoc(doc(collection(db, `students/${props.studentRef._id}/cuota_payments`),  cuotaRef.value._id)).then(() => $q.notify("cuota eliminada"))
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

</script>