<template>
    <div>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6 q-my-sm">Filtros:</div>
        <div class="q-gutter-md row items-start">
          <q-input v-model="filters.category" label="Category" @update:model-value="fetchLogs" debounce="1000" class="col-6" />
          <q-select v-model="filters.createdBy" :options="users" option-label="email" option-value="_id" emit-value map-options label="Usuario" @update:model-value="fetchLogs" debounce="1000" class="col-6" />
        </div>
        <div class="q-gutter-md row items-start">
          <q-input v-model="filters.key" label="Custom Filter Key" @update:model-value="fetchLogs" debounce="1000" class="col-6" />
          <q-input v-model="filters.value" label="Custom Filter Value" @update:model-value="fetchLogs" debounce="1000" class="col-6" />
            <q-select v-model="filters.type" :options="['string', 'number', 'objectid']" label="Type" @update:model-value="fetchLogs" debounce="1000" class="col-6" />
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-pt-none">
        <q-btn icon="sym_o_today" color="primary" label="Fecha Desde" @click="showStartDateDialog=!showStartDateDialog" class="q-mx-sm" />
        <q-btn icon="sym_o_event" color="secondary" label="Fecha Hasta" @click="showEndDateDialog=!showEndDateDialog" class="q-mx-sm" />
      </q-card-actions>
    </q-card>
        <q-table
            :rows="logs"
            :columns="columns"
            row-key="_id"
        >
            <template v-slot:body-cell-diff="props">
                <q-td :props="props">
                    <q-btn color="accent" label="Data">
                        <q-popup-proxy class="full-width">
                            <q-list bordered>
                                <q-item v-for="(value, key, index) of props.row.diff" :key="index" clickable v-ripple>
                                    <q-item-section side>{{ key }}:</q-item-section>
                                    <logs-history :value="value" />
                                </q-item>
                            </q-list>
                        </q-popup-proxy>
                    </q-btn>
                </q-td>
            </template>
    
    </q-table>
    <q-dialog v-model="showStartDateDialog">
      <q-card>
        <q-date v-model="filters.createdAt" label="Start Date" @update:model-value="fetchLogs" debounce="1000" />
      </q-card>
    </q-dialog>
    <q-dialog v-model="showEndDateDialog">
      <q-card>
        <q-date v-model="filters.updatedAt" label="End Date" @update:model-value="fetchLogs" debounce="1000" />
      </q-card>
    </q-dialog>
    </div>
</template>

<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
import LogsHistory from 'src/components/logHistory/logHistory.vue';
const logs = ref([]);
const filters = ref({
    category: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
    key: '',
    value: '',
    type: 'string'


});
const users = ref([]);
const showStartDateDialog = ref(false);
const showEndDateDialog = ref(false);

const columns = [
    {
        name: 'Action',
        required: true,
        label: 'Action',
        align: 'left',
        field: 'action',
        sortable: true
    },
    {
        name: 'Category',
        required: true,
        label: 'Category',
        align: 'left',
        field: 'category',
        sortable: true
    },
    {
        name: 'Created By',
        required: true,
        label: 'Created By',
        align: 'left',
        field: x => getEmail(x.createdBy),
        sortable: true
    },
    {
        name: 'Message',
        required: true,
        label: 'Message',
        align: 'left',
        field: 'message',
        sortable: true
    },
    {
        name: 'Created At',
        required: true,
        label: 'Created At',
        align: 'left',
        field: 'createdAt',
        sortable: true
    },
    {
        name: 'Updated At',
        required: true,
        label: 'Updated At',
        align: 'left',
        field: 'updatedAt',
        sortable: true
    },
    {
        name: 'diff',
        required: true,
        label: 'diff',
        align: 'left',
        field: 'diff',
        sortable: true
    },
];
onMounted(() => {
    // Fetch logs from the server
    fetchLogs();
    fetchUsers()
});

async function fetchLogs() {
    console.log('fetching logs');
    // add filter value if value !== ''
    const body = {};
    for (const key in filters.value) {
        if (filters.value[key] !== '') {
            body[key] = filters.value[key];
        }
    }
    try {
        console.log({ body });
        const response = await api.post('/logs', body);
        logs.value = response.data;
        // Update pagination information if necessary
        // Example: this.pagination.totalRows = response.data.totalCount;
    } catch (error) {
        console.error(error);
    }
}
const userMap = ref({})

async function fetchUsers() {
const response = await api.get('/users');
users.value = response.data;
// Create a map of users
for (const user of response.data) {
userMap.value[user._id] = user;
}
}
function getEmail(id) {
try {
return userMap.value[id].email
} catch (error) {
return ""
}
}
</script>
