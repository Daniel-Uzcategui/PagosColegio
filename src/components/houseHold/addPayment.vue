<template>
  <q-dialog maximized full-width @update:model-value="emits('update:showDialog')" :model-value="showDialog">
    <q-card>
      <q-btn class="absolute-top-right" style="z-index: 99999;" dense flat icon="close" @click="emits('update:showDialog', false)">
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      <q-card-section>
        <div class="text-h6">Añadir pago</div>
      </q-card-section>
      <q-card-section>
        <q-btn @click="overrideBCV" class="full-width" color="primary" icon="payments" no-caps>&nbsp; Tasa 1$ = {{ tasaBCV.rateValue }}Bs
        <q-inner-loading :showing="loadingTasa">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        </q-btn>
        <div v-if="motivoCambio.length" class="bg-red text-white text-h5 text-center">
          <p class="text-bold">Motivo de cambio de Tasa BCV para revisión:</p>
          {{ motivoCambio }}
        </div>
        <div class="full-width text-center text-bold text-h6">Total que se debe: $ {{ totalOwed.toFixed(2) }}</div>
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
          <q-select v-model="payment.Tipo" :options="options" label="Tipo" filled />
            <q-date
            title="Fecha de Pago"
            mask="M/D/YYYY"
              v-model="fechaPago"
              landscape
            />
          <q-input v-model="payment.Referencia" :rules="[(value) => value !== '' || 'Referencia no puede estar vacía']" label="Referencia" type="text" />
          <q-btn label="Submit" type="submit" color="primary" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, toRef, computed, watch } from 'vue';
import { runTransaction, doc, addDoc, collection, getDocs, query, where, Timestamp, serverTimestamp, collectionGroup } from 'firebase/firestore';
import { db } from 'src/boot/vuefire';
import {generateReceiptLines} from './printFunctions.js'
import { Money3Component } from 'v-money3'
import { Notify } from 'quasar';
import {useQuasar} from 'quasar'
import { useCuotaStore } from 'src/stores/Cuotas';
import { useUsersStore } from 'src/stores/User'; 
const getBCV = useCuotaStore().getBCV
const userStore = useUsersStore()
const $q = useQuasar()
const options = ['Punto de venta', 'Efectivo $', 'Efectivo BS', 'Zelle', 'Pago Movil', 'Transferencia', 'Otros']
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
  houseHold: {
    type: Object,
    required: true,
  },
  students: {
    type: Array,
    required: true,
  },
  selectedCuotas: {
    type: Array,
    required: true,
  },
});
const houseHoldRef = toRef(props, 'houseHold')
const MontoTotal = ref(0)
const paymentAmounts = ref({});
const payment = ref({
  fechaPago: '',
  Referencia: '',
  Tipo: 'Punto de venta'
});
const fechaPago = computed({ get:() => payment.value.fechaPago?.toDate?.().toLocaleDateString('en-US') || new Date().toLocaleDateString('en-US'), set: (e) => {
  payment.value.fechaPago = Timestamp.fromDate(new Date(e))}})
const totalOwed = ref(0);
const MontoTotalBS = ref(0);
onMounted(async () => {
  for (const cuota of props.selectedCuotas) {
      totalOwed.value += cuota.RemainingAmountDue;
    }
});

async function submitForm() {
  try {
    let allPayments =  []
    if (tasaBCV.value.gotvalue === false) {
      throw {message: 'Tasa BCV no cargada porfavor verificar conexión a internet'}
    }
    // Sort the selected cuotas by their Periodo.from field in ascending order
    if (await isReferenciaNotUnique(payment.value.Referencia)) {
      throw {message: 'La referencia ya existe'}
    }
    const sortedCuotas = [...props.selectedCuotas].sort((a, b) =>
      a.Periodo.from.toDate().getTime() - b.Periodo.from.toDate().getTime()
    );

    // Pay the older cuotas in full first
    let remainingPaymentAmount = MontoTotal.value;
    for (const cuota of sortedCuotas) {
      const remainingAmountDue = cuota.RemainingAmountDue;
      if (remainingPaymentAmount >= remainingAmountDue) {
        paymentAmounts.value[cuota.id] = remainingAmountDue;
        remainingPaymentAmount -= remainingAmountDue;
      } else {
        paymentAmounts.value[cuota.id] = remainingPaymentAmount;
        remainingPaymentAmount = 0;
        break;
      }
    }

    // Rest of the submitForm function code...
    for (const cuota of props.selectedCuotas) {
      const paymentAmount = paymentAmounts.value[cuota.id];
      if (paymentAmount) {
        const cuotaPaymentRef = doc(
          db,
          `students/${cuota.Student.id}/cuota_payments`,
          cuota.id
        );
        let updatedRemainingAmountDue;
        await runTransaction(db, async (transaction) => {
          const cuotaPaymentSnap = await transaction.get(cuotaPaymentRef);
          if (cuotaPaymentSnap.exists()) {
            const totalPaid =
              (cuotaPaymentSnap.data().TotalPaid || 0) + paymentAmount;
            updatedRemainingAmountDue = cuota.Monto - totalPaid;
            transaction.update(cuotaPaymentRef, {
              TotalPaid: totalPaid,
              RemainingAmountDue: updatedRemainingAmountDue,
              lastUpdate: serverTimestamp()
            });
          }
        });
        const paymentData = {
            ...payment.value,
            cuotaInfo: {...cuota, id: cuota.id, student: {...cuota.Student, id: cuota.Student.id}, RemainingAmountDue: updatedRemainingAmountDue},
            Monto: paymentAmount,
            dateIn: serverTimestamp(),
            fechaPago: new Date(fechaPago.value),
            TasaBCV: tasaBCV.value.rateValue,
            cajaUser: userStore.currentUserDoc,
            MontoTotalBS: parseFloat((paymentAmount * tasaBCV.value.rateValue).toFixed(2)),
            ...(motivoCambio.value.length > 0 ? {Motivo: motivoCambio.value} : {})
          }
          allPayments.push(paymentData)
        await addDoc(
          collection(db, `houseHolds/${houseHoldRef.value.id}/payments`),
          paymentData
        );
      }
    }
    paymentAmounts.value = {};
    payment.value = {
      fechaPago: '',
      Referencia: '',
      Tipo: 'Punto de venta'
    };

    // Call the createReceipt function to generate a receipt

    
    // Emit the submitted event and pass the receipt data
    emits('submitted', allPayments);
    emits('update:showDialog', false);
    await generateReceiptLines(allPayments, houseHoldRef.value)
    return Notify.create({message: `Pago por $${MontoTotal.value}, registrado`, color:'green'})
  } catch (error) {
    console.error(error);
    Notify.create({message: error.message, color:'red'})
  }
}
async function isReferenciaNotUnique(referencia) {
  const paymentsRef = collectionGroup(db, 'payments');
  const q = query(paymentsRef, where('Referencia', '==', referencia));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
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
onMounted(()=> {
  setTasa()
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
      tasaBCV.value = { rateValue: newValue, currency: 'Bs', gotvalue: true }
      Notify.create({message: `Nuevo Valor asignado al dólar: 1$ = ${newValue} BS`, color: 'orange'})
  })
  })
}
watch(MontoTotal, (newValue) => {
  if (!reverseBs.value) {
    MontoTotalBS.value = parseFloat((newValue * tasaBCV.value.rateValue).toFixed(2));
  }
});

watch(MontoTotalBS, (newValue) => {
  if (reverseBs.value) {
    MontoTotal.value = parseFloat((newValue / tasaBCV.value.rateValue).toFixed(2));
  }
});
</script>
