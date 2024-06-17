<template>
<q-page padding>
    <q-btn label="Imprimir" color="red" icon-right="print" @click="printReceipt" />
    <q-btn label="Impresión térmica" color="red" icon-right="print" @click="sendToPrinter" />
    <q-btn label="Impresión Probar" color="red" icon-right="print" @click="sendToPrinterTest" />
  <div class="receipt-container">
      <q-card square flat bordered>
        <q-card-section class="row justify-between">
          <div class="col-6 row">
            <img src="../assets/favicon-128x128.png" style="width: 128px; height: 128px;"  alt="">
            <div class="col">
              <div class="text-h6">{{ schoolName }}</div>
              <div class="text-subtitle2">{{ schoolAddress }}</div>
              <div class="text-subtitle2">{{ schoolCode }}</div>
              <div class="text-subtitle2">{{ schoolRIF }}</div>
            </div>
          </div>
          <div>
            <div><strong>RECIBO DE PAGO N°:</strong> {{ receiptNumber }}</div>
            <div><strong>Cajera/o:</strong> {{ userStore.currentUser.name }}</div>
            <div><strong>Fecha:</strong> {{ receiptDate }}</div>
          </div>
        </q-card-section>
  
        <q-separator />
        
        <q-card-section class="row justify-between">
          <div>

            <q-select
              filled
              clearable
              v-model="selectedParent"
              :options="options"
              use-input
              behavior="menu"
              option-value="_id"
              :option-label="parentLabel"
              class="repbutton q-mb-md"
              label="Seleccionar Representante"
              @filter="filterFn"
            />
            <q-btn color="secondary" v-if="selectedParent" class="repbutton q-mb-md" icon="add" label="Editar representante" @click="addParentDialog = !addParentDialog; isUpdating = true" />
            <q-btn color="primary" v-else class="repbutton q-mb-md" icon="add" label="Añadir representante" @click="addParentDialog = !addParentDialog; isUpdating = false" />
            <div class="text-left">
              <div><strong>Nombre y Apellido:</strong> {{ clientName }}</div>
              <q-popup-edit v-model="clientName" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
              <div><strong>Cedula de Identidad:</strong> {{ clientId }}</div>
              
              <q-popup-edit v-model="clientId" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
              
              <div><strong>Telefono:</strong> {{ clientPhone }}</div>
              <q-popup-edit v-model="clientPhone" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
              <div><strong>Domicilio:</strong> {{ clientAddress }}</div>
              
              <q-popup-edit v-model="clientAddress" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
              <div><strong>Correo Electronico:</strong> {{ clientEmail }}</div>
              
              <q-popup-edit v-model="clientEmail" v-slot="scope">
                <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
              </q-popup-edit>
            </div>
          </div>
          <div class="column">
            <div><strong>Alumno:</strong> {{ student.Nombre }} {{ student.Apellido }}</div>
            <div><strong>Cédula:</strong> {{ student.ced }}</div>
            <div><strong>Grado:</strong> {{ yearsByNumber.get(student.Grado) }}</div>
            <div><strong>Sección:</strong> {{ student.Seccion }}</div>
          </div>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section>
          <q-table
            dense
            class="text-bold"
            :rows="paymentStore.selectedPayments"
            row-key="_id"
            :columns="columns"
            >
          <template v-slot:body-cell-cuotasPaidRefs="props">
        <q-td :props="props">
          <q-list separator>
            <q-item>
              <q-item-section>Alias</q-item-section>
              <q-item-section>Pago</q-item-section>
              <q-item-section>Cuota Total</q-item-section>
            </q-item>
            <q-item :class="[{'hidden': !props.row.cuotasPaid[index]}]" v-for="(i,index) in props.value" :key="index" clickable v-ripple>
              <q-item-section >{{i.Alias}}</q-item-section>
              <q-item-section >{{formatCurrency(props.row.cuotasPaid[index])}}</q-item-section>
              <q-item-section >{{formatCurrency(props.row.cuotasPaidRefs[index].Monto)}}</q-item-section>
            </q-item>
          </q-list>
        </q-td>
      </template>
          </q-table>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section>
          <div class="text-right">
            <div><strong>Subtotal:</strong> {{ subtotal }} Bs.</div>
            <div><strong>TOTAL RECIBO:</strong> {{ totalReceipt }} Bs.</div>
          </div>
        </q-card-section>
      </q-card>
  </div>
  <q-dialog v-model="addParentDialog">
    <q-card>
      <q-card-section>
        {{ isUpdating ? 'Editando Representante' : 'Creando Representante'}}
      </q-card-section>
      <q-card-section class="row items-center">
        <q-form @submit="addParent">
        <q-input filled v-model="newParent.Nombre" label="Nombre" />
        <q-input filled v-model="newParent.Apellido" label="Apellido" />
        <q-input filled v-model="newParent.address" label="Dirección" />
        <q-input filled v-model="newParent.ced" label="Cédula de Identidad" />
        <q-input filled v-model="newParent.phone" label="Teléfono" />
        <q-input filled v-model="newParent.email" label="Correo Electrónico" />
        <q-btn :label="isUpdating ? 'Guardar' : 'Agregar'" type="submit" color="primary" />
      </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
    </q-page>
  </template>
  
<script setup>
  import { usePaymentStore } from 'src/stores/Payments.js';
  import { onMounted, ref } from 'vue';
  import {yearsByNumber} from 'src/utils/schoolYear.js'
  import { useUsersStore } from 'src/stores/User';
  import { api } from 'src/boot/axios';
  import { Notify } from 'quasar';
  import { watch } from 'vue';
import axios from 'axios';
  const isUpdating = ref(false);
  const addParentDialog = ref(false)
  const selectedParent = ref(null);
  const options = ref([])
  const parents = ref([])
  const userStore = useUsersStore()
  const paymentStore = usePaymentStore()
  const parentLabel = (parent) => `${parent.Nombre} ${parent.Apellido} ${parent.ced}`;
  const printReceipt = () => {
    if (selectedParent.value == null) {
      Notify.create({message: 'Seleccionar un Representante', color: 'red'})
    } else {
      window.print();

    }
  };
  const student = ref({})

  onMounted(async () => {
    student.value = paymentStore.selectedPayments[0].studentId
    try {
      const response = await api.get('/parents');
      parents.value = response.data;
      if (response.data) {
        addParentDialog.value = false
        Notify.create({message: 'Representante agregado', color: 'green'})
      }
    } catch (error) {
      Notify.create({message: 'Error agregando Representate', color: 'red'})
      console.log(error)
    }
  })
  const newParent = ref({});
const addParent = async () => {
  try {
    let response;
    if (isUpdating.value) {
      response = await api.patch(`/parents/${selectedParent.value._id}`, newParent.value);
      const index = parents.value.findIndex(parent => parent._id === selectedParent.value._id);
      parents.value[index] = response.data;
    } else {
      response = await api.post('/parents', newParent.value);
      parents.value.push(response.data);
    }
    addParentDialog.value = false

    isUpdating.value = false;
  } catch (e) {
    console.error(e);
  }
};


  const columns = [
    { name: 'Referencia', required: true, label: 'Referencia', align: 'left', field: 'Referencia', sortable: true },
    { name: 'TasaBCV', required: true, label: 'BCV', align: 'right', field: 'TasaBCV', sortable: true },
    { name: 'Tipo', required: true, label: 'Tipo', align: 'left', field: 'Tipo', sortable: true },
    { name: 'cuotasPaidRefs', required: true, label: 'Cuotas', align: 'center', field: row => row.cuotasPaidRefs, sortable: true },
    { name: 'dateIn', required: true, label: 'Fecha de Registro', align: 'left', field: (row) => new Date(row.dateIn).toLocaleDateString(), sortable: true },
    { name: 'fechaPago', required: true, label: 'Fecha de Pago', align: 'left', field: (row) => new Date(row.fechaPago).toLocaleDateString(), sortable: true },
    { name: 'Monto', required: true, label: 'Monto REF', align: 'right', field: 'Monto', sortable: true },
    { name: 'MontoTotalBs', required: true, label: 'Monto Bs', align: 'right', field: row=>formatCurrency(row.MontoTotalBS), sortable: true },
  ];

  const filterFn = (val, update) => {
    if (val === '') {
      update(() => {
        options.value = parents.value
      })
      return
    }
    update(() => {
      const needle = val
      options.value = parents.value.filter(v => v.ced.indexOf(needle) > -1)
    })
  };
  const schoolName = ref('Unidad Educativa Instituto Cecilio Acosta');
  const schoolAddress = ref('Calle Segunda de Propatria, Casa Cecilio Acosta, N°18, Urb. Propatria, Catia Caracas - Venezuela');
  const schoolCode = ref('Codigo MOA-D:517620105');
  const schoolRIF = ref('RIF.: J-00088482-0');
  const clientName = ref('');
  const clientId = ref('');
  const clientPhone = ref('');
  const clientAddress = ref('');
  const clientEmail = ref('');
  const receiptNumber = ref(generateReceiptNumber());
  const receiptDate = ref((new Date()).toLocaleString());
  const subtotal = paymentStore.selectedPayments.reduce((total, payment) => total + payment.MontoTotalBS, 0);
  const totalRef = paymentStore.selectedPayments.reduce((total, payment) => total + payment.Monto, 0);
  const totalReceipt = paymentStore.selectedPayments.reduce((total, payment) => total + payment.MontoTotalBS, 0);
  const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'NA';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed in JS
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const receiptNumber = `REC-${year}${month}${day}-${hours}${minutes}${seconds}`;
    return receiptNumber;
}
watch(selectedParent, (newVal) => {
  if (newVal) {
    clientName.value = newVal.Nombre;
    clientId.value = newVal.ced;
    clientPhone.value = newVal.phone;
    clientAddress.value = newVal.address;
    clientEmail.value = newVal.email;
    newParent.value = newVal
  }
});
async function sendToPrinter() {
  try {
    const payload = {
      rep: selectedParent.value,
      student: student.value,
      payments: paymentStore.selectedPayments,
      receipt: receiptNumber.value,
      fecha: new Date(),
      cajero: userStore.currentUser.name,
      schoolName: schoolName.value,
      schoolAddress: schoolAddress.value,
      schoolCode: schoolCode.value,
      schoolRIF: schoolRIF.value,
      totalReceipt: totalReceipt,
      totalRef: totalRef
    }
    await axios.post('http://localhost:4000/print', 
      payload
    )
    
  } catch (error) {
    Notify.create({message: 'Error conexión con la impresora ' +error, color:'red'})
  }


}
async function sendToPrinterTest() {
  try {
    await axios.get('http://localhost:4000/test')
  } catch (error) {
    Notify.create({message: 'Error conexión con la impresora ' +error, color:'red'})
  }


}
</script>
<style>
@media print {
  body * {
    visibility: hidden;
  }
  .receipt-container, .receipt-container * {
    visibility: visible;
  }
  .repbutton {
    display: none;
  }
  .receipt-container {
    width: 100%;
    position: absolute !important;
    left: 50% !important;
    top: 0 !important;
    transform: translateX(-50%);
  }
}
</style>


