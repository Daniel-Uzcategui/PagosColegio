<template>
<q-dialog full-width :model-value="modelRef" @hide="$emit('update:modelValue', false)">
  <q-card>
    <q-form @submit="onSubmit" class="q-pa-md">
      <q-select v-model="Tipo" :options="options" label="Tipo" filled />
      <q-input v-model="Referencia" type="text" label="Referencia" />
      <q-field filled v-model="Monto" label="Monto total abonado" :hint="montoHint">
        <template
          v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
        >
          <Money3Component
            :id="id"
            class="q-field__input text-right"
            v-bind="moneyFormatForDirective"
            :model-value="modelValue"
            @update:model-value="e => emitValue(e)"
            v-show="floatingLabel"
          />
        </template>
      </q-field>
      <div v-for="cuota in selectedCuotas" :key="cuota.id">
        <q-field
          filled
          v-model="cuotaAmounts[cuota.id]"
          :label="`Monto para cuota ${cuota.Periodo.from.toDate().toLocaleDateString('es-MX')}`"
          :hint="'Monto en dólares que se debe $' +  (cuota.Monto - getTotalPayments(cuota))"
          :rules="[ val => val <= (cuota.Monto - getTotalPayments(cuota)) || 'El valor asignado a la cuota no debe ser mayor a lo que se debe' ]"
        >
          <template
            v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
          >
            <Money3Component
              :id="id"
              class="q-field__input text-right"
              v-bind="moneyFormatForDirective"
              :model-value="modelValue"
              @update:model-value="e => emitValue(e)"
              v-show="floatingLabel"
            />
          </template>
        </q-field>
      </div>
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn
          label="Reset"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>
  </q-card>
</q-dialog>
</template>
<script setup>
import { Money3Component } from 'v-money3'
import { toRef, ref, computed } from 'vue';
import { collection, doc, addDoc, serverTimestamp, getDocs, query, where, collectionGroup } from 'firebase/firestore';
import { db } from 'src/boot/vuefire';
import { Notify } from 'quasar';
const options = ['Punto de venta', 'Efectivo $', 'Efectivo BS', 'Zelle', 'Otros']
const props = defineProps(['modelValue', 'student', 'selectedCuota', 'payments'])
const selectedCuotas = toRef(props, 'selectedCuota')
const emits = defineEmits(['update:modelValue'])
const modelRef = toRef(props, 'modelValue')
const studentRef = toRef(props, 'student')
const Tipo = ref()

const Referencia = ref()
const cuotaAmounts = ref({});
const moneyFormatForDirective = {
  number: true,
  decimal: '.',
  thousands: ',',
  precision: 2,
  masked: false /* doesn't work with directive */
}
const Monto = ref(0);
// In addPayment.vue
const paymentsRef = toRef(props, 'payments')

function getTotalPayments(cuota) {
  // Filter the payments array for payments with a matching CuotaId
  const cuotaPayments = paymentsRef.value.filter(payment => payment.CuotaId === cuota.id);

  // Calculate the total amount of payments for the cuota
  let totalPayments = 0;
  cuotaPayments.forEach(payment => {
      totalPayments += payment.Monto;
  });

  return totalPayments;
}


const montoHint = computed(() => {
  if (selectedCuotas.value.length === 0) {
      return 'Select a cuota';
  } else if (selectedCuotas.value.length === 1) {
      const cuota = selectedCuotas.value[0];
      const amountOwed = cuota.Monto - getTotalPayments(cuota);
      return `Monto que se debe: $${amountOwed}`;
  } else {
    let totalAmountOwed = 0;
  for (const cuota of selectedCuotas.value) {
    totalAmountOwed += cuota.Monto - getTotalPayments(cuota);
  }
  return `Monto total adeudado: $${totalAmountOwed}`;

  }
});
async function onSubmit() {
  try {
      // Check if a payment with the same Referencia value already exists
      const paymentsRef = collectionGroup(db, "payments");
      const existingPayment = await getDocs(query(paymentsRef, where("Referencia", "==", Referencia.value)));
      if (!existingPayment.empty) {
          // A payment with the same Referencia value already exists
          Notify.create({
              message: "Ya existe un pago con esta referencia",
              color: "red",
          });
          return;
      }

      // Validate that the Monto value does not exceed the amount owed for each selected cuota
      let totalAmountOwed = 0;
      for (const cuota of selectedCuotas.value) {
          totalAmountOwed += cuota.Monto - getTotalPayments(cuota);
      }
      if (Monto.value > totalAmountOwed) {
          Notify.create({
              message: `El monto ingresado excede el monto total adeudado de $${totalAmountOwed}`,
              color: "red",
          });
          return;
      }

      // Add a new payment for each selected cuota and parent
      const batch = writeBatch(db);
      for (const cuota of selectedCuotas.value) {
        for (const padre of studentRef.value.Padres) {
          batch.set(doc(collection(db, `parents/${padre}/payments`)), {
            Tipo: Tipo.value,
            Monto: parseFloat(Monto.value) / selectedCuotas.value.length,
            CuotaId: cuota.id,
            Referencia: Referencia.value,
            dateIn: serverTimestamp(),
          });
        }
      }
      await batch.commit();

      Notify.create({
          message: "Pagos añadidos",
          color: "green"
      });
      emits("update:modelValue", false);
  } catch (error) {
      console.error(error);
      Notify.create({
          message: "error añadiendo los pagos, verifique los datos",
          color: "red",
      });
  }
}
</script>
