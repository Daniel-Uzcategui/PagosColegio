<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)">
      <q-card>
        <q-card-section>
          <div class="text-h6">Añadir Representante</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit">
            <q-input v-model="Nombre" label="Nombre" filled />
            <q-input v-model="Apellido" label="Apellido" filled />
            <q-input v-model="Telefono" label="Telefono" filled />
            <q-input v-model="Email" label="Email" filled />
            <q-input v-model="ced" label="Cédula de identidad" filled />
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
  
  const props = defineProps({
    showDialog: {
      type: Boolean,
      required: true,
    },
    parent: {
    type: Object,
    default: () => ({}),
  },
  });
  const emits = defineEmits(['update:showDialog', 'Submitted'])
  const Nombre = toRef(props.parent, 'Nombre');
  const Apellido = toRef(props.parent, 'Apellido');
  const Telefono = toRef(props.parent, 'Telefono');
  const Email = toRef(props.parent, 'Email');
  const ced = toRef(props.parent, 'ced');
  async function onSubmit() {
  try {
    if (props.parent.id) {
      // Update existing parent
      await updateDoc(doc(db, 'parents', props.parent.id), {
        Nombre: Nombre.value.toUpperCase(),
        Apellido: Apellido.value.toUpperCase(),
        Telefono: Telefono.value,
        Email: Email.value,
        ced: ced.value,
      });
      Notify.create({ message: 'Representante updated', color: 'green' });
    } else {
      // Add new parent
      await addDoc(collection(db, 'parents'), {
        Nombre: Nombre.value.toUpperCase(),
        Apellido: Apellido.value.toUpperCase(),
        Telefono: Telefono.value,
        Email: Email.value,
        ced: ced.value
      });
      Notify.create({ message: 'Representante added', color: 'green' });
    }
    emits('update:showDialog', false)
    emits('Submitted')
  } catch (error) {
    console.error(error);
    Notify.create({ message: 'Error saving parent', color: 'red' });
  }
}
  </script>
  