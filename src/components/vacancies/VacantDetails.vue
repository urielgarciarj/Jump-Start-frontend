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
import { CircleIcon } from 'vue-tabler-icons';

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
    <div class="vacant-details-page-modern">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        
        <!-- Error Alert -->
        <v-alert 
            v-if="error" 
            type="error" 
            variant="tonal" 
            dismissible
            class="alert-modern mb-6"
            border="start"
        >
            <template v-slot:prepend>
                <v-icon>mdi-alert-circle</v-icon>
            </template>
            {{ error }}
        </v-alert>
        
        <v-card v-if="!error" class="details-card-modern" elevation="0">
            <!-- Header con información de la empresa -->
            <div class="card-header-modern">
                <div class="header-content">
                    <div class="header-icon-wrapper">
                        <v-icon size="48" color="primary">mdi-briefcase</v-icon>
                    </div>
                    <div class="header-text">
                        <h2 class="company-title">{{ vacantDetail?.company }}</h2>
                        <p class="recruiter-info">
                            <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                            Reclutador: 
                            <RouterLink 
                                class="recruiter-link" 
                                :to="`/profile/${vacantDetail?.user?.id}`"
                            >
                                {{ vacantDetail?.user?.name }} {{ vacantDetail?.user?.lastName }}
                            </RouterLink>
                        </p>
                    </div>
                </div>
            </div>
            
            <v-card-item class="pa-0">
                <!-- Tabs modernos -->
                <v-tabs v-model="tab" color="primary" class="tabs-modern" bg-color="transparent">
                    <v-tab value="one" class="tab-modern">
                        <v-icon start>mdi-information-outline</v-icon>
                        General
                    </v-tab>
                    <v-tab value="two" class="tab-modern">
                        <v-icon start>mdi-account-group</v-icon>
                        Solicitudes ({{ applicationsList.length }})
                    </v-tab>
                </v-tabs>
                
                <v-divider></v-divider>
                
                <div class="tab-content-wrapper">
                    <v-window v-model="tab">
                        <v-window-item value="one">
                            <!-- Vista de detalles -->
                            <div v-if="!showEditForm" class="details-content-modern">
                                <!-- Información principal -->
                                <div class="info-grid-section">
                                    <div class="info-card-modern">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="primary">mdi-format-title</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Título</span>
                                            <span class="info-value">{{ vacantDetail?.name }}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card-modern">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="primary">mdi-tag</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Categoría</span>
                                            <span class="info-value">{{ vacantDetail?.category }}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card-modern">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="primary">mdi-monitor</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Modalidad</span>
                                            <span class="info-value">{{ vacantDetail?.modality }}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card-modern status-card">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="success">mdi-check-circle</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Estado</span>
                                            <v-chip 
                                                color="success" 
                                                class="status-chip-modern" 
                                                size="small" 
                                                rounded="lg"
                                            >
                                                {{ capitalizeFirstLetter(vacantDetail?.status || '') }}
                                            </v-chip>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card-modern" v-if="vacantDetail?.location">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="primary">mdi-map-marker</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Ubicación</span>
                                            <span class="info-value">{{ vacantDetail?.location }}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card-modern" v-if="vacantDetail?.level">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="primary">mdi-account-star</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Nivel</span>
                                            <span class="info-value">{{ vacantDetail?.level }}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="info-card-modern salary-card" v-if="vacantDetail?.salary">
                                        <div class="info-icon-wrapper">
                                            <v-icon color="success">mdi-currency-usd</v-icon>
                                        </div>
                                        <div class="info-content">
                                            <span class="info-label">Salario</span>
                                            <span class="info-value salary-value">{{ vacantDetail?.salary }} {{ vacantDetail?.salaryPeriod }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Descripción -->
                                <div class="description-section-modern">
                                    <h3 class="section-title-modern">
                                        <v-icon class="mr-2" color="primary">mdi-text</v-icon>
                                        Descripción del Empleo
                                    </h3>
                                    <div class="description-content-modern" v-html="vacantDetail?.description"></div>
                                </div>
                                
                                <!-- Habilidades Requeridas -->
                                <div class="requirements-section-modern">
                                    <h3 class="section-title-modern">
                                        <v-icon class="mr-2" color="primary">mdi-check-circle</v-icon>
                                        Habilidades Requeridas
                                    </h3>
                                    <div class="requirements-content-modern">
                                        {{ vacantDetail?.requirements }}
                                    </div>
                                </div>
                                
                                <!-- Botones de acción -->
                                <div class="action-buttons-modern">
                                    <v-btn 
                                        @click.stop="handleDeleteVacant()" 
                                        color="error" 
                                        size="large"
                                        variant="tonal"
                                        class="action-btn-modern"
                                    >
                                        <v-icon start>mdi-delete</v-icon>
                                        Eliminar
                                    </v-btn>
                                    <v-btn 
                                        @click.stop="editPost()" 
                                        color="primary" 
                                        size="large"
                                        class="action-btn-modern edit-btn-modern"
                                    >
                                        <v-icon start>mdi-pencil</v-icon>
                                        Editar
                                    </v-btn>
                                </div>
                            </div>

                            <!-- Formulario de edición -->
                            <div v-if="showEditForm" class="edit-form-wrapper">
                                <UpdateVacantForm
                                    :vacant="vacantDetail"
                                    @updateVacant="handleUpdateVacant"
                                    @cancelEdit="cancelEdit()"
                                />
                            </div>
                        </v-window-item>
                        
                        <v-window-item value="two">
                            <!-- Tabla de solicitudes -->
                            <div class="applications-section-modern">
                                <div class="applications-header">
                                    <h3 class="section-title-modern">
                                        <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
                                        Solicitudes Recibidas
                                    </h3>
                                    <v-chip color="primary" variant="tonal" size="small">
                                        Total: {{ applicationsList.length }}
                                    </v-chip>
                                </div>
                                
                                <v-card class="table-card-modern" elevation="0">
                                    <v-data-table 
                                        items-per-page="5" 
                                        :headers="headers" 
                                        :items="applicationsList" 
                                        item-value="name"
                                        v-model:sort-by="sortBy" 
                                        class="modern-data-table"
                                    >
                                        <template v-slot:item.picture="{ item }">
                                            <v-avatar size="40" class="table-avatar"> 
                                                <template v-if="item.user?.profile?.picture">
                                                    <img :src="item.user.profile.picture" alt="avatar" />
                                                </template>
                                                <template v-else>
                                                    {{ item.name.charAt(0).toUpperCase() }}
                                                </template>
                                            </v-avatar>
                                        </template>
                                        <template v-slot:item.name="{ item }">
                                            <span class="table-name">{{ item.name }}</span>
                                        </template>
                                        <template v-slot:item.email="{ item }">
                                            <span class="table-email">{{ item.email }}</span>
                                        </template>
                                        <template v-slot:item.dateCreated="{ item }">
                                            <span class="table-date">{{ formatDateTime(item.dateCreated) }}</span>
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </div>
                        </v-window-item>
                    </v-window>
                </div>
            </v-card-item>
        </v-card>

        <!-- Dialog de confirmación de eliminación -->
        <v-dialog v-model="showConfirmation" max-width="500px" class="delete-dialog-modern">
            <v-card class="dialog-card-modern">
                <div class="dialog-header-modern">
                    <v-icon size="48" color="error">mdi-alert-circle</v-icon>
                    <h3 class="dialog-title">Eliminar Oferta Laboral</h3>
                </div>
                <v-card-text class="dialog-content-modern">
                    <p class="dialog-message">
                        ¿Estás seguro de que deseas eliminar esta oferta laboral?
                    </p>
                    <p class="dialog-warning">
                        Al eliminar la oferta, se eliminarán también todas las solicitudes asociadas a ella de manera permanente.
                    </p>
                </v-card-text>
                <v-card-actions class="dialog-actions-modern">
                    <v-btn 
                        variant="tonal" 
                        size="large"
                        @click="showConfirmation = false"
                        class="dialog-btn-cancel"
                    >
                        Cancelar
                    </v-btn>
                    <v-btn 
                        color="error" 
                        size="large"
                        variant="tonal" 
                        @click="confirmDelete"
                        class="dialog-btn-confirm"
                    >
                        <v-icon start>mdi-delete</v-icon>
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        
        <!-- Sección de estudiantes recomendados -->
        <v-card 
            v-if="vacantDetail && vacantDetail.user && vacantDetail.user.id == userId" 
            class="recommended-students-card-modern mt-6" 
            elevation="0"
        >
            <div class="recommended-header-modern">
                <div class="recommended-header-content">
                    <div class="recommended-icon-wrapper">
                        <v-icon size="40" color="success">mdi-star-circle</v-icon>
                    </div>
                    <div class="recommended-header-text">
                        <h2 class="recommended-title">Estudiantes Recomendados</h2>
                        <p class="recommended-subtitle">
                            Estos estudiantes han sido recomendados en base a la coincidencia de sus habilidades 
                            con los requisitos de la vacante.
                        </p>
                    </div>
                </div>
            </div>
            
            <v-card-item class="pa-4">
                <!-- Indicador de carga -->
                <div v-if="isLoadingRecommendations" class="loading-wrapper">
                    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                    <p class="mt-4 text-h6">Cargando recomendaciones...</p>
                </div>
                
                <!-- Mensaje si no hay recomendaciones -->
                <v-alert 
                    v-else-if="recommendedStudents.length === 0"
                    type="info" 
                    variant="tonal"
                    class="alert-modern"
                    border="start"
                >
                    <template v-slot:prepend>
                        <v-icon>mdi-information-outline</v-icon>
                    </template>
                    <div class="text-h6 mb-1">No se encontraron estudiantes recomendados</div>
                    <div>No hay estudiantes que coincidan con los requisitos de la vacante en este momento.</div>
                </v-alert>
                
                <!-- Cards de estudiantes recomendados -->
                <div v-else>
                    <!-- Alerta del mejor match -->
                    <v-alert 
                        color="success" 
                        icon="mdi-trophy" 
                        variant="tonal" 
                        class="mb-4 alert-modern best-match-alert"
                        border="start"
                        density="compact"
                    >
                        <div class="text-subtitle-1 mb-1 font-weight-bold">¡Mejor Coincidencia!</div>
                        <div class="text-body-2">
                            El estudiante <strong>{{ recommendedStudents[0].name }} {{ recommendedStudents[0].lastName }}</strong> 
                            tiene la mejor coincidencia con un <strong>{{ recommendedStudents[0].matchPercentage }}%</strong> 
                            de compatibilidad con los requisitos de la vacante.
                        </div>
                    </v-alert>
                    
                    <!-- Grid de estudiantes -->
                    <div class="students-grid-modern">
                        <v-card 
                            v-for="(user, index) in recommendedStudents" 
                            :key="user.userId"
                            class="student-card-modern"
                            elevation="0"
                        >
                            <!-- Badge para el mejor match -->
                            <div v-if="index === 0" class="best-match-badge">
                                <v-icon size="16">mdi-star</v-icon>
                                <span>Mejor Match</span>
                            </div>
                            
                            <v-card-item class="pa-3">
                                <div class="student-header-modern">
                                    <v-avatar size="56" class="student-avatar-modern">
                                        <img :src="user.picture || UserImage" alt="Foto de perfil" class="avatar-image" />
                                    </v-avatar>
                                    <div class="student-info-modern">
                                        <RouterLink 
                                            class="student-name-link" 
                                            :to="`/profile/${user?.userId}`"
                                        >
                                            <h4 class="student-name-modern">{{ user.name }} {{ user.lastName }}</h4>
                                        </RouterLink>
                                        <p class="student-email-modern">{{ user.email }}</p>
                                        <p v-if="user.university" class="student-university-modern">{{ user.university }}</p>
                                    </div>
                                </div>
                                
                                <v-divider class="my-3"></v-divider>
                                
                                <div class="match-info-modern">
                                    <div class="match-percentage-modern">
                                        <span class="match-label-modern">Coincidencia:</span>
                                        <v-chip
                                            :color="getMatchColor(user.matchPercentage)"
                                            class="match-chip-modern"
                                            size="small"
                                        >
                                            {{ user.matchPercentage }}%
                                        </v-chip>
                                    </div>
                                    <div class="match-score-modern">
                                        <span class="score-label">Score:</span>
                                        <strong class="score-value">{{ user.matchScore }}</strong>
                                    </div>
                                </div>
                                
                                <div v-if="user.skillFrequency" class="skills-section-modern">
                                    <p class="skills-label-modern">Habilidades coincidentes:</p>
                                    <div class="skills-chips-modern">
                                        <v-chip
                                            v-for="(count, skill) in user.skillFrequency"
                                            :key="skill"
                                            color="primary"
                                            variant="tonal"
                                            size="small"
                                            class="skill-chip-modern"
                                        >
                                            {{ skill }} 
                                            <span v-if="count > 1" class="skill-count">({{ count }})</span>
                                        </v-chip>
                                    </div>
                                </div>
                            </v-card-item>
                        </v-card>
                    </div>
                </div>
            </v-card-item>
        </v-card>
    </div>
</template>

<style scoped>
.vacant-details-page-modern {
    width: 100%;
    animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.alert-modern {
    border-radius: 12px;
    border-left: 4px solid;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.details-card-modern {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.card-header-modern {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    padding: 32px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.header-text {
    flex: 1;
}

.company-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.recruiter-info {
    font-size: 1rem;
    color: #64748b;
    display: flex;
    align-items: center;
    margin: 0;
}

.recruiter-link {
    color: rgb(99, 102, 241);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-left: 4px;
}

.recruiter-link:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.tabs-modern {
    padding: 0 24px;
}

.tab-modern {
    text-transform: none;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.tab-content-wrapper {
    padding: 24px;
}

.details-content-modern {
    animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.info-grid-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}

.info-card-modern {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 12px;
    border-left: 3px solid rgb(99, 102, 241);
    transition: all 0.2s ease;
}

.info-card-modern:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    transform: translateX(4px);
}

.info-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    flex-shrink: 0;
}

.info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
}

.status-card {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%);
    border-left-color: rgb(76, 175, 80);
}

.status-chip-modern {
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.salary-card {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%);
    border-left-color: rgb(76, 175, 80);
}

.salary-value {
    color: rgb(76, 175, 80);
    font-weight: 700;
    font-size: 1.1rem;
}

.description-section-modern,
.requirements-section-modern {
    margin-bottom: 32px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border-radius: 12px;
    border-left: 3px solid rgb(99, 102, 241);
}

.section-title-modern {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
}

.description-content-modern {
    color: #475569;
    line-height: 1.8;
    font-size: 0.95rem;
}

.requirements-content-modern {
    color: #475569;
    line-height: 1.6;
    font-size: 0.95rem;
}

.action-buttons-modern {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 2px solid rgba(99, 102, 241, 0.1);
}

.action-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    padding: 12px 24px;
}

.edit-btn-modern {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.edit-btn-modern:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.applications-section-modern {
    padding: 24px 0;
}

.applications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.table-card-modern {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.modern-data-table :deep(.v-data-table__thead) {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
}

.modern-data-table :deep(.v-data-table__tr) {
    transition: all 0.2s ease;
}

.modern-data-table :deep(.v-data-table__tr:hover) {
    background-color: rgba(99, 102, 241, 0.03);
}

.table-avatar {
    border: 2px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.table-name {
    font-weight: 600;
    color: #1e293b;
}

.table-email {
    color: #64748b;
}

.table-date {
    color: #64748b;
    font-size: 0.9rem;
}

.delete-dialog-modern :deep(.v-overlay__content) {
    border-radius: 16px;
}

.dialog-card-modern {
    border-radius: 16px;
    overflow: hidden;
}

.dialog-header-modern {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
    padding: 24px;
    text-align: center;
    border-bottom: 2px solid rgba(244, 67, 54, 0.2);
}

.dialog-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 12px;
}

.dialog-content-modern {
    padding: 24px;
}

.dialog-message {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12px;
}

.dialog-warning {
    color: #64748b;
    line-height: 1.6;
}

.dialog-actions-modern {
    padding: 16px 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.dialog-btn-cancel,
.dialog-btn-confirm {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    padding: 12px 24px;
}

.recommended-students-card-modern {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.recommended-header-modern {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
    padding: 20px 24px;
    border-bottom: 2px solid rgba(76, 175, 80, 0.1);
}

.recommended-header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.recommended-icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(56, 142, 60) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.recommended-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
}

.recommended-subtitle {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
}

.loading-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: rgb(99, 102, 241);
}

.best-match-alert {
    border-radius: 12px;
}

.students-grid-modern {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.student-card-modern {
    border-radius: 12px !important;
    border: 1px solid rgba(99, 102, 241, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: visible;
}

.student-card-modern:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
    border-color: rgba(99, 102, 241, 0.3);
}

.best-match-badge {
    position: absolute;
    top: -10px;
    right: 12px;
    background: linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(56, 142, 60) 100%);
    color: white;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
    z-index: 1;
}

.student-header-modern {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.student-avatar-modern {
    border: 2px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    overflow: hidden;
}

.student-avatar-modern .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.student-info-modern {
    flex: 1;
    min-width: 0;
}

.student-name-link {
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
}

.student-name-link:hover .student-name-modern {
    color: rgb(99, 102, 241);
}

.student-name-modern {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 3px;
    transition: all 0.2s ease;
    line-height: 1.3;
}

.student-email-modern {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    line-height: 1.3;
}

.student-university-modern {
    font-size: 0.8rem;
    color: #94a3b8;
    margin: 2px 0 0 0;
    line-height: 1.3;
}

.match-info-modern {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.match-percentage-modern {
    display: flex;
    align-items: center;
    gap: 8px;
}

.match-label-modern {
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
}

.match-chip-modern {
    font-weight: 700;
}

.match-score-modern {
    display: flex;
    align-items: center;
    gap: 4px;
}

.score-label {
    font-size: 0.8rem;
    color: #64748b;
}

.score-value {
    font-size: 0.9rem;
    color: rgb(99, 102, 241);
}

.skills-section-modern {
    margin-top: 12px;
}

.skills-label-modern {
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    display: block;
}

.skills-chips-modern {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.skill-chip-modern {
    font-weight: 600;
    transition: all 0.2s ease;
    border-radius: 8px;
}

.skill-chip-modern:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.skill-count {
    font-size: 0.75rem;
    opacity: 0.8;
}

@media (max-width: 960px) {
    .header-content,
    .recommended-header-content {
        flex-direction: column;
        text-align: center;
    }
    
    .info-grid-section {
        grid-template-columns: 1fr;
    }
    
    .action-buttons-modern {
        flex-direction: column;
    }
    
    .action-btn-modern {
        width: 100%;
    }
    
    .students-grid-modern {
        grid-template-columns: 1fr;
    }
    
    .applications-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}
</style>
