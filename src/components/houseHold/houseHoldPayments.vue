<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)" maximized>
      <div class="bg-white">
      <q-toolbar class="bg-primary text-white" :class="[{'bg-green-8': studentRef.help}]">
        <q-btn flat round dense icon="assignment_ind" />
        <q-toolbar-title>
          {{ studentRef.help ? 'Estudiante ayuda' : 'Cuotas del estudiante' }}
        </q-toolbar-title>
        <q-space />
            <q-btn flat round dense color="white" icon="close" @click="$emit('update:showDialog', false)" />
          </q-toolbar>
      <q-table
        flat bordered
        title="Cuotas del estudiante"
        :rows="cuotas"
        :columns="columns"
        :row-key="row=>row._id"
        >
        <template v-slot:top-right>
          <q-btn-group>
            <q-btn color="primary" label="Fecha límite" icon="calendar_today">
              <q-tooltip class="bg-white text-primary">Fecha límite</q-tooltip>
              <q-popup-proxy ref="popupProxy" transition-show="scale" transition-hide="scale">
                <q-date
                  title="Fecha límite"
                  mask="M/D/YYYY"
                  v-model="fechaPago"
                  landscape
                  @update:model-value="queryCuotas"
                />
              </q-popup-proxy>
            </q-btn>
            <q-btn color="secondary" icon="history" label="Abrir tabla de pagos historicos" @click="openPaymentsTable = !openPaymentsTable" />
            <q-btn color="primary" icon="add" label="Agregar cuota" @click="addCuotaDialog = true" />
            <q-btn color="secondary" icon="add" label="Añadir pago" @click="selectTypePayment" />
          </q-btn-group>
        </template>
        <template v-slot:body-cell-Monto="prop">
            <q-td :class="{ 'bg-green text-white': prop.row.RemainingAmountDue=== 0, 'bg-red text-white': prop.row.RemainingAmountDue === prop.row.Monto , 'bg-yellow-10 text-white': prop.row.RemainingAmountDue !== prop.row.Monto && prop.row.RemainingAmountDue > 0}">
                {{ prop.row.RemainingAmountDue?.toFixed(2) }}
            </q-td>
        </template>
        <!-- MontoIn template with proxy popup to edit the amount -->
        <template v-slot:body-cell-MontoIn="prop">
            <q-td>
                <q-btn class="full-width" color="primary" icon="payments" :label="prop.row.Monto?.toFixed(2)" @click="MontoIn=prop.row.Monto;">
                    <q-tooltip class="bg-white text-primary">Editar Monto Inicial</q-tooltip>
                    <q-popup-proxy ref="popupProxy" transition-show="scale" transition-hide="scale">
                        <q-form class="q-ma-md" @submit="confirmUpdateMonto(prop.row._id)">
                            <q-input v-model.number="MontoIn" label="Monto" type="number" />
                            <q-input v-model="Motivo" label="Motivo" />
                            <div class="row">
                                <q-btn label="Borrar" @click="MontoIn=0" type="submit" color="red" />
                                <q-btn label="Guardar" type="submit" color="primary" />
                              </div>
                        </q-form>
                    </q-popup-proxy>
                </q-btn>
            </q-td>
        </template>

        <template v-slot:body-cell-Student="prop">
            <q-td>
                <q-btn color="primary" icon="person" :label="prop.row.Student?.Nombre" @click="studentRefEdit=prop.row.Student;addStudentDialog = true;" />
            </q-td>
        </template>
      </q-table>
      <AddCuotaStudent v-if="addCuotaDialog" :cuotaRef="{}" @updatedOrCreated="submitted=!submitted; emits('submitted')" :selectedCuotas="cuotas" :studentRef="studentRef" v-model="addCuotaDialog" @update:show-dialog="updateAddPaymentDiag" />
      <AddPayment v-if="addPaymentDialog" @submitted="submitted=!submitted; emits('submitted')" :selectedCuotas="cuotasFiltered" :studentRef="studentRef" :show-dialog="addPaymentDialog" @update:show-dialog="updateAddPaymentDiag" />
      <AddStudent v-if="addStudentDialog" v-model:show-dialog="addStudentDialog" @submitted="submitted=!submitted; emits('submitted')" :student="studentRefEdit" />
      <!-- openPaymentsTable dialog with historic payments -->
      <q-dialog
        v-model="openPaymentsTable"
        maximized
        @hide="openPaymentsTable = false"
      >
      <div class="bg-white">
        <q-toolbar class="bg-primary">
          <q-space />
            <q-btn flat round dense color="white" icon="close" @click="openPaymentsTable = false" />
          </q-toolbar>
        <ReportCaja :studentid="studentRef._id" @revert="queryCuotas(fechaPago);emits('submitted')" />

      </div>
      </q-dialog>
    </div>
    </q-dialog>
  </template>
<script setup>
import { onMounted, toRef } from 'vue';
import { ref } from 'vue';
import AddPayment from './addPayment.vue';
import AddStudent from '../students/addStudent.vue';
import AddCuotaStudent from '../payments/addCuotaStudent.vue';
import { useCuotaStore } from 'src/stores/Cuotas';
import ReportCaja from 'src/pages/reportCaja.vue';
import { useQuasar } from 'quasar';
const $q = useQuasar();
const openPaymentsTable = ref(false)
const MontoIn = ref(0)
const Motivo = ref('')
const fechaPago = ref(new Date())
const cuotaStore  = useCuotaStore()
const submitted = ref(false)
const cuotaType = ref(false)
const studentRefEdit = ref()
const addStudentDialog = ref(false)
const addCuotaDialog = ref(false)
const cuotasFiltered = ref()
const props = defineProps({
showDialog: {
type: Boolean,
required: true,
},
studentRef: {
type: Object,
required: true,
},
});
function confirmUpdateMonto(row) {
      this.$q.dialog({
        title: 'Confirmar acción',
        message: MontoIn.value ? `¿Estás seguro de que quieres editar el monto inicial a ${MontoIn.value}?` : '¿Desea eliminar la cuota?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        updateMonto(row)
      })
    }
const emits = defineEmits(['update:showDialog', 'submitted'])

// const houseHoldRef = toRef(props, 'houseHold');
const addPaymentDialog = ref(false);

function updateAddPaymentDiag(value) {
addPaymentDialog.value = value;
}

const cuotas = toRef(cuotaStore, 'list')
// const students = useCollection(query(collection(db, 'students'), where('houseHold', '==', houseHoldRef.value._id)))

// ...
onMounted(async ()=> {
  await queryCuotas(fechaPago.value)
})
// define updateMonto
async function updateMonto(cuotaId) {
  try {
    if (Motivo.value === '') {
      throw new Error('Motivo no puede estar vacío')
    }
    const response = await cuotaStore.updateMontoIn({studentId: props.studentRef._id, Monto: MontoIn.value, Motivo: Motivo.value, _id: cuotaId})
    await queryCuotas(fechaPago.value)
    // if reposnse is succesfull notify user
    if (response) {
      $q.notify({
        message: 'Monto Inicial actualizado exitosamente',
        color: 'positive',
        icon: 'check',
        position: 'top-right', 
        timeout: 3000
      });
    }
  } catch (error) {
    console.error(error)
    if(error.message === 'Motivo no puede estar vacío') {
      $q.notify({
        message: error.message,
        color: 'negative',
        icon: 'report_problem',
        position: 'top-right',
        timeout: 3000
      });
    }
  }
}
async function queryCuotas(date) {
  await cuotaStore.queryCuotas(props.studentRef._id, date, true)
}
function selectTypePayment () {
  $q.dialog({
        title: 'Opciones',
        message: 'Seleccionar que tipo de cuota a pagar',
        options: {
          type: 'radio',
          model: false,
          // inline: true
          items: [
            { label: 'Cuota Regular', value: false, color: 'secondary' },
            { label: 'Cuota especial', value: true },
          ]
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        cuotaType.value = data
        cuotasFiltered.value = cuotas.value.filter(x => {
          if (!data && (x.cuotaDefault.type === undefined || x.cuotaDefault.type === false)) {
            return true
          }
          if (data && x.cuotaDefault.type) {
            return true
          }
        })
        addPaymentDialog.value = true
      })
}
const columns = [
{ type: 'selection', name: 'selected', align: 'center', field: 'selected' },
{ name: 'Alias', label: 'Alias', field: 'Alias', align: 'left', sortable: true },
{ name: 'PeriodoFrom', label: 'Periodo Desde', field: row => toDateLocate(row.Periodo.from), align: 'left', sortable: true },
{ name: 'PeriodoTo', label: 'Periodo Hasta', field: row => toDateLocate(row.Periodo.to), align: 'left', sortable: true },
{ name: 'MontoIn', label: 'Monto Inicial', field: 'Monto', align: 'left', sortable: true },
// define totalPaid
{ name: 'totalPaid', label: 'Total Pagado', field: 'totalPaid', align: 'left', sortable: true },
{ name: 'Monto', label: 'Monto Restante', field: 'RemainingAmountDue', align: 'left', sortable: true },
];

function toDateLocate(date) {
// return date.toLocaleDateString('es-MX');
return date
}
</script>

  