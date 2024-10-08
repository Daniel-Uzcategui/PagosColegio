<template>
  <q-dialog maximized full-width @update:model-value="emits('update:showDialog')" :model-value="showDialog">
    <q-card>
      <q-toolbar class="bg-primary text-white" :class="[{'bg-green-8': student.help}]" >
        <q-btn flat round dense icon="assignment_ind" />
        <q-toolbar-title>
          {{ student.help ? 'Estudiante ayuda' : 'Añadir pago' }}
        </q-toolbar-title>

        <q-btn  style="z-index: 99999;" dense flat icon="close" @click="emits('update:showDialog', false)">
              <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
      </q-toolbar>

      <q-card-section>
      {{ student.Nombre }} {{ student.Apellido }}
      {{ student._id }}

      </q-card-section>
      <q-card-section>
        <q-btn @click="overrideBCV" class="full-width" color="primary" icon="payments" no-caps>&nbsp; Tasa 1$ = {{ overridenBCV?.rateValue || tasaBCV.rateValue }}Bs
        <q-inner-loading :showing="loadingTasa">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        </q-btn>
        <div v-if="motivoCambio.length" class="bg-red text-white text-h5 text-center">
          <p class="text-bold">Motivo de cambio de Tasa BCV:</p>
          {{ motivoCambio }}
        </div>
        <div class="full-width text-center text-bold text-h6"><span v-if="credit">Subtotal</span> <span v-else>  Total </span> que se debe: $ {{ totalOwed.toFixed(2) }}</div>
        <div  v-if="credit" class="full-width text-center text-bold text-h6">
          <div v-if="credit > 0">
            Abonado anteriormente por el estudiante (Credit): ${{ credit.toFixed(2) }}
          </div>
          <div class="bg-red text-white" v-if="credit < 0">
            El estudiante tiene crédito negativo, resultado de utilizar su crédito y luego revertida la transacción que le abonó el crédito, reversar su transacción de crédito para continuar: ${{ credit.toFixed(2) }}
          </div>
        </div>
        <q-form @submit="submitForm">
          <div class="column items-center" :class="[{'reverse': reverseBs}]">
            <q-field :readonly="reverseBs" filled class="full-width" v-model="MontoTotal" label="Monto de importe en $ Dólares">
                <template
                v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
                >
                <Money3Component
                    :id="id"
                    :readonly="reverseBs"
                    class="q-field__input text-right"
                    v-bind="moneyFormatForDirective"
                    :model-value="modelValue"
                    @update:model-value="e => emitValue(parseFloat(e))"
                    v-show="floatingLabel"
                />
              </template>
            </q-field>
              <q-btn color="primary" icon="sync_alt" style="transform: rotate(90deg);" flat @click="reverseBs=!reverseBs" />
            <q-field :readonly="!reverseBs" class="full-width" filled v-model="MontoTotalBS" label="Monto de importe en BS">
                <template
                v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
                >
                <Money3Component
                    :id="id"
                    :readonly="!reverseBs"
                    class="q-field__input text-right"
                    v-bind="moneyFormatForDirective"
                    :model-value="modelValue"
                    @update:model-value="e => emitValue(parseFloat(e))"
                    v-show="floatingLabel"
                />
              </template>
            </q-field>
          </div>
          <div class="column">
            <q-select v-model="payment.Tipo" :options="options" emit-value label="Tipo"  filled />
            <q-date
            title="Fecha de Pago"
            mask="M/D/YYYY"
            v-model="fechaPago"
            landscape
            />
            <div v-if="inputType && inputType !== 'Otros'">
                <q-input
                    v-if="inputType !== 'moneyBills'"
                    :type="inputType"
                    v-model="payment.Referencia"
                    :rules="referenceRules"
                    label="Referencia"
                  />
                  <moneyBills
                    v-else
                    v-model="payment.Referencia"
                    :rules="referenceRules"
                  />
            </div>
            <div v-if="inputType === 'Otros'">
              <q-input
                    v-if="inputType !== 'moneyBills'"
                    type="text"
                    v-model="payment.Referencia"
                    :rules="[(value) => (value !== '' && value.length > 6) || 'Referencia no puede estar vacía y ser de 6 caracteres']"
                    label="Referencia"
                  />
            </div>
            <div class="q-ma-md">
              <q-btn  label="Guardar" type="submit" color="secondary" />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, toRef, computed, watch } from 'vue';
// import { generateReceiptLines } from './printFunctions.js'
import moneyBills from 'src/components/payments/moneyBills.vue'
import { Money3Component } from 'v-money3'
import { Notify } from 'quasar';
import { useQuasar } from 'quasar'
import { useCuotaStore } from 'src/stores/Cuotas';
import { usePaymentStore } from 'src/stores/Payments';
import { api } from 'src/boot/axios';
const credit = ref(0)
const paymentStore = usePaymentStore();
const getBCV = useCuotaStore().getBCV
const overridenBCV = ref()
const $q = useQuasar()

const inputType = computed(() => {
  if (payment.value.Tipo === 'Zelle') {
    return 'text';
  } else if (!['Efectivo $', 'Otros', 'Credit', 'Efectivo BS'].includes(payment.value.Tipo)) {
    return 'number';
  } else if (payment.value.Tipo === 'Efectivo $') {
    return 'moneyBills';
  } else if (payment.value.Tipo === 'Otros') {
    return 'Otros';
  } else {
    return false
  }
});

const referenceRules = computed(() => [
  (value) => (value !== '' && value.length === 6) || 'Referencia no puede estar vacía y ser de 6 caracteres'
]);
const options = [
  { value: 'Tarjeta Débito', label: 'Tarjeta Débito' },
  { value: 'Tarjeta Crédito', label: 'Tarjeta Crédito' },
  { value: 'Efectivo $', label: 'Efectivo $' },
  { value: 'Efectivo BS', label: 'Efectivo BS' },
  { value: 'Zelle', label: 'Zelle' },
  { value: 'Pago Movil', label: 'Pago Movil' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Credit', label: 'Credit (Abono de estudiante)' },
  { value: 'Otros', label: 'Otros' }
];
const moneyFormatForDirective = {
number: true,
decimal: '.',
thousands: ',',
precision: 2,
masked: false /* doesn't work with directive */
}
const reverseBs = ref(false)
const emits = defineEmits(['update:showDialog', 'submitted'])
const props = defineProps({
showDialog: {
type: Boolean,
required: true,
},
studentRef: {
type: Object,
required: true,
},
selectedCuotas: {
type: Array,
required: true,
},
});
const student = toRef(props, 'studentRef')
const MontoTotal = ref(0)
const paymentAmounts = ref({});
const payment = ref({
fechaPago: new Date().toLocaleDateString('en-US'),
Referencia: '',
Tipo: 'Tarjeta Débito'
});
const fechaPago = computed({ get:() => payment.value.fechaPago, set: (e) => {
payment.value.fechaPago = e}})
const totalOwed = ref(0);
const MontoTotalBS = ref(0);
onMounted(async () => {
for (const cuota of props.selectedCuotas) {
totalOwed.value += cuota.RemainingAmountDue;
}
});
async function submitForm() {
    try {
      if (credit.value < 0) {
        throw {message: 'El estudiante utilizó crédito asignado a el de una transacción revertida, porfavor revertir su transacción realizada ocn crédito para proceder.'}
      }
      if ( (overridenBCV.value?.gotvalue || tasaBCV.value.gotvalue) === false) {
      throw {message: 'Tasa BCV no cargada porfavor verificar conexión a internet o coloque un valor'}
      }
      // Sort the selected cuotas by their Periodo.from field in ascending order
      if (inputType.value != false && await isReferenciaNotUnique(payment.value.Referencia)) {
      throw {message: 'La referencia ya existe'}
      }
        // Prepare the data to be sent to the server
        const data = {
            tasaBCV: overridenBCV.value || tasaBCV.value,
            payment: payment.value,
            MontoTotal: MontoTotal.value,
            fechaPago: fechaPago.value,
            motivoCambio: motivoCambio.value.length > 0 ? motivoCambio.value : null,
            selectedCuotas: props.selectedCuotas,
            studentId: student.value._id
        };
        // Send a POST request to the server with the data
        const response = await paymentStore.addStudentPayment(student.value._id, data)
        // const response = await api.post('/students/${student.value._id}/payments`, data);

        // Check the response
        if (response.success) {
            // Reset the form
            paymentAmounts.value = {};
            payment.value = {
                fechaPago: '',
                Referencia: '',
                Tipo: 'Tarjeta Crédito'
            };

            // Emit the submitted event and pass the receipt data
            emits('submitted', response.updatedCuotaPayments);
            emits('update:showDialog', false);

            // Return a success notification
            return Notify.create({message: `Pago por $${MontoTotal.value}, registrado`, color:'green'});
        } else {
            // Return an error notification
            console.log(response)
            throw {message: response.message};
        }
    } catch (error) {
        console.log({error});
        Notify.create({message: error.message, color:'red'});
    }
}

async function isReferenciaNotUnique(referencia) {
const response = await api.get(`/payments?referencia=${referencia}`); // Use axios to make a GET request to your API
return response.data.length > 0;
}
const tasaBCV = ref({ rateValue: 0, currency: 'Bs', gotvalue: false })
const motivoCambio = ref('')
const loadingTasa = ref(false)
async function setTasa() {
try {
loadingTasa.value = true
const rateValue = await getBCV().catch(e => console.error('error fetching data ratesApi', { e }))
console.log({rateValue})
tasaBCV.value = { rateValue, currency: 'Bs', gotvalue: true }
} catch (error) {
Notify.create({message:"Falla en conexión con el banco central, verificar conexión a internet", color: 'red'})
} finally {
loadingTasa.value = false
}
}
onMounted(async ()=> {
setTasa()
const res = await api.get('/students/'+ student.value._id)
credit.value = res.data.credit
})
function overrideBCV() {
    $q.dialog({
        prompt: {
            model: '',
            type: 'text',
            isValid: val => val.length > 5 // optional
        },
        cancel: true,
        persistent: true,
        message: "Sobreescribir el valor dólar BCV, porfavor indicar el motivo"
    }).onOk((motivo) => {
        $q.dialog({
            prompt: {
                model: 0,
                type: 'number', // optional
                isValid: val => typeof parseFloat(val) === 'number' && !isNaN(parseFloat(val)),
            },
            cancel: true,
            persistent: true,
            message: "Indicar el valor $ en BS"
        }).onOk((value) => {
            const newValue = parseFloat((parseFloat(value)).toFixed(2))
            motivoCambio.value = motivo
            overridenBCV.value = {
                rateValue: newValue,
                currency: 'Bs',
                gotvalue: true
            }
            Notify.create({
                message: `Nuevo Valor asignado al dólar: 1$ = ${newValue} BS`,
                color: 'orange'
            })
        })
    })
}
watch(MontoTotal, (newValue) => {
if (!reverseBs.value) {
MontoTotalBS.value = parseFloat((newValue * (overridenBCV.value?.rateValue ||tasaBCV.value.rateValue)).toFixed(2));
}
});

watch(MontoTotalBS, (newValue) => {
if (reverseBs.value) {
  MontoTotal.value = parseFloat((newValue / (overridenBCV.value?.rateValue || tasaBCV.value.rateValue)).toFixed(2));
}
});
</script>

