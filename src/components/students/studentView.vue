<template>
<div>
<q-table
flat bordered
ref="tableRef"
title="Alumnos"
:rows="rows"
:columns="columns"
row-key="id"
v-model:pagination="pagination"
:loading="serverPagination.loading"
:filter="filter"
binary-state-sort
@request="(e)=> onRequest(e,pagination, serverPagination, rows)"
>
<template v-slot:top-right>
    <q-input class="q-mr-md" outlined dense debounce="300" v-model="filter" placeholder="Search">
<template v-slot:append>
<q-icon name="search" />
</template>
</q-input>
    <q-btn-group>
        <q-btn color="primary" icon="add" label="Añadir estudiante" @click="addStudentDialog = true" />
        <q-btn color="secondary" icon="more_vert">
            <q-menu>
                <q-list bordered>
                    <q-item clickable @click="updateAmountOwed">
                        <q-item-section>
                            Actualizar deuda de estudiantes
                        </q-item-section>
                    </q-item>
                    <q-item clickable @click="confirmDialog=!confirmDialog">
                        <q-item-section>
                            Subir de grado a estudiantes
                        </q-item-section>
                    </q-item>
                    <q-item clickable>
                        <UploadStudentCsv />
                    </q-item>
                    <q-item clickable>
                        <DownloadTemplateCsv />
                    </q-item>
                    <q-item clickable>
                        <DownloadGradeYears />
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </q-btn-group>

</template>
<template v-slot:body-cell-edit="props">
<q-td>
<q-btn label="Editar" color="secondary" icon="edit" @click="editStudent(props.row)" />
</q-td>
</template>
<template v-slot:body-cell-Nombre="props">
<q-td>
<q-btn class="full-width" color="primary" no-caps @click="getStudentInfo(props.row)"> {{ props.row.Nombre}} </q-btn>
</q-td>
</template>

</q-table>
<q-dialog v-model="confirmDialog" persient>
            <q-card>
                <q-card-section class="text-center">
                    <p>Confirmación</p>
                    <q-card>
                        ¿Estás seguro de que quieres subir de grado a los estudiantes?
                        No hay forma de deshacer esta acción.
                    </q-card>
                    <q-card-actions align="center">
                        <q-btn
                            color="primary"
                            label="Si"
                            @click="UpgradeStudents"
                        />
                        <q-btn
                            color="negative"
                            label="No"
                            @click="confirmDialog = false"
                        />
                    </q-card-actions>
                </q-card-section>
            </q-card>
        </q-dialog>
<HouseHoldPayments v-if="studentOpen" v-model:show-dialog="studentOpen" :studentRef="studentRef" />
<AddStudent v-if="addStudentDialog" :show-dialog="addStudentDialog" @update:show-dialog="updateAddStudentDiag" :student="studentRefEdit" />
</div>
</template>
<script setup>
import { ref, onMounted, toRef } from 'vue';
import { onRequest } from 'src/utils/onRequest.js';
import AddStudent from './addStudent.vue';
import { yearsByNumber } from 'src/utils/schoolYear.js';
import {useStudentStore}  from 'stores/Students';
const listStore = useStudentStore();
import HouseHoldPayments from '../houseHold/houseHoldPayments.vue';
import { api } from 'src/boot/axios';
import { Loading, Notify } from 'quasar';
import UploadStudentCsv from './uploadStudentCsv.vue';
import DownloadTemplateCsv from './downloadTemplateCsv.vue';
import DownloadGradeYears from './downloadGradeYears.vue';
const studentOpen = ref(false)
const addStudentDialog = ref(false)
const studentRef = ref()
const confirmDialog = ref(false)
const studentDefault = {
Nombre: '',
Apellido: '',
'ced': 0,
Seccion: '',
Grado: 1,
houseHold: '',
Discount: 1
}
const studentRefEdit = ref(studentDefault)
//define updateAmountOwed
async function updateAmountOwed(){
try {
    Loading.show()

const response = await api.patch('/students/updateAmountOwed')
Notify.create({message: response.data, color: 'green'})
} catch (error) {
Notify.create({message: error.message, color:'red'})
console.log({error})
}
finally{
Loading.hide()
}
}
async function UpgradeStudents(){
try {
const response = await api.patch('/students/upgrade')
Notify.create({message: response.data, color: 'green'})
} catch (error) {
Notify.create({message: error.message, color:'red'})
console.log({error})
}
}
function editStudent(student){
console.log({student})
studentRefEdit.value = student
addStudentDialog.value = true
}
function updateAddStudentDiag (value) {
addStudentDialog.value = value
if (value === false) {
studentRefEdit.value = studentDefault
}
}
function getStudentInfo(student) {
console.log({ student})
studentRef.value = student
studentOpen.value = true
}
function setFilter (value) {
console.log({value})
if (value === null) {
serverPagination.value.extraFilter = undefined
} else {
serverPagination.value.extraFilter = {
key: 'houseHold',
value: value,
condition: '=='
}
}
tableRef.value.requestServerInteraction()

}
const columns = [
{ "name": "Nombre", "label": "NOMBRE", "field": "Nombre", "align": "left", "sortable": true },
{ "name": "Apellido", "label": "APELLIDO", "field": "Apellido", "align": "left", "sortable": true },
{ "name": "ced", "label": "CÉDULA DE IDENTIDAD", "field": "ced", "align": "left", "sortable": true },
{ "name": "Seccion", "label": "Seccion", "field": "Seccion", "align": "left", "sortable": true },
{ "name": "Grado", "label": "GRADO", "field": (row) => yearsByNumber.get(row.Grado), "align": "left", "sortable": true },
{ "name": "amountOwed", "label": "DEUDA", "field": "amountOwed", "align": "left", "sortable": true },
{ name: 'edit', label: 'Edit', align: 'center', sortable: false },
]
const tableRef = ref()
const rows = toRef(listStore, 'list')
const filter = ref('')
const pagination = ref({
sortBy: 'desc',
descending: false,
page: 1,
rowsPerPage: 20,
rowsNumber: 10,
first: '',
last: ''
})
const serverPagination = ref({
callerCollection: "students",
defaultColumn: "Apellido",
lastDocument: null,
loading: false,
extraFilter: undefined
})
onMounted(() => {
// get initial data from server (1st page)
tableRef.value.requestServerInteraction()
})
</script>