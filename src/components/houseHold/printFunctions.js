import { printDialog } from "../printer/printer.js";

// export const generateReceiptLines = async (groupedPayments, houseHold) => {
//     let receiptLines = '';
//       const payments = groupedPayments;
//       console.log({payments, houseHold})
//       let receiptLine = '{w:auto}\n';
//       receiptLine += `Referencia: | "${payments[0].Referencia}"\n`;
//       receiptLine += `Tipo de Pago: | "${payments[0].Tipo}"\n`;
//       receiptLine += `TasaBCV: | ${payments[0].TasaBCV}\n`;
//       receiptLine += `MontoBS: | ${payments.reduce((acc, payment) => acc + payment.MontoTotalBS, 0).toFixed(2)}\n`;
//       receiptLine += `Monto$: | ${payments.reduce((acc, payment) => acc + payment.Monto, 0).toFixed(2)}\n`;
//       receiptLine += '-\n';
//       const students = [...new Set(payments.map(payment => payment.cuotaInfo.studentId))];
//       for (const studentId of students) {
//         const studentPayments = payments.filter(payment => payment.cuotaInfo.studentId === studentId);
//         receiptLine += '{w:auto}\n';
//         receiptLine += `Estudiante: | "${studentPayments[0].cuotaInfo.student.Nombre}"\n`;
//         receiptLine += `Cédula: | "${studentPayments[0].cuotaInfo.student.ced}"\n`;
//         receiptLine += '|Aportes Realizados ' + studentPayments[0].fechaPago.toLocaleDateString('es-VE') + '|\n';
//         receiptLine += '{w:18,6,8}\n\n';
//         receiptLine += '| Cuota | Monto$ | MontoBs |\n';
//         receiptLine += '| ---------------- | ------ | -------- |\n';
//         for (const payment of studentPayments) {
//           if (payment.cuotaInfo.studentId === studentId) {
//             receiptLine += `| ${payment.cuotaInfo.Alias} | ${payment.Monto.toFixed(2)} | ${payment.MontoTotalBS.toFixed(2)} |\n`;
//           }
//           if (payment.cuotaInfo.RemainingAmountDue === 0) {
//               receiptLine += '{w:auto}\n';
//               receiptLine += `Cuota pagada, Total: $${payment.cuotaInfo.Monto.toFixed(2)}\n`;
//               receiptLine += '{w:18,6,8}\n';
//           } else {
//               receiptLine += '{w:auto}\n';
//               receiptLine += `Deuda cuota, Total: $${payment.cuotaInfo.RemainingAmountDue.toFixed(2)}\n`;
//               receiptLine += '{w:18,6,8}\n';
//           }
//         }
//         receiptLine += '| ---------------- | ------ | -------- |\n';
//         receiptLine += '-\n';
//       }
//       receiptLine += '{w:18,14}\n';
//       receiptLines += receiptLine;
//     receiptLines += '{w:auto}\n';
//     // receiptLines += `Deuda Restante => | ${houseHold.amountOwed.toFixed(2)}$\n\n`;
//     console.log({receiptLines})
//     return printDialog(receiptLines);
//   }

export const generateReceiptLines = async (payment, houseHold) => {
  let receiptLines = '';
  console.log({payment, houseHold})
  let receiptLine = '{w:auto}\n';
  receiptLine += `Referencia: | "${payment.Referencia}"\n`;
  receiptLine += `Tipo de Pago: | "${payment.Tipo}"\n`;
  receiptLine += `TasaBCV: | ${payment.TasaBCV}\n`;
  receiptLine += `MontoBS: | ${payment.MontoTotalBS.toFixed(2)}\n`;
  receiptLine += `Monto$: | ${payment.Monto.toFixed(2)}\n`;
  receiptLine += '-\n';
  receiptLine += '{w:auto}\n';
  receiptLine += `Estudiante: | "${payment.student.Nombre}"\n`;
  receiptLine += `Cédula: | "${payment.student.ced}"\n`;
  receiptLine += '|Aportes Realizados ' + new Date(payment.fechaPago).toLocaleDateString('es-VE') + '|\n';
  receiptLine += '{w:18,6,8}\n\n';
  receiptLine += '| Cuota | Monto$ | MontoBs |\n';
  receiptLine += '| ---------------- | ------ | -------- |\n';
  for (const [cuotaId, monto] of Object.entries(payment.cuotasPaid)) {
      receiptLine += `| ${cuotaId} | ${monto.toFixed(2)} | ${(monto * payment.TasaBCV).toFixed(2)} |\n`;
  }
  receiptLine += '| ---------------- | ------ | -------- |\n';
  receiptLine += '-\n';
  receiptLine += '{w:18,14}\n';
  receiptLines += receiptLine;
  receiptLines += '{w:auto}\n';
  console.log({receiptLines})
  return printDialog(receiptLines);
}

export const testprint = async (payment, houseHold) => {
  let receiptLines = '';
  console.log({payment, houseHold})
  let receiptLine = '{w:auto}\n';
  receiptLine += '{w:18,6,8}\n\n';
  receiptLine += '| ---------------- | ------ | -------- |\n';
  receiptLine += '-\n';
  receiptLine += '{w:18,14}\n';
  receiptLines += receiptLine;
  receiptLines += '{w:auto}\n';
  console.log({receiptLines})
  return printDialog(receiptLines);
}
