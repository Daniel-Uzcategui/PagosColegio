<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)">
      <q-card>
        <q-card-section>
          <div class="text-h6">Añadir Familia</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit">
            <q-input v-model="Apellido" label="Apellido" filled />
            <q-select v-model="Padres" :options="parents" label="Padres" filled multiple
            :option-label="(parent) => parent.Nombre + ' ' + parent.Apellido"
            :option-value="(value) => value.id"
            emit-value
            map-options
            :filter="(options, filter) => options.filter(option => option.Apellido.toLowerCase().includes(filter.toLowerCase()))" />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, toRef } from 'vue';
  import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
  import { db } from 'src/boot/vuefire';
  import { Notify } from 'quasar';
  import {useCollection} from 'vuefire'
  const parents = useCollection(collection(db, 'parents'));
  const props = defineProps({
    showDialog: {
      type: Boolean,
      required: true,
    },
    houseHold: {
    type: Object,
    default: () => ({
      Padres: []
    }),
  },
  });
  const emits = defineEmits(['update:showDialog', 'submitted'])
  
const Apellido = toRef(props.houseHold, 'Apellido');
const Padres = toRef(props.houseHold, 'Padres');
  async function onSubmit() {
  try {
    if (props.houseHold.id) {
      // Update existing houseHold
      await updateDoc(doc(db, 'houseHolds', props.houseHold.id), {
        Apellido: Apellido.value.toUpperCase(),
        Padres: Padres.value,
      });
      Notify.create({ message: 'Familia updated', color: 'green' });
    } else {
      // Add new houseHold
      await addDoc(collection(db, 'houseHolds'), {
        Apellido: Apellido.value.toUpperCase(),
        Padres: Padres.value,
      });
      Notify.create({ message: 'Familia added', color: 'green' });
    }
    emits('update:showDialog', false)
    emits('submitted')
  } catch (error) {
    console.error(error);
    Notify.create({ message: 'Error guardando Familia', color: 'red' });
  }
}
  </script>
  