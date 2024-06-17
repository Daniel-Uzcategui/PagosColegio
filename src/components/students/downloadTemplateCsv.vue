<template>
        <q-item-section @click="downloadTemplate">Descargar plantilla de estudiante</q-item-section>
</template>

<script>
export default {
    methods: {
        downloadTemplate() {
            const columnNames = {
                id: "",
                Nombre: "John",
                Apellido: "Doe",
                Seccion: "A",
                ced: "12345678",
                // FechaInicioCuota: "2022-01-01",
                Grado: 10,
                credit: 105.55,
            };

            const csvContent = Object.keys(columnNames).join(',') + '\n' + Object.values(columnNames).join(',');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Plantilla de estudiantes.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
</script>
