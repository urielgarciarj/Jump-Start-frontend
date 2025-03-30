<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UpdateVacantForm from './UpdateVacant.vue';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import UserImage from '@/assets/images/profile/user-5.jpg';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userId = authStore.userId;

const vacantId = route.params.id;

const page = ref({ title: 'Detalles de Oferta Laboral' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Detalles Vacante', disabled: true, href: '#' }
]);

const vacantDetail = ref<any | null>(null);
const applicationsList = ref<any[]>([]);
const recommendedStudents = ref<any[]>([]);
const isLoadingRecommendations = ref(false);

const error = ref<string | null>(null);
const tab = ref(null);

const showEditForm = ref(false);
const showConfirmation = ref(false);

/*Header Data [Table headers and sorting]*/
const sortBy:any  = ref([
    { key: 'name', order: 'desc' }
]);
const headers : any = ref([
    { title: '', align: 'start', key: 'picture', sortable: false },
    { title: 'Nombre', align: 'start', key: 'name' },
    { title: 'Correo', align: 'start', key: 'email' },
    { title: 'Teléfono', align: 'start', key: 'phoneNumber', sortable: false },
    { title: 'Fecha', align: 'start', key: 'dateCreated' },
    { title: 'Interes', align: 'start', key: 'interested', sortable: false },
    { title: 'Habilidades', align: 'start', key: 'proficiency', sortable: false },
]);

onMounted(async () => {
    try {
        const response = await axios.get(`http://localhost:3000/vacancies/vacant/detail/${vacantId}`);
        // If no response data or the rcd belongs to other user, throw error
        if (!response.data || response.data.user.id != userId) {
            error.value = 'Oferta laboral no encontrada.';
        } 
        else { // The vacant belong to the currUser, proceed to get applications 
            vacantDetail.value = response.data;
            // Get applications related
            const _response = await axios.get(`http://localhost:3000/applications/list-by/vancant/${vacantId}`);
            applicationsList.value = _response.data;
            
            // Cargar estudiantes recomendados
            await fetchRecommendedStudents();
        }
    } catch (err) {
        console.error('Error:', err);
        const errorAxios = err as AxiosError;
        // Manejar el error en función del código de estado
        if (errorAxios.response) {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
    }
});

// Función para obtener estudiantes recomendados para la vacante
const fetchRecommendedStudents = async () => {
    isLoadingRecommendations.value = true;
    try {
        const response = await axios.get(`http://localhost:3000/vacancies/recommend-students-for-vacant/${vacantId}`);
        
        recommendedStudents.value = response.data.recommendedStudents || [];
        
        // Ordenar por porcentaje de coincidencia (de mayor a menor)
        recommendedStudents.value.sort((a, b) => b.matchPercentage - a.matchPercentage);
    } catch (error) {
        console.error('Error al obtener estudiantes recomendados:', error);
        // Información detallada sobre el error
        const err = error as AxiosError;
        if (err.response) {
            console.error('Datos del error:', err.response.data);
            console.error('Estado HTTP:', err.response.status);
        } else if (err.request) {
            console.error('No se recibió respuesta del servidor');
        } else {
            console.error('Error al configurar la solicitud:', err.message);
        }
    } finally {
        isLoadingRecommendations.value = false;
    }
};

// Función para editar el post
const editPost = () => {
  showEditForm.value = true;
};

// Función para cancelar la edición
const cancelEdit = () => {
  showEditForm.value = false;
};

// Función para manejar la actualización de la vacante
const handleUpdateVacant = (updatedVacant: 
    { name: any; description: any; status: any; location: any; category: any; modality: any; level: any; salary: any; salaryPeriod: any; }) => {
    if (vacantDetail.value) {
        vacantDetail.value.name = updatedVacant.name;
        vacantDetail.value.description = updatedVacant.description;
        vacantDetail.value.status = updatedVacant.status;
        vacantDetail.value.location = updatedVacant.location;
        vacantDetail.value.category = updatedVacant.category;
        vacantDetail.value.modality = updatedVacant.modality;
        vacantDetail.value.level = updatedVacant.level;
        vacantDetail.value.salary = updatedVacant.salary;
        vacantDetail.value.salaryPeriod = updatedVacant.salaryPeriod;
    }
  showEditForm.value = false;
};

//Funcion para manejar eliminar una vacante
const handleDeleteVacant = () => { 
    showConfirmation.value = true; 
};

const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:3000/vacancies/delete/${vacantId}`);
        router.push('/vacancies/list-all');
        //emit('deletePost', postIdToDelete.value);
    } catch (err) {
        console.log('Error', err);
    }
    showConfirmation.value = false;
};

const formatDateTime = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    day: 'numeric',    // Día
    month: 'numeric',  // Mes
    year: 'numeric',   // Año
  });
};

const capitalizeFirstLetter = (str: string) => {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Función para obtener color basado en el porcentaje de coincidencia
const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 50) return 'warning';
    return 'error';
};
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10" class="mb-6">
        <!-- Tabs para detalle - solicitudes -->
        <v-card-item>
            <v-tabs v-model="tab" color="primary" class="border-bottom">
                <v-tab value="one">General</v-tab>
                <v-tab value="two">Solicitudes</v-tab>
            </v-tabs>
            <div class="mt-5">
                <v-row v-if="error">
                    <v-col cols="12">
                        <v-alert v-if="error" type="error" variant="tonal" dismissible>
                            {{ error }}
                        </v-alert>
                    </v-col>
                </v-row>
                <v-window v-model="tab" v-if="!error">
                    <v-window-item value="one">
                        <!-- Only view -->
                        <div v-if="!showEditForm" class="bg-light mt-6 pa-6 rounded-md">
                            <v-row>
                                <v-col cols="12" md="12">
                                    <h3>{{ vacantDetail?.company }}</h3>
                                    <span class="text-subtitle-2 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        Reclutador: {{ vacantDetail?.user.name }} {{ vacantDetail?.user.lastName }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Título</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ vacantDetail?.name }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Categoría</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ vacantDetail?.category }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Modalidad</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ vacantDetail?.modality }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Estado</h3>
                                    <v-chip class="font-weight-bold bg-light" color="success" size="small" rounded="sm">
                                        {{ capitalizeFirstLetter(vacantDetail?.status || '') }}
                                    </v-chip>
                                </v-col>

                                <v-col cols="12" md="4">
                                    <h3>Ubicación</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ vacantDetail?.location }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <h3>Nivel</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ vacantDetail?.level }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <h3>Salario</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ vacantDetail?.salary }} {{ vacantDetail?.salaryPeriod }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <h3>Descripción</h3>
                                    <div v-html="vacantDetail?.description"></div>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <h3>Habilidades Requeridas</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        {{ vacantDetail?.requirements }}
                                    </span>
                                </v-col>
                            </v-row>
                        </div>
                        <!-- Botones para editar - eliminar -->
                        <div v-if="!showEditForm" class="d-flex ga-3 justify-end mt-6">
                            <v-btn @click.stop="handleDeleteVacant()" color="error" flat >
                                Eliminar
                            </v-btn>
                            <v-btn  @click.stop="editPost()" color="primary" flat
                                >Editar</v-btn
                            >
                        </div>

                        <!-- Editing form -->
                        <div v-if="showEditForm">
                            <UpdateVacantForm
                                :vacant="vacantDetail"
                                @updateVacant="handleUpdateVacant"
                                @cancelEdit="cancelEdit()"
                            />
                        </div>
                    </v-window-item>
                    <v-window-item value="two">
                        <!-- <ProductReview /> -->
                         <v-col cols="12">
                            <UiParentCard title="Solicitudes recibidas">
                                <v-data-table items-per-page="5" :headers="headers" :items="applicationsList" item-value="name"
                                    v-model:sort-by="sortBy" class="border rounded-md datatabels">
                                    <template v-slot:item="{ item }">
                                        <tr>
                                        <td>
                                            <v-avatar size="32" class="text-h5 font-weight-medium"> 
                                                <template v-if="item.user.profile?.picture">
                                                    <img :src="item.user.profile?.picture" alt="icon" height="32" />
                                                </template>
                                                <template v-else>
                                                    {{ item.name.charAt(0).toUpperCase() }}
                                                </template>
                                            </v-avatar>
                                        </td>
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.email }}</td>
                                        <td>{{ item.phoneNumber }}</td>
                                        <td>{{ formatDateTime(item.dateCreated) }}</td> <!-- Fecha formateada -->
                                        <td>{{ item.interested }}</td>
                                        <td>{{ item.proficiency }}</td>
                                        </tr>
                                    </template>
                                </v-data-table>
                            </UiParentCard>
                         </v-col>
                    </v-window-item>
                </v-window>
            </div>
        </v-card-item>
    </v-card>

    <!-- Confirmation Dialog Delete Vacant-->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Oferta Laboral</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar esta oferta laboral?</h5>
                <h6>Al eliminar la oferta, se eliminarán también todas las solicitudes asociadas a ella de manera permanente.</h6>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="tonal" class="px-4" @click="showConfirmation = false">Cancelar</v-btn>
                <v-btn color="error" class="px-4" variant="tonal" @click="confirmDelete">Si, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- Sección de estudiantes recomendados (visible solo para el reclutador propietario de la vacante) -->
    <v-card v-if="vacantDetail && vacantDetail.user && vacantDetail.user.id == userId" elevation="10" class="mt-6">
        <v-card-item>
            <v-container>
                <!-- Título y descripción -->
                <v-row>
                    <v-col cols="12">
                        <h2 class="text-h4 mb-3">Estudiantes Recomendados</h2>
                        <p class="text-subtitle-1 mb-6">
                            Estos estudiantes han sido recomendados en base a la coincidencia de sus habilidades 
                            con los requisitos de la vacante.
                        </p>
                    </v-col>
                </v-row>
                
                <!-- Indicador de carga -->
                <v-row v-if="isLoadingRecommendations">
                    <v-col cols="12" class="d-flex justify-center">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </v-col>
                </v-row>
                
                <!-- Mensaje si no hay recomendaciones -->
                <v-row v-else-if="recommendedStudents.length === 0">
                    <v-col cols="12">
                        <v-alert type="info" variant="tonal">
                            No se encontraron estudiantes que coincidan con los requisitos de la vacante.
                        </v-alert>
                    </v-col>
                </v-row>
                
                <!-- Cards de estudiantes recomendados -->
                <v-row v-else>
                    <!-- Estudiante con mejor match -->
                    <v-col cols="12" v-if="recommendedStudents.length > 0">
                        <v-alert color="success" icon="mdi-trophy" variant="tonal" class="mb-4">
                            El estudiante <strong>{{ recommendedStudents[0].name }} {{ recommendedStudents[0].lastName }}</strong> 
                            tiene la mejor coincidencia con un {{ recommendedStudents[0].matchPercentage }}% 
                            de compatibilidad con los requisitos de la vacante.
                        </v-alert>
                    </v-col>
                    
                    <!-- Lista de estudiantes recomendados -->
                    <v-col cols="12" md="4" sm="6" v-for="(user, index) in recommendedStudents" :key="user.userId">
                        <v-card elevation="3" class="mb-4 recommended-student-card">
                            <!-- Badge para el mejor match -->
                            <v-badge
                                v-if="index === 0"
                                color="success"
                                icon="mdi-star"
                                location="top end"
                            ></v-badge>
                            
                            <!-- Contenido de la card -->
                            <v-card-item>
                                <div class="d-flex align-center mb-4">
                                    <v-avatar size="80" color="secondary" class="userImage mr-4">
                                        <img :src="user.picture || UserImage" alt="Foto de perfil" class="profile-image" />
                                    </v-avatar>
                                    <div class="user-info">
                                        <v-card-title class="text-h5 mb-1 pa-0">
                                            {{ user.name }} {{ user.lastName }}
                                        </v-card-title>
                                        <v-card-subtitle class="pa-0 text-medium-emphasis">
                                            {{ user.email }}
                                        </v-card-subtitle>
                                        <v-card-subtitle v-if="user.university" class="pa-0 text-medium-emphasis">
                                            {{ user.university }}
                                        </v-card-subtitle>
                                    </div>
                                </div>
                                
                                <!-- Indicador de coincidencia -->
                                <v-divider class="mb-3"></v-divider>
                                <div class="d-flex align-center justify-space-between mb-4">
                                    <span class="text-subtitle-1 font-weight-bold">Nivel de coincidencia:</span>
                                    <v-chip
                                        :color="getMatchColor(user.matchPercentage)"
                                        class="font-weight-bold"
                                    >
                                        {{ user.matchPercentage }}%
                                    </v-chip>
                                </div>
                                
                                <!-- Habilidades coincidentes -->
                                <div class="mb-2">
                                    <span class="text-subtitle-2 font-weight-bold">Habilidades requeridas que posee:</span>
                                    <v-chip-group class="mt-2">
                                        <v-chip
                                            v-for="(count, skill) in user.skillFrequency"
                                            :key="skill"
                                            color="primary"
                                            variant="tonal"
                                            size="small"
                                            class="ma-1"
                                        >
                                            {{ skill }} 
                                            <span v-if="count > 1" class="ml-1">({{ count }})</span>
                                        </v-chip>
                                    </v-chip-group>
                                </div>
                                
                                <!-- Score de coincidencia -->
                                <div class="text-subtitle-2 text-medium-emphasis mt-2">
                                    Score de coincidencia: <strong>{{ user.matchScore }}</strong>
                                </div>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-item>
    </v-card>
</template>

<style scoped>
.recommended-student-card {
  position: relative;
  transition: transform 0.2s ease-in-out;
}

.recommended-student-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.userImage {
  border: 3px solid rgb(255, 255, 255);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex-shrink: 0;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.user-info {
  flex: 1;
  min-width: 0; /* Permite que el contenedor se encoja si es necesario */
  overflow: hidden; /* Oculta el contenido que desborda */
}

.user-info .v-card-title,
.user-info .v-card-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
