<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios, { AxiosError } from 'axios';
import { router } from '@/router';
import UpdateProjectForm from './UpdateProject.vue';
import EnrollForm from './enrolls/CreateEnrollForm.vue';
import UserImage from '@/assets/images/profile/user-5.jpg';

const page = ref({ title: 'Detalles del Proyecto' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Detalles Proyecto', disabled: true, href: '#' }
]);

const route = useRoute();
const authStore = useAuthStore();
const userId = authStore.userId;
const userRole = authStore.userRole;

const projectId = route.params.id;

const projectDetail = ref<any | null>(null);
const aceptedEnrollsList = ref<any[]>([]);
const pendingEnrollsList = ref<any[]>([]);
const recommendedUsers = ref<any[]>([]);
const isLoadingRecommendations = ref(false);

const showEditForm = ref(false);
const showConfirmation = ref(false);
const error = ref<string | null>(null);
const tab = ref(null);
const statusColors = {
  "abierto": "info",
  "progreso": "primary",
  "completado": "success",
  "cancelado": "error"
};
/*Header Data [Table headers and sorting]*/
const sortBy:any  = ref([
    { key: 'name', order: 'desc' }
]);
const headers : any = ref([
    { title: '', align: 'start', key: 'picture', sortable: false },
    { title: 'Nombre', align: 'start', key: 'name' },
    { title: 'Fecha', align: 'start', key: 'dateCreated' },
    { title: 'Comentarios', align: 'start', key: 'comments', sortable: false },
    { title: 'Acciones', align: 'start', key: '', sortable: false }
]);

onMounted(async () => {
    try {
        const response = await axios.get(`http://localhost:3000/projects/project/detail/${projectId}`);
        console.log('response', response.data)
        if (!response.data) { // If no response data, throw error
            error.value = 'Oferta laboral no encontrada.';
        } else { // The vacant belong to the currUser, proceed to get applications 
            projectDetail.value = response.data;
            // Get enrolls related
            const _response = await axios.get(`http://localhost:3000/enrolls/list-by/project/${projectId}`);
            pendingEnrollsList.value = _response.data.filter((e: { status: string; }) => e.status === 'Pendiente');
            aceptedEnrollsList.value = _response.data.filter((e: { status: string; }) => e.status === 'Aceptado');
            
            // Si el usuario es docente, cargar usuarios recomendados
            if (userRole === 'Docente') {
                await fetchRecommendedUsers();
            }
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

// Función para obtener usuarios recomendados para el proyecto
const fetchRecommendedUsers = async () => {
    isLoadingRecommendations.value = true;
    try {
        const response = await axios.get(`http://localhost:3000/projects/recommend-users-for-project/${projectId}`);
        recommendedUsers.value = response.data.recommendedUsers || [];
        
        // Ordenar por porcentaje de coincidencia (de mayor a menor)
        recommendedUsers.value.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
    } catch (err) {
        console.error('Error al obtener usuarios recomendados:', err);
        snackbarMessage.value = 'Error al cargar usuarios recomendados';
        alertType.value = 'error';
        showAlert.value = true;
    } finally {
        isLoadingRecommendations.value = false;
    }
};

// Función para editar un proyecto
const editProject = () => {
  showEditForm.value = true;
};
// Función para cancelar la edición
const cancelEdit = () => {
  showEditForm.value = false;
};
// Función para manejar la actualización del proyecto
const handleUpdateProject = (updatedProject: 
    { name: any; status: any; category: any; description: any; requirements: any; startDate: any; endDate: any; }) => {
    if (projectDetail.value) {
        projectDetail.value.name = updatedProject.name;
        projectDetail.value.status = updatedProject.status;
        projectDetail.value.category = updatedProject.category;
        projectDetail.value.description = updatedProject.description;
        projectDetail.value.requirements = updatedProject.requirements;
        projectDetail.value.startDate = updatedProject.startDate;
        projectDetail.value.endDate = updatedProject.endDate;
    }
  showEditForm.value = false;
};
//Funcion para manejar eliminar un proyecto
const handleDeleteProject = () => { 
    showConfirmation.value = true; 
};
const confirmDelete = async () => {
    try {
        await axios.delete(`http://localhost:3000/projects/delete/${projectId}`);
        router.push('/projects/list-all');
    } catch (err) {
        console.log('Error', err);
    }
    showConfirmation.value = false;
};

// Funciones para notificar sobre enrolls
const showAlert = ref(false); // Controlar la visibilidad del snackbar
const alertType = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarMessage = ref(''); // Mensaje para mostrar en el snackbar
const handleEnrollSaved = (success: boolean) => {
    if (success) {
        snackbarMessage.value = '¡Tu solicitud fue enviada con éxito!';
        alertType.value = 'success';
    } else {
        snackbarMessage.value = 'Hubo un error al enviar la solicitud. Intenta nuevamente.';
        alertType.value = 'error';
    }
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 5000);
};
const handleEnrollDeleted = (success: boolean) => {
    if (success) {
        snackbarMessage.value = '¡Tu solicitud fue eliminada!';
        alertType.value = 'success';
    } else {
        snackbarMessage.value = 'Hubo un error al eliminar la solicitud. Intenta nuevamente.';
        alertType.value = 'error';
    }
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 5000);
};

const aceptOrRejectStudent = (enrollId: string, status: string) => {
    try {
        if (!enrollId || !status) return;
        // Actualizar desde backend y db
        axios.put(`http://localhost:3000/enrolls/update-status/${enrollId}/${status}`);
        // Update component
        if (status === 'Aceptado') {
            // Buscar el estudiante en la lista de pendientes
            const studentIndex = pendingEnrollsList.value.findIndex(enroll => enroll.id === enrollId);
            if (studentIndex !== -1) { // Mover el estudiante a la lista de aceptados
                const [student] = pendingEnrollsList.value.splice(studentIndex, 1);
                aceptedEnrollsList.value.push(student);
            }
        } else if (status === 'Rechazado') {
            // Eliminar el estudiante de la lista de pendientes
            pendingEnrollsList.value = pendingEnrollsList.value.filter(enroll => enroll.id !== enrollId);
        }
    } catch(err) {
        console.error('Error:', err);
        const errorAxios = err as AxiosError;
        // Manejar el error en función del código de estado
        if (errorAxios.response) {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
    }
};
const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || '';  
};
const formatDateTime = (date: string) => {
  if (!date) return 'Indefinido';
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
    <v-alert v-if="showAlert" :type="alertType"  variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert>
    
    <!-- Card principal con pestañas -->
    <v-card elevation="10" class="mb-6">
        <!-- Tabs para detalle - solicitudes -->
        <v-card-item>
            <v-tabs v-model="tab" color="primary" class="border-bottom">
                <v-tab value="one">General</v-tab>
                <v-tab value="two">Participantes</v-tab>
                <v-tab value="three" v-if="projectDetail?.professor.id === userId">Solicitudes</v-tab>
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
                    <!-- Main information of the project -->
                    <v-window-item value="one">
                        <!-- Only view -->
                        <div v-if="!showEditForm" class="bg-light mt-6 pa-6 rounded-md">
                            <v-row>
                                <v-col cols="12" md="12">
                                    <h3>Proyecto: {{ projectDetail?.name }}</h3>
                                    <span class="text-subtitle-2 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        Docente: {{ projectDetail?.professor.name }} {{ projectDetail?.professor.lastName }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Fecha de Inicio</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ formatDateTime(projectDetail?.startDate) }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Fecha Fin</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ formatDateTime(projectDetail?.endDate) }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Categoría</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ projectDetail?.category }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Estado</h3>
                                    <v-chip class="font-weight-bold bg-light" :color="getStatusColor(projectDetail?.status)" size="small" rounded="sm">
                                        {{ capitalizeFirstLetter(projectDetail?.status || '') }}
                                    </v-chip>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <h3>Descripción</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        {{ projectDetail?.description }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <h3>Habilidades Requeridas</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        {{ projectDetail?.requirements }}
                                    </span>
                                </v-col>
                            </v-row>
                        </div>
                        <!-- Botones para editar - eliminar -->
                        <div v-if="!showEditForm && projectDetail?.professor.id === userId" class="d-flex ga-3 justify-end mt-6">
                            <v-btn @click.stop="handleDeleteProject()" color="error" flat >
                                Eliminar
                            </v-btn>
                            <v-btn  @click.stop="editProject()" color="primary" flat
                                >Editar</v-btn
                            >
                        </div>
                        <!-- Boton para enviar solicitud *solo estudiantes -->
                        <div v-if="!showEditForm && userRole.toLowerCase() === 'estudiante' && projectDetail?.status === 'abierto'" class="d-flex ga-3 justify-end mt-6">
                            <EnrollForm :project="projectDetail?.id" @enrollSaved="handleEnrollSaved" @enrollDeleted="handleEnrollDeleted"/>
                        </div>

                        <!-- Editing form -->
                        <div v-if="showEditForm && projectDetail?.professor.id === userId">
                            <UpdateProjectForm
                                :project="projectDetail"
                                @updateProject="handleUpdateProject"
                                @cancelEdit="cancelEdit()"
                            />
                        </div>
                    </v-window-item>
                    <!-- Data table with the ACEPTED students  -->
                    <v-window-item value="two">
                        <v-col cols="12">
                            <v-data-table items-per-page="5" :headers="headers" :items="aceptedEnrollsList" item-value="name"
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
                                        <td>{{ formatDateTime(item.dateCreated) }}</td>
                                        <td>{{ item.comments }}</td>
                                        <td>
                                            <div class="d-flex align-center">
                                                <v-tooltip text="Rechazar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="error" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Rechazado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-close</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                         </v-col>
                    </v-window-item>
                    <!-- Data table with the PENDING students  -->
                    <v-window-item value="three" v-if="projectDetail?.professor.id === userId">
                        <v-col cols="12">
                            <v-data-table items-per-page="5" :headers="headers" :items="pendingEnrollsList" item-value="name"
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
                                        <td>{{ formatDateTime(item.dateCreated) }}</td>
                                        <td>{{ item.comments }}</td>
                                        <td>
                                            <div class="d-flex align-center">
                                                <v-tooltip text="Aceptar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="success" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Aceptado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                                <v-tooltip text="Rechazar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="error" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Rechazado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-close</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                         </v-col>
                    </v-window-item>
                </v-window>
            </div>
        </v-card-item>
    </v-card>

    <!-- Confirmation Dialog Delete Project-->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Proyecto</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar este proyecto?</h5>
                <h6>Al eliminar el proyecto, los participantes ya no podrán acceder a él y todas las solicitudes asociadas serán canceladas de manera permanente.</h6>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="tonal" class="px-4" @click="showConfirmation = false">Cancelar</v-btn>
                <v-btn color="error" class="px-4" variant="tonal" @click="confirmDelete">Si, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- Sección de estudiantes recomendados *** Solo disponible para el docente que creo el proyecto -->
    <v-card v-if="projectDetail?.professor.id === userId" elevation="10" class="mt-6">
        <v-card-item>
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <h2 class="text-h4 mb-3">Estudiantes Recomendados</h2>
                        <p class="text-subtitle-1 mb-6">
                            Estos estudiantes han sido recomendados basados en la coincidencia de sus habilidades 
                            con los requerimientos del proyecto.
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
                <v-row v-else-if="recommendedUsers.length === 0">
                    <v-col cols="12">
                        <v-alert type="info" variant="tonal">
                            No se encontraron estudiantes que coincidan con los requisitos del proyecto.
                        </v-alert>
                    </v-col>
                </v-row>
                
                <!-- Cards de estudiantes recomendados -->
                <v-row v-else>
                    <!-- Estudiante con mejor match -->
                    <v-col cols="12" v-if="recommendedUsers.length > 0">
                        <v-alert color="success" icon="mdi-trophy" variant="tonal" class="mb-4">
                            El estudiante <strong>{{ recommendedUsers[0].name }} {{ recommendedUsers[0].lastName }}</strong> 
                            tiene la mejor coincidencia con un {{ recommendedUsers[0].matchPercentage }}% 
                            de compatibilidad con los requisitos del proyecto.
                        </v-alert>
                    </v-col>
                    
                    <!-- Lista de estudiantes recomendados -->
                    <v-col cols="12" md="4" sm="6" v-for="(user, index) in recommendedUsers" :key="user.userId">
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
                                    <v-avatar size="100" color="secondary" class="userImage">
                                        <img :src="user.picture || UserImage" alt="Mathew" width="100" />
                                    </v-avatar>
                                    <div>
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

.userImage {
    border: 4px solid rgb(255, 255, 255);
    position: relative; /* Asegúrate de que el contenedor tenga position: relative */
}

.recommended-student-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}
</style>

