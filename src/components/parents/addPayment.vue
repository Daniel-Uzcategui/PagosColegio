<template>
    <q-dialog full-width @update:model-value="emits('update:showDialog')" :model-value="showDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Añadir pago</div>
        </q-card-section>
        <q-card-section>
          <div>Total que se debe: $ {{ totalOwed }}</div>
          <q-form @submit="submitForm">
            <q-field filled v-model="MontoTotal" label="Monto de importe">
                <template
                v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
                >
                <Money3Component
                    :id="id"
                    class="q-field__input text-right"
                    v-bind="moneyFormatForDirective"
                    :model-value="modelValue"
                    @update:model-value="e => emitValue(parseFloat(e))"
                    v-show="floatingLabel"
                />
                </template>
            </q-field>
            <div v-for="cuota in selectedCuotas" :key="cuota.id">
                <q-field filled :hint="`Se deben ${getRemainingAmountDue(cuota)?.toFixed(2)} $ para esta cuota`" @update:model-value="(e)=>paymentAmounts[cuota.id]=e" :model-value="paymentAmounts[cuota.id] || 0" :label="`Monto destinado a ${cuota.Alias || cuota.Periodo.from.toDate().toLocaleDateString('es-MX')}`" :rules="[val => val <= getRemainingAmountDue(cuota) || 'El monto no debe ser mayor al monto restante debido']">
                    <template
                    v-slot:control="{ id, floatingLabel, modelValue, emitValue }"
                    >
                    <Money3Component
                    :id="id"
                    class="q-field__input text-right"
                    v-bind="moneyFormatForDirective"
                    :model-value="modelValue"
                    @update:model-value="e => emitValue(parseFloat(e))"
                    v-show="floatingLabel"
                    />
                </template>
            </q-field>
             </div>
             <q-date
                v-model="payment.dateIn"
                landscape
                minimal
             />
            <q-input v-model="payment.Referencia" label="Referencia" type="text" />
            <q-btn label="Submit" type="submit" color="primary" />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted, toRef } from 'vue';
  import { runTransaction, doc, addDoc, collection, getDoc } from 'firebase/firestore';
  import { db } from 'src/boot/vuefire';
  import { Money3Component } from 'v-money3'
  const moneyFormatForDirective = {
  number: true,
  decimal: '.',
  thousands: ',',
  precision: 2,
  masked: false /* doesn't work with directive */
}
  const emits = defineEmits(['update:showDialog', 'submitted'])
  const props = defineProps({
    showDialog: {
      type: Boolean,
      required: true,
    },
    parent: {
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
  const parentRef = toRef(props, 'parent')
  const MontoTotal = ref(0)
  const paymentAmounts = ref({});
  const payment = ref({
    dateIn: '',
    Referencia: '',
  });
  const totalOwed = ref(0);
  const remainingAmountsDue = ref({});
  
  onMounted(async () => {
    for (const cuota of props.selectedCuotas) {
        console.log({cuota})
      const cuotaPaymentRef = doc(db, `students/${cuota.Student.id}/cuota_payments`, cuota.id);
      const cuotaPaymentSnap = await getDoc(cuotaPaymentRef);
      if (cuotaPaymentSnap.exists()) {
        remainingAmountsDue.value[cuota.id] = cuotaPaymentSnap.data().RemainingAmountDue;
        totalOwed.value += cuotaPaymentSnap.data().RemainingAmountDue;
      } else {
        remainingAmountsDue.value[cuota.id] = cuota.Monto;
        totalOwed.value += cuota.Monto;
      }
    }
  });
  
  function getRemainingAmountDue(cuota) {
    return remainingAmountsDue.value[cuota.id];
  }
  
  async function submitForm() {
    try {
      if (Object.values(paymentAmounts.value).reduce((a, b) => a + b, 0) > MontoTotal.value) {
        throw new Error("La suma de los montos destinados a las cuotas no debe ser mayor al monto total del pago");
      }
      for (const cuota of props.selectedCuotas) {
        const paymentAmount = paymentAmounts.value[cuota.id];
        if (paymentAmount) {
          const cuotaPaymentRef = doc(db, `students/${cuota.Student.id}/cuota_payments`, cuota.id);
          await runTransaction(db, async (transaction) => {
            const cuotaPaymentSnap = await transaction.get(cuotaPaymentRef);
            if (cuotaPaymentSnap.exists()) {
              const totalPaid = cuotaPaymentSnap.data().TotalPaid + paymentAmount;
              const remainingAmountDue = cuota.Monto - totalPaid;
              transaction.update(cuotaPaymentRef, {
                TotalPaid: totalPaid,
                RemainingAmountDue: remainingAmountDue,
              });
            } else {
              transaction.set(cuotaPaymentRef, {
                Cuota: cuota,
                TotalPaid: paymentAmount,
                RemainingAmountDue: cuota.Monto - paymentAmount,
              });
            }
          });
          console.log({cuota})
          await addDoc(collection(db, `parents/${parentRef.value.id}/payments`), {
            ...payment.value,
            CuotaId: cuota.id,
            StudentId: cuota.Student.id,
            Monto: paymentAmount
          });
        }
      }
      paymentAmounts.value = {};
      payment.value = {
        dateIn: '',
        Referencia: '',
      };
      emits('update:showDialog', false)
      emits('submitted')
    } catch (error) {
      console.error(error);
    }
  }
  </script>
  