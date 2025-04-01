<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const userRole = authStore.userRole;
const route = useRoute();

const page = ref({ title: 'Oferta Laboral' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Vacante', disabled: true, href: '#' }
]);

const vacantId = route.params.id;
const vacant = ref<any>();

onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/vacancies/vacant/detail/${vacantId}`);
    vacant.value = response.data;
  } catch (error) {
    console.error('Error al obtener vacante:', error);
  }
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row class="d-flex align-center" no-gutters>
        <v-col v-if="userRole.toLowerCase() === 'reclutador'" cols="12" sm="6" class="d-flex justify-end">
            <v-btn color="primary" flat to="/new/job-opportunity">
                Nueva Oferta Laboral
            </v-btn>
        </v-col>
    </v-row>
    <v-row>
        <VacantContent :vacant="vacant"/>
    </v-row>
</template>

<style scoped lang="scss">
@media (max-width: 1279px) {
    .v-card {
        position: unset;
    }
}
</style>