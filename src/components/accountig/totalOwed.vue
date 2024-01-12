<template>
            <q-tr>
          <q-td colspan="100%">
           Total que se debe $ {{totalOwed?.totalAmountOwed?.toFixed(2)}}
          </q-td>
        </q-tr>
</template>
<script setup>
// import { useDocument } from 'vuefire';
// import { collection, doc } from 'firebase/firestore';
// import { db } from 'src/boot/vuefire';
  // const totalOwed = useDocument(doc(collection(db,'school'), 'accounting'))

</script>