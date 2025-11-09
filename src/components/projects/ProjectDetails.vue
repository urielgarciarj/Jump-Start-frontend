<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios, { AxiosError } from 'axios';
import { router } from '@/router';
import UpdateProjectForm from './UpdateProject.vue';
import EnrollForm from './enrolls/CreateEnrollForm.vue';
import UserImage from '@/assets/images/profile/user-5.jpg';
import { CircleIcon } from 'vue-tabler-icons';
import { Icon } from '@iconify/vue';

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
    <div class="project-details-container">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        
        <v-alert 
            v-if="showAlert" 
            :type="alertType"  
            variant="tonal" 
            class="mb-4 alert-modern" 
            dismissible 
            @mouseleave="showAlert = false"
            rounded="lg"
        >
            <template v-slot:prepend>
                <Icon icon="mdi:check-circle-outline" height="24" />
            </template>
            <div class="font-weight-medium">{{ snackbarMessage }}</div>
        </v-alert>
        
        <!-- Card principal con pestañas -->
        <v-card variant="outlined" rounded="lg" class="project-details-card mb-6">
            <!-- Tabs para detalle - solicitudes -->
            <v-card-item class="pa-0">
                <v-tabs v-model="tab" color="primary" class="project-tabs">
                    <v-tab value="one" class="tab-modern">
                        <Icon icon="mdi:information-outline" height="18" class="mr-2" />
                        General
                    </v-tab>
                    <v-tab value="two" class="tab-modern">
                        <Icon icon="mdi:account-group-outline" height="18" class="mr-2" />
                        Participantes
                    </v-tab>
                    <v-tab value="three" v-if="projectDetail?.professor.id === userId" class="tab-modern">
                        <Icon icon="mdi:clipboard-text-outline" height="18" class="mr-2" />
                        Solicitudes
                    </v-tab>
                </v-tabs>
            <div class="pa-6">
                <v-row v-if="error">
                    <v-col cols="12">
                        <v-alert 
                            v-if="error" 
                            type="error" 
                            variant="tonal" 
                            dismissible
                            rounded="lg"
                        >
                            {{ error }}
                        </v-alert>
                    </v-col>
                </v-row>
                
                <v-window v-model="tab" v-if="!error">
                    <!-- Main information of the project -->
                    <v-window-item value="one">
                        <!-- Only view -->
                        <div v-if="!showEditForm" class="project-info-section pa-6">
                            <div class="project-header-info mb-6">
                                <h2 class="text-h4 font-weight-bold mb-2">{{ projectDetail?.name }}</h2>
                                <div class="d-flex align-center text-body-2 text-medium-emphasis">
                                    <Icon icon="mdi:account-tie-outline" height="18" class="mr-2" />
                                    <RouterLink 
                                        class="text-decoration-none professor-link" 
                                        :to="`/profile/${projectDetail?.professor.id}`"
                                    >
                                        {{ projectDetail?.professor.name }} {{ projectDetail?.professor.lastName }}
                                    </RouterLink>
                                </div>
                            </div>
                            
                            <v-row>
                                <v-col cols="12" md="3">
                                    <div class="info-card pa-4">
                                        <div class="info-label mb-2">
                                            <Icon icon="mdi:calendar-start" height="18" class="mr-2" />
                                            <span class="text-caption font-weight-bold">Fecha de Inicio</span>
                                        </div>
                                        <div class="text-body-2">{{ formatDateTime(projectDetail?.startDate) }}</div>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <div class="info-card pa-4">
                                        <div class="info-label mb-2">
                                            <Icon icon="mdi:calendar-end" height="18" class="mr-2" />
                                            <span class="text-caption font-weight-bold">Fecha Fin</span>
                                        </div>
                                        <div class="text-body-2">{{ formatDateTime(projectDetail?.endDate) }}</div>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <div class="info-card pa-4">
                                        <div class="info-label mb-2">
                                            <Icon icon="mdi:tag-outline" height="18" class="mr-2" />
                                            <span class="text-caption font-weight-bold">Categoría</span>
                                        </div>
                                        <div class="text-body-2">{{ projectDetail?.category }}</div>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <div class="info-card pa-4">
                                        <div class="info-label mb-2">
                                            <Icon icon="mdi:information-outline" height="18" class="mr-2" />
                                            <span class="text-caption font-weight-bold">Estado</span>
                                        </div>
                                        <v-chip 
                                            class="font-weight-bold" 
                                            :color="getStatusColor(projectDetail?.status)" 
                                            size="small" 
                                            rounded="lg"
                                        >
                                            {{ capitalizeFirstLetter(projectDetail?.status || '') }}
                                        </v-chip>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <div class="description-section pa-4 mb-4">
                                        <div class="d-flex align-center mb-3">
                                            <Icon icon="mdi:text-box-outline" height="20" class="mr-2" />
                                            <h3 class="text-h6 font-weight-bold mb-0">Descripción</h3>
                                        </div>
                                        <p class="text-body-2 mb-0">{{ projectDetail?.description }}</p>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <div class="requirements-section pa-4">
                                        <div class="d-flex align-center mb-3">
                                            <Icon icon="mdi:lightbulb-on-outline" height="20" class="mr-2" />
                                            <h3 class="text-h6 font-weight-bold mb-0">Habilidades Requeridas</h3>
                                        </div>
                                        <p class="text-body-2 mb-0">{{ projectDetail?.requirements }}</p>
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                        
                        <!-- Botones para editar - eliminar -->
                        <div v-if="!showEditForm && projectDetail?.professor.id === userId" class="d-flex ga-3 justify-end mt-6">
                            <v-btn 
                                @click.stop="handleDeleteProject()" 
                                color="error" 
                                variant="flat"
                                rounded="lg"
                                class="action-btn-modern"
                            >
                                <Icon icon="mdi:delete-outline" height="18" class="mr-2" />
                                Eliminar
                            </v-btn>
                            <v-btn 
                                @click.stop="editProject()" 
                                color="primary" 
                                variant="flat"
                                rounded="lg"
                                class="action-btn-modern"
                            >
                                <Icon icon="mdi:pencil-outline" height="18" class="mr-2" />
                                Editar
                            </v-btn>
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
                            <div v-if="aceptedEnrollsList.length === 0" class="empty-table-state pa-8 text-center">
                                <Icon icon="mdi:account-group-outline" height="64" class="mb-4 opacity-50" />
                                <h3 class="text-h6 mb-2">No hay participantes</h3>
                                <p class="text-body-2 text-medium-emphasis">Aún no hay estudiantes aceptados en este proyecto.</p>
                            </div>
                            <v-data-table 
                                v-else
                                items-per-page="5" 
                                :headers="headers" 
                                :items="aceptedEnrollsList" 
                                item-value="name"
                                v-model:sort-by="sortBy" 
                                class="modern-table"
                                rounded="lg"
                            >
                                <template v-slot:item="{ item }">
                                    <tr class="table-row-modern">
                                        <td>
                                            <v-avatar size="40" class="table-avatar"> 
                                                <template v-if="item.user.profile?.picture">
                                                    <img :src="item.user.profile?.picture" alt="icon" height="40" />
                                                </template>
                                                <template v-else>
                                                    <div class="avatar-initials">
                                                        {{ item.name.charAt(0).toUpperCase() }}
                                                    </div>
                                                </template>
                                            </v-avatar>
                                        </td>
                                        <td>
                                            <RouterLink 
                                                class="student-name text-decoration-none" 
                                                :to="`/profile/${item?.user.id}`"
                                            >
                                                {{ item.name }}
                                            </RouterLink>
                                        </td>
                                        <td class="text-body-2">{{ formatDateTime(item.dateCreated) }}</td>
                                        <td class="text-body-2">{{ item.comments || 'Sin comentarios' }}</td>
                                        <td v-if="projectDetail?.professor.id === userId">
                                            <v-btn 
                                                icon 
                                                variant="text" 
                                                color="error" 
                                                size="small"
                                                @click="aceptOrRejectStudent(item.id, 'Rechazado')"
                                                class="action-btn-table"
                                            >
                                                <Icon icon="mdi:close" height="18" />
                                                <v-tooltip activator="parent" location="bottom">Rechazar</v-tooltip>
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                         </v-col>
                    </v-window-item>
                    <!-- Data table with the PENDING students  -->
                    <v-window-item value="three" v-if="projectDetail?.professor.id === userId">
                        <v-col cols="12">
                            <div v-if="pendingEnrollsList.length === 0" class="empty-table-state pa-8 text-center">
                                <Icon icon="mdi:clipboard-text-outline" height="64" class="mb-4 opacity-50" />
                                <h3 class="text-h6 mb-2">No hay solicitudes pendientes</h3>
                                <p class="text-body-2 text-medium-emphasis">No hay solicitudes de participación pendientes de revisión.</p>
                            </div>
                            <v-data-table 
                                v-else
                                items-per-page="5" 
                                :headers="headers" 
                                :items="pendingEnrollsList" 
                                item-value="name"
                                v-model:sort-by="sortBy" 
                                class="modern-table"
                                rounded="lg"
                            >
                                <template v-slot:item="{ item }">
                                    <tr class="table-row-modern">
                                        <td>
                                            <v-avatar size="40" class="table-avatar"> 
                                                <template v-if="item.user.profile?.picture">
                                                    <img :src="item.user.profile?.picture" alt="icon" height="40" />
                                                </template>
                                                <template v-else>
                                                    <div class="avatar-initials">
                                                        {{ item.name.charAt(0).toUpperCase() }}
                                                    </div>
                                                </template>
                                            </v-avatar>
                                        </td>
                                        <td>
                                            <RouterLink 
                                                class="student-name text-decoration-none" 
                                                :to="`/profile/${item?.user.id}`"
                                            >
                                                {{ item.name }}
                                            </RouterLink>
                                        </td>
                                        <td class="text-body-2">{{ formatDateTime(item.dateCreated) }}</td>
                                        <td class="text-body-2">{{ item.comments || 'Sin comentarios' }}</td>
                                        <td>
                                            <div class="d-flex align-center gap-2">
                                                <v-btn 
                                                    icon 
                                                    variant="text" 
                                                    color="success" 
                                                    size="small"
                                                    @click="aceptOrRejectStudent(item.id, 'Aceptado')"
                                                    class="action-btn-table"
                                                >
                                                    <Icon icon="mdi:check-circle-outline" height="18" />
                                                    <v-tooltip activator="parent" location="bottom">Aceptar</v-tooltip>
                                                </v-btn>
                                                <v-btn 
                                                    icon 
                                                    variant="text" 
                                                    color="error" 
                                                    size="small"
                                                    @click="aceptOrRejectStudent(item.id, 'Rechazado')"
                                                    class="action-btn-table"
                                                >
                                                    <Icon icon="mdi:close" height="18" />
                                                    <v-tooltip activator="parent" location="bottom">Rechazar</v-tooltip>
                                                </v-btn>
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
    <v-dialog v-model="showConfirmation" max-width="500px" persistent>
        <v-card rounded="lg">
            <v-card-title class="pa-4 bg-error text-white">
                <Icon icon="mdi:alert-circle" height="24" class="mr-2" />
                Eliminar Proyecto
            </v-card-title>
            <v-card-text class="pa-4">
                <p class="text-body-1 mb-2 font-weight-medium">¿Estás seguro de que deseas eliminar este proyecto?</p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                    Al eliminar el proyecto, los participantes ya no podrán acceder a él y todas las solicitudes asociadas serán canceladas de manera permanente.
                </p>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="showConfirmation = false" rounded="lg">Cancelar</v-btn>
                <v-btn color="error" variant="flat" @click="confirmDelete" rounded="lg">Sí, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- Sección de estudiantes recomendados *** Solo disponible para el docente que creo el proyecto -->
    <v-card 
        v-if="projectDetail?.professor.id === userId" 
        variant="outlined" 
        rounded="lg"
        class="recommended-section mt-6"
    >
        <v-card-item class="pa-6">
            <div class="section-header mb-6">
                <div class="d-flex align-center mb-3">
                    <div class="section-icon-wrapper mr-3">
                        <Icon icon="mdi:account-star-outline" height="24" />
                    </div>
                    <h2 class="text-h4 font-weight-bold mb-0">Estudiantes Recomendados</h2>
                </div>
                <p class="text-body-1 text-medium-emphasis mb-0">
                    Estos estudiantes han sido recomendados basados en la coincidencia de sus habilidades 
                    con los requerimientos del proyecto.
                </p>
            </div>
            
            <!-- Indicador de carga -->
            <div v-if="isLoadingRecommendations" class="loading-recommendations pa-8 text-center">
                <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                <p class="mt-4 text-body-2">Cargando recomendaciones...</p>
            </div>
            
            <!-- Mensaje si no hay recomendaciones -->
            <v-alert
                v-else-if="recommendedUsers.length === 0"
                type="info"
                variant="tonal"
                rounded="lg"
                class="mb-4"
            >
                <template v-slot:prepend>
                    <Icon icon="mdi:information-outline" height="24" />
                </template>
                <div class="font-weight-medium">No se encontraron estudiantes</div>
                <div class="text-caption mt-1">No hay estudiantes que coincidan con los requisitos del proyecto en este momento.</div>
            </v-alert>
            
            <!-- Cards de estudiantes recomendados -->
            <div v-else>
                <!-- Estudiante con mejor match -->
                <v-alert 
                    color="success" 
                    variant="tonal" 
                    class="mb-6 best-match-alert"
                    rounded="lg"
                >
                    <template v-slot:prepend>
                        <Icon icon="mdi:trophy-outline" height="24" />
                    </template>
                    <div class="font-weight-medium">
                        El estudiante <strong>{{ recommendedUsers[0].name }} {{ recommendedUsers[0].lastName }}</strong> 
                        tiene la mejor coincidencia con un <strong>{{ recommendedUsers[0].matchPercentage }}%</strong> 
                        de compatibilidad con los requisitos del proyecto.
                    </div>
                </v-alert>
                
                <!-- Lista de estudiantes recomendados -->
                <v-row>
                    <v-col cols="12" md="4" sm="6" v-for="(user, index) in recommendedUsers" :key="user.userId">
                        <v-card 
                            variant="outlined" 
                            rounded="lg"
                            class="recommended-student-card mb-4"
                            :class="{ 'best-match': index === 0 }"
                        >
                            <!-- Badge para el mejor match -->
                            <div v-if="index === 0" class="best-match-badge">
                                <Icon icon="mdi:star" height="20" />
                                <span class="ml-1 text-caption font-weight-bold">Mejor Match</span>
                            </div>
                            
                            <!-- Contenido de la card -->
                            <v-card-item class="pa-6">
                                <div class="d-flex align-center mb-4">
                                    <v-avatar size="80" class="recommended-avatar">
                                        <img :src="user.picture || UserImage" alt="user" width="80" />
                                    </v-avatar>
                                    <div class="ml-4 flex-grow-1">
                                        <RouterLink 
                                            class="recommended-name text-decoration-none" 
                                            :to="`/profile/${user?.userId}`"
                                        >
                                            {{ user.name }} {{ user.lastName }}
                                        </RouterLink>
                                        <div class="text-caption text-medium-emphasis mt-1">
                                            <Icon icon="mdi:email-outline" height="14" class="mr-1" />
                                            {{ user.email }}
                                        </div>
                                        <div v-if="user.university" class="text-caption text-medium-emphasis mt-1">
                                            <Icon icon="mdi:school-outline" height="14" class="mr-1" />
                                            {{ user.university }}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Indicador de coincidencia -->
                                <v-divider class="mb-4"></v-divider>
                                <div class="d-flex align-center justify-space-between mb-4">
                                    <span class="text-subtitle-2 font-weight-bold">Nivel de coincidencia:</span>
                                    <v-chip
                                        :color="getMatchColor(user.matchPercentage)"
                                        class="font-weight-bold match-chip"
                                        rounded="lg"
                                    >
                                        {{ user.matchPercentage }}%
                                    </v-chip>
                                </div>
                                
                                <!-- Habilidades coincidentes -->
                                <div class="mb-3">
                                    <span class="text-caption font-weight-bold mb-2 d-block">Habilidades requeridas que posee:</span>
                                    <div class="skills-recommended">
                                        <v-chip
                                            v-for="(count, skill) in user.skillFrequency"
                                            :key="skill"
                                            color="primary"
                                            variant="tonal"
                                            size="small"
                                            class="ma-1 skill-chip-recommended"
                                        >
                                            {{ skill }} 
                                            <span v-if="count > 1" class="ml-1">({{ count }})</span>
                                        </v-chip>
                                    </div>
                                </div>
                                
                                <!-- Score de coincidencia -->
                                <div class="text-caption text-medium-emphasis mt-3 pt-3 border-top">
                                    Score de coincidencia: <strong class="text-primary">{{ user.matchScore }}</strong>
                                </div>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </v-card-item>
    </v-card>
    </div>
</template>

<style scoped>
.project-details-container {
    padding-bottom: 2rem;
}

.alert-modern {
    border-left: 4px solid;
    animation: slideIn 0.3s ease;
}

.project-details-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.project-tabs {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.tab-modern {
    text-transform: none;
    font-weight: 500;
    transition: all 0.2s ease;
}

.tab-modern:hover {
    background-color: rgba(99, 102, 241, 0.08);
}

.project-info-section {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.project-header-info {
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.professor-link {
    color: rgb(99, 102, 241);
    font-weight: 600;
    transition: all 0.2s ease;
}

.professor-link:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.info-card {
    background: white;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
    height: 100%;
}

.info-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.3);
}

.info-label {
    display: flex;
    align-items: center;
    color: rgb(99, 102, 241);
}

.description-section, .requirements-section {
    background: white;
    border-radius: 10px;
    border-left: 3px solid rgb(99, 102, 241);
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.action-btn-modern {
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
}

.action-btn-modern:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.empty-table-state {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 12px;
    border: 2px dashed rgba(99, 102, 241, 0.2);
}

.modern-table {
    border-radius: 12px;
    overflow: hidden;
}

.table-row-modern {
    transition: all 0.2s ease;
}

.table-row-modern:hover {
    background-color: rgba(99, 102, 241, 0.03);
}

.table-avatar {
    border: 2px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.avatar-initials {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.student-name {
    font-weight: 600;
    color: rgb(99, 102, 241);
    transition: all 0.2s ease;
}

.student-name:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.action-btn-table {
    transition: all 0.2s ease;
}

.action-btn-table:hover {
    transform: scale(1.1);
}

.recommended-section {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.section-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(99, 102, 241);
}

.loading-recommendations {
    background: rgba(99, 102, 241, 0.02);
    border-radius: 12px;
}

.best-match-alert {
    border-left: 4px solid rgb(76, 175, 80);
}

.recommended-student-card {
    position: relative;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.recommended-student-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(99, 102, 241, 0.3);
}

.recommended-student-card.best-match {
    border: 2px solid rgba(76, 175, 80, 0.3);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.02) 0%, rgba(99, 102, 241, 0.02) 100%);
}

.best-match-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(56, 142, 60) 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    z-index: 1;
}

.recommended-avatar {
    border: 3px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.recommended-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.recommended-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    transition: all 0.2s ease;
}

.recommended-name:hover {
    color: rgb(99, 102, 241);
}

.match-chip {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-size: 0.875rem;
}

.skills-recommended {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.skill-chip-recommended {
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.skill-chip-recommended:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 960px) {
    .project-details-card {
        border-radius: 12px !important;
    }
    
    .recommended-student-card {
        margin-bottom: 16px;
    }
}
</style>

