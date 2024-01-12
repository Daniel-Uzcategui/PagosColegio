<template>
       <q-dialog :model-value="dialogVisible" @hide="resetForm">
           <q-card>
               <q-card-section>
                   <div>{{ getTitle() }}</div>
               </q-card-section>
               <q-card-section>
                   <q-form @submit="submitForm">
                       <q-input v-model="name" label="Name" />
                       <q-input v-model="email" label="Email" />
                       <q-input v-model="password" label="Password" type="password" />
   
                    <q-select
                        v-model="selectedRoles"
                        label="Permisos"
                        multiple
                        :options="rolesOptions.map(option => ({ label: option.path, value: option.roles, description: option.description, methods: option.methods }))"
                        emit-value
                        label-slot
                        map-options
                        option-value="value"
                        option-label="label"
                    
                    >
                   <!-- use the label slot to add description -->
                   <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <q-item-section>
                        <q-item-label>{{ scope.opt.description }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.methods }}: {{ scope.opt.label }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    </template>
                </q-select>
   
                       <q-card-actions align="right"> 
                           <q-btn label="Cancel" color="primary" />
                           <q-btn type="submit" label="Save" color="primary" :disable="isFormInvalid" />
                       </q-card-actions>
                   </q-form>
               </q-card-section>
           </q-card>
       </q-dialog>
</template>

<script setup>
import { ref, toRef, computed, onMounted } from 'vue';
import { useUsersStore } from 'src/stores/User';
import { Notify } from 'quasar';
const userStore = useUsersStore();
const emit = defineEmits(['update:show-dialog', 'update:close', 'update:save', 'update:delete']);
const props = defineProps({
    user: {
        type: Object,
        default: null
    },
    dialogVisible: {
        type: Boolean,
        default: false
    }
});
const name = ref(props.user ? props.user.name : '');
const email = ref(props.user ? props.user.email : '');
const password = ref('');
function getTitle() {
   return props.user._id ? 'Editar Usuario: ' + props.user._id : 'Añadir Usuario'
}
const isFormInvalid = computed(() => {
    return !name.value || !email.value ;
});

const submitForm = async () => {
    try {
        const userData = {
            _id: props.user ? props.user._id : '',
            name: name.value,
            email: email.value,
            password: password.value,
            rol: selectedRoles.value.join('')
        };
        // delete password if string is empty
        if (userData.password === '') {
            delete userData.password;
        }
        
        if (props.user) {
            // User already exists, perform update
            await userStore.setOther(userData);
        } else {
            // New user, perform registration
            await userStore.registerUser(userData);
        }
        return Notify.create({
            message: props.user._id ? 'User updated successfully' : 'User created successfully',
            color: 'positive',
            icon: 'check'
        });
    } catch (error) {
        Notify.create({
            message: error.message,
            color: 'negative',
            icon: 'report_problem'
        });
    }
};

const resetForm = () => {
    name.value = props.user ? props.user.name : '';
    email.value = props.user ? props.user.email : '';
    password.value = '';
    emit('update:show-dialog', false);
};
const selectedRoles = ref([]);
// Load and emit the values of the string
onMounted(() => {
    if (props.user && props.user.rol) {
        selectedRoles.value = Array.from(props.user.rol);
    }
});
const rolesOptions = [
    {
        path: 'Admin',
        methods: 'All',
        roles: '*',
        description: 'Acceso completo a todas las rutas y métodos',
    },
    {
        path: '/payments',
        methods: 'get',
        roles: 'd',
        description: 'Obtener pagos',
    },
    {
        path: '/students/:id/payments',
        methods: 'post',
        roles: 'f',
        description: 'Crear pago para un estudiante específico',
    },
    {
        path: '/students/:id/payments',
        methods: 'get',
        roles: 'g',
        description: 'Obtener pagos de un estudiante específico',
    },
    {
        path: '/students/:id/payments/:paymentId',
        methods: 'patch',
        roles: 'h',
        description: 'Actualizar un pago específico de un estudiante',
    },
    {
        path: '/students/:id/payments/:paymentId',
        methods: 'delete',
        roles: 'i',
        description: 'Eliminar un pago específico de un estudiante',
    },
    {
        path: '/cuotas/batch',
        methods: 'post',
        roles: 'k',
        description: 'Crear múltiples cuotas',
    },
    {
        path: '/cuotas',
        methods: 'get',
        roles: 'l',
        description: 'Obtener cuotas',
    },
    {
        path: '/students/:id/cuota_payments',
        methods: 'post',
        roles: 'z',
        description: 'Crear pago de cuota para un estudiante específico',
    },
    {
        path: '/students/:id/cuota_payments',
        methods: 'get',
        roles: 'x',
        description: 'Obtener pagos de cuota de un estudiante específico',
    },
    {
        path: '/students/:id/cuota_payments/:paymentId',
        methods: 'patch',
        roles: 'c',
        description: 'Actualizar un pago de cuota específico de un estudiante',
    },
    {
        path: '/students/:id/cuota_payments/:paymentId',
        methods: 'delete',
        roles: 'v',
        description: 'Eliminar un pago de cuota específico de un estudiante',
    },
    {
        path: '/cuotas/:id',
        methods: 'delete',
        roles: 'b',
        description: 'Eliminar una cuota específica',
    },
    {
        path: '/logs',
        methods: 'post',
        roles: 'j',
        description: 'Crear registro de actividad',
    },
    {
        path: '/students/upgrade',
        methods: 'patch',
        roles: 'y',
        description: 'Actualizar estado de estudiante',
    },
    {
        path: '/students',
        methods: 'post',
        roles: 'u',
        description: 'Crear estudiante',
    },
    {
        path: '/students',
        methods: 'get',
        roles: 'i',
        description: 'Obtener estudiantes',
    },
    {
        path: '/students/updateAmountOwed',
        methods: 'patch',
        roles: 'o',
        description: 'Actualizar cantidad adeudada de los estudiantes',
    },
    {
        path: '/students/:id',
        methods: 'get',
        roles: 'p',
        description: 'Obtener un estudiante específico',
    },
    {
        path: '/students/:id',
        methods: 'patch',
        roles: 'a',
        description: 'Actualizar un estudiante específico',
    },
    {
        path: '/students/:id',
        methods: 'delete',
        roles: 's',
        description: 'Eliminar un estudiante específico',
    },
    {
        path: '/users',
        methods: 'post',
        roles: 'q',
        description: 'Crear usuario',
    },
    {
        path: '/users',
        methods: 'get',
        roles: 'w',
        description: 'Obtener usuarios',
    },
    {
        path: '/users/:id',
        methods: 'get',
        roles: 'e',
        description: 'Obtener un usuario específico',
    },
    {
        path: '/users/:id',
        methods: 'patch',
        roles: 'r',
        description: 'Actualizar un usuario específico',
    },
    {
        path: '/users/:id',
        methods: 'delete',
        roles: 't',
        description: 'Eliminar un usuario específico',
    },
    {
        path: '/students/upload',
        methods: 'post',
        roles: 'n',
        description: 'Subir archivo de estudiantes',
    },
];
</script>
