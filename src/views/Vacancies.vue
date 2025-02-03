<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userRole = authStore.userRole;

const page = ref({ title: 'Ofertas Laborales' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Vacantes', disabled: true, href: '#' }
]);

const vacants = ref<any[]>([]);
const searchQuery = ref();

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/vacancies/sorted/active');
    vacants.value = response.data;
    //console.log('response data', response.data);
  } catch (error) {
    console.error('Error al obtener el listado de vacantes:', error);
  }
});

const filteredVacants = computed(() => {
  if (!searchQuery.value) {
    return vacants.value;
  }
  const query = searchQuery.value.toLowerCase();
  return vacants.value.filter(vacant => vacant.name.toLowerCase().includes(query) || vacant.company.toLowerCase().includes(query));
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <!-- <v-alert v-if="showAlert" type="success" variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert> -->
    <v-row class="d-flex align-center" no-gutters>
        <v-col cols="12" sm="6" class="d-flex justify-start">
            <v-text-field
                v-model="searchQuery"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                placeholder="Búscar"
                hide-details
                density="compact"
                color="primary"
            ></v-text-field>
        </v-col>
        <v-col v-if="userRole == 'reclutador'" cols="12" sm="6" class="d-flex justify-end">
            <v-btn color="primary" flat to="/new/job-opportunity">
                Nueva Oferta Laboral
            </v-btn>
        </v-col>
    </v-row>
    <v-row>
        <v-col v-for="vacant in filteredVacants" :key="vacant.id" cols="12" md="12">
            <VacantContent :vacant="vacant"/>
        </v-col>
    </v-row>
</template>

<style scoped lang="scss">
@media (max-width: 1279px) {
    .v-card {
        position: unset;
    }
}
</style>