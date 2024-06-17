<template>
    <q-item-section>
        Cargar CSV
        <q-popup-proxy>
            <q-banner style="max-width: 500px;">
                <template v-slot:avatar>
                    <q-icon name="folder" color="primary" />
                </template>
                Para cargar el archivo .csv, el usuario debe hacer clic en el campo inferior y luego seleccionar el archivo deseado. Después, debe hacer clic en el icono de carga para iniciar el proceso.
            </q-banner>
            <q-file
                ref="fileInput"
                v-model="file"
                outlined
                accept=".csv"
                @update:model-value="handleFileUpload"
            >
                <template v-slot:prepend>
                    <q-icon name="attachment" />
                </template>
                <template v-slot:append>
                    <q-btn flat icon="upload" @click="dialogTableStudentUpload=true" />
                </template>
            </q-file>
        </q-popup-proxy>
        <q-dialog full-width v-model="dialogTableStudentUpload">
            <q-card class="full-width">
                <q-card-section>
                    <q-table
                        :rows="fileData"
                        row-key="id"
                    />
                </q-card-section>
                <q-card-actions class="column items-center">
                    <q-btn color="primary" icon="cloud_upload" label="Importar estudiantes" @click="confirmUploadStudents" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-item-section>
</template>

<script setup>
import { Notify, Dialog } from 'quasar';
import { useStudentStore } from 'src/stores/Students.js';
import { ref } from 'vue';

const file = ref(null);
const dialogTableStudentUpload = ref(false);
const fileData = ref(null);
const headers = ref([]);

function handleFileUpload(event) {
    const selectedFile = event;
    const reader = new FileReader();

    reader.onload = () => {
        const csvData = reader.result;
        const lines = csvData.split("\n");
        headers.value = lines[0].split(",");
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(",");
            const obj = {};

            for (let j = 0; j < headers.value.length; j++) {
                obj[headers.value[j]] = currentLine[j];
            }

            data.push(obj);
        }

        fileData.value = data;
    };

    reader.readAsText(selectedFile);
}

async function uploadStudents() {
    try {
        const students = fileData.value;
        let studentsToUpload = students.map((student) => {
            let cuotas = [];
                // Iterate over each key-value pair in the student object
                for (let key in student) {
                    // Check if the key matches the date format MM/YYYY
                    // console.log({key})
                        if (key.split("/").length > 1) {
                        let date = new Date('01/' + key)
                        // Transform the key into the desired Alias format
                        const month = date.getMonth();
                        const year = date.getFullYear();
                        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        const Alias = monthNames[month] + ' ' + year;
                        console.log({month, year, date})
                        // Create a cuota object with the specified structure
                        const cuota = {
                            Alias,
                            Monto: parseFloat(student[key]),
                            Periodo: {
                                from: new Date(year, month - 1, 1),
                                to: new Date(year, month, 0),
                            },
                            Discount: 1,
                            totalPaid: 0,
                            RemainingAmountDue: parseFloat(student[key]),
                        };

                        // Add the cuota object to the cuotas array
                        cuotas.push(cuota);
                    }
                }
            return {
                id: student.id || "",
                Nombre: student.Nombre,
                Apellido: student.Apellido,
                ced: parseInt(student.ced),
                Seccion: student.Seccion,
                FechaInicioCuota: new Date(0),
                Grado: parseInt(student.Grado),
                credit: parseFloat(student.credit) || 0,
                cuotas
            };
        });
        studentsToUpload = studentsToUpload.filter(student => student.Nombre !== undefined)
        console.log({studentsToUpload})
        await useStudentStore().uploadStudents(studentsToUpload);
        return Notify.create({ message: 'Estudiantes cargados exitosamente', color: 'green' });
    } catch (error) {
        Notify.create({ message: error.message, color: 'red' });
    } finally {
        dialogTableStudentUpload.value = false;
    }

}

function confirmUploadStudents() {
    Dialog.create({
        title: 'Confirmar carga de estudiantes',
        message: '¿Estás seguro de que deseas cargar los estudiantes?',
        persistent: true,
        cancel: {
            label: 'Cancelar',
            color: 'negative',
            unelevated: true
        }
    }).onOk(async () => {
        uploadStudents();
    })
}
</script>