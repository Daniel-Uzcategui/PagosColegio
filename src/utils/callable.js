import { httpsCallable } from 'firebase/functions';
import { functions } from 'src/boot/vuefire';

export async function calculateAmountOwedByAllHouseholds() {
  const calculateAmountOwedByAllHouseholdsFunction = httpsCallable(
    functions,
    'calculateAmountOwedByAllHouseholds'
  );
  const result = await calculateAmountOwedByAllHouseholdsFunction();
  return result.data.totalAmountOwed;
}