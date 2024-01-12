<template>
    <q-card>
        <q-card-section>
            <p class="text-h5">Licencia de la aplicación</p>

        </q-card-section>
        <q-card-section>
            <form @submit="submitLicenseKey">
                <q-input type="text" label="llave" id="licenseKey" v-model="licenseKey" required />
                <q-btn color="primary" type="submit">Enviar</q-btn>
            </form>
        </q-card-section>
    </q-card>
</template>

<script>
import { api } from 'src/boot/axios';

export default {
    data() {
        return {
            licenseKey: ''
        };
    },
    methods: {
        submitLicenseKey() {
            // use api /license post to submit license key
            // if success, redirect to /
            // if error, show error message
            api.post('/license', { key: this.licenseKey })
                .then(() => {
                    this.$router.push('/');
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
