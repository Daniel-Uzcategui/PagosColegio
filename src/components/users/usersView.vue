<template>
    <div>
        <q-table
            flat bordered
            ref="tableRef"
            title="Usuarios"
            :rows="rows"
            :columns="columns"
            row-key="id"
            v-model:pagination="pagination"
            :loading="serverPagination.loading"
            :filter="filter"
            binary-state-sort
            @request="(e) => onRequest(e, pagination, serverPagination, rows)"
        >
            <template v-slot:top-right>
                <q-btn
                    color="primary"
                    icon="add"
                    label="Agregar usuario"
                    @click="updateAddUserDialog(true)"
                />
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>
            <template v-slot:body-cell-edit="props">
                <q-td>
                    <q-btn label="Editar" color="secondary" icon="edit" @click="editUser(props.row)" />
                </q-td>
            </template>
            <template v-slot:body-cell-Nombre="props">
                <q-td>
                    <q-btn class="full-width" color="primary" no-caps @click="getUserInfo(props.row)">
                        {{ props.row.name }}
                    </q-btn>
                </q-td>
            </template>
        </q-table>
        <UserManagementDialog v-if="dialogVisible"  @update:show-dialog="updateAddUserDialog" :user="userRefEdit" v-model:dialogVisible="dialogVisible" />
    </div>
</template>

<script setup>
import { ref, onMounted, toRef } from 'vue';
import { onRequest } from 'src/utils/onRequest.js';
import UserManagementDialog from './userManagementDialog.vue';
import { Loading, Notify } from 'quasar';
import { useUsersStore } from 'src/stores/User';
const userStore = useUsersStore();
const dialogVisible = ref(false);
const addUserDialog = ref(false);
const userRef = ref();
const rows = toRef(userStore, 'list');
const userDefault = {
    _id: '',
    Nombre: '',
    Apellido: '',
    Email: '',
    Rol: '',
};
const userRefEdit = ref(userDefault);

function editUser(user) {
    userRefEdit.value = user;
    dialogVisible.value = true;
}

function updateAddUserDialog(value) {
    dialogVisible.value = value;
    if (value === false) {
        userRefEdit.value = userDefault;
    }
}

function getUserInfo(user) {
    console.log({ user });
    userRef.value = user;
}

const columns = [
    { name: 'Nombre', label: 'NOMBRE', field: 'name', align: 'left', sortable: true },
    { name: 'Email', label: 'EMAIL', field: 'email', align: 'left', sortable: true },
    { name: 'Rol', label: 'PERMISOS', field: 'rol', align: 'left', sortable: true },
    { name: 'edit', label: 'Editar', align: 'center', sortable: false },
];

const tableRef = ref();
const filter = ref('');
const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 3,
    rowsNumber: 10,
    first: '',
    last: '',
});
const serverPagination = ref({
    callerCollection: 'users',
    defaultColumn: 'email',
    lastDocument: null,
    loading: false,
    extraFilter: undefined,
});

onMounted(() => {
    // get initial data from server (1st page)
    tableRef.value.requestServerInteraction();
});
</script>
