<template>
    <q-dialog :model-value="openDiag" @hide="$emit('update:openDiag', false)">
        <q-card>
            <q-card-section>
                <div class="text-h6">Contactos</div>
                <q-list v-if="Parents.length">
                    <q-item v-for="parent in Parents" :key="parent.Nombre">
                    <q-item-section>
                        <div class="text-subtitle2">{{ parent.Nombre }} {{ parent.Apellido }}</div>
                        <div>{{ parent.Email }}</div>
                        <div v-if="parent.Email !== parent.Email2">{{ parent.Email2 }}</div>
                        <div>{{ parent.Telefono }}</div>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn color="primary" icon="edit" no-caps="" label="Editar" @click="editParent(parent)" />
                    </q-item-section>
                    </q-item>
                </q-list>
                </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
        <AddParent v-if="addParentDialog" v-model:show-dialog="addParentDialog" :parent="parentRef" />
    </q-dialog>

</template>
<script setup>
// import { collection, doc, query, where } from 'firebase/firestore';
// import { db } from 'src/boot/vuefire';
import { toRef, watchEffect } from 'vue'
// import { useCollection, useDocument } from 'vuefire';
import { ref } from 'vue';
import AddParent from '../parents/addParent.vue';
const props = defineProps(['houseHold', 'openDiag'])
const houseHoldRef = toRef(props, 'houseHold')
const parentRef = ref()
const Parents = useCollection(query(collection(db, 'parents'), where('houseHold', '==', houseHoldRef.value._id)))
const addParentDialog = ref(false)
function editParent (parent) {
    parentRef.value = parent
    addParentDialog.value = true
}

</script>