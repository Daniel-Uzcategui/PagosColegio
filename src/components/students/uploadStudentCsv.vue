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
        <q-dialog v-model="dialogTableStudentUpload">
            <q-card class="my-card">
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
        const studentsToUpload = students.map((student) => {
            return {
                Nombre: student.Nombre,
                Apellido: student.Apellido,
                ced: parseInt(student.ced),
                Seccion: student.Seccion,
                FechaInicioCuota: new Date(student.FechaInicioCuota),
                Grado: parseInt(student.Grado)
            };
        });
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