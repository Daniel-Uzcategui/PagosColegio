<template>
    <q-item-section @click="downloadTemplate">Descargar Tabla de Grados</q-item-section>
</template>

<script>
import { yearsByString } from 'src/utils/schoolYear.js';

export default {
    methods: {
        downloadTemplate() {
            const keysArray = Array.from(yearsByString.keys());
            const valuesArray = Array.from(yearsByString.values());
            const csvContent = keysArray.join(',') + '\n' + valuesArray.join(',');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tabla de grados.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
</script>
