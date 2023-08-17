<template>
    <q-btn color="primary" icon="check" label="OK" @click="getPrint" />
</template>
<script setup>
import {computed} from 'vue'
const props = defineProps(['payments', 'houseHold'])
const groupPaymentsByReferenciaAndStudent = (payments) => {
  const groupedPayments = {};
  for (const payment of payments) {
    const key = `${payment.Referencia}-${payment.cuotaInfo.studentId}`;
    if (!groupedPayments[key]) {
      groupedPayments[key] = [];
    }
    groupedPayments[key].push(payment);
  }
  return groupedPayments;
}
const groupPaymentsByReferencia = (payments) => {
  const groupedPayments = {};
  for (const payment of payments) {
    const key = payment.Referencia;
    if (!groupedPayments[key]) {
      groupedPayments[key] = [];
    }
    groupedPayments[key].push(payment);
  }
  return groupedPayments;
}


// Example usage:
const generateReceiptLines = (groupedPayments, houseHold) => {
  let receiptLines = '';
  for (const key in groupedPayments) {
    const payments = groupedPayments[key];
    let receiptLine = '{w:auto}\n';
    receiptLine += `Referencia: | "${key}"\n`;
    receiptLine += `Tipo de Pago: | "${payments[0].Tipo}"\n`;
    receiptLine += `TasaBCV: | ${payments[0].TasaBCV}\n`;
    receiptLine += `MontoBS: | ${payments.reduce((acc, payment) => acc + payment.MontoTotalBS, 0).toFixed(2)}\n`;
    receiptLine += `Monto$: | ${payments.reduce((acc, payment) => acc + payment.Monto, 0).toFixed(2)}\n`;
    receiptLine += '-\n';
    const students = [...new Set(payments.map(payment => payment.cuotaInfo.studentId))];
    for (const studentId of students) {
      const studentPayments = payments.filter(payment => payment.cuotaInfo.studentId === studentId);
      receiptLine += '{w:auto}\n';
      receiptLine += `Estudiante: | "${studentPayments[0].cuotaInfo.student.Nombre}"\n`;
      receiptLine += `Cédula: | "${studentPayments[0].cuotaInfo.student.ced}"\n`;
      if (studentPayments[0].cuotaInfo.Discount !== 1) {
          receiptLine += `Ayuda: | ${studentPayments[0].cuotaInfo.Discount * 100}%\n\n`;
      }
      receiptLine += '|Aportes Realizados ' + studentPayments[0].fechaPago.toDate().toLocaleDateString('es-VE') + '|\n';
      receiptLine += '{w:11,10,11}\n\n';
      receiptLine += '| Cuota | Monto$ | MontoBs |\n';
      receiptLine += '| -------- | ------- | ------- |\n';
      for (const payment of studentPayments) {
        if (payment.cuotaInfo.studentId === studentId) {
          receiptLine += `| ${payment.cuotaInfo.Alias} | ${payment.Monto.toFixed(2)} | ${payment.MontoTotalBS.toFixed(2)} |\n`;
        }
        if (payment.cuotaInfo.RemainingAmountDue === 0) {
            receiptLine += '{w:auto}\n';
            receiptLine += `Cuota pagada, Total: $${payment.cuotaInfo.Monto.toFixed(2)}\n`;
            receiptLine += '{w:11,10,11}\n';
        } else {
            receiptLine += '{w:auto}\n';
            receiptLine += `Deuda actual, Total: $${payment.cuotaInfo.RemainingAmountDue.toFixed(2)}\n`;
            receiptLine += '{w:11,10,11}\n';
        }
      }
      receiptLine += '| -------- | ------- | ------- |\n';
      receiptLine += '-\n';
    }
    receiptLine += '{w:18,14}\n';
    receiptLines += receiptLine;
  }
  receiptLines += '{w:auto}\n';
  receiptLines += `Deuda Restante => | ${houseHold.amountOwed.toFixed(2)}$\n\n`;
  return receiptLines;
}

// Example usage:
function getPrint() {
    const groupedPayments = groupPaymentsByReferencia(props.payments);
    const receiptLines = generateReceiptLines(groupedPayments, props.houseHold);
    console.log(receiptLines);
}

</script>
