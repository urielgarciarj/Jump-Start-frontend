<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import TaskColumn from '@/components/projects/kanban/TaskColumn.vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const userId = authStore.userId;

const projects = ref<any[]>([]);
onMounted(async () => {
    try {
    const response = await axios.get(`http://localhost:3000/projects/list/${userId}`);
    projects.value = response.data;
  } catch (error) {
    console.error('Error al obtener el listado de vacantes:', error);
  }
});
// Definir el orden de los estados
const statusOrder = ['cancelado', 'abierto', 'progreso', 'completado'];
type CardColors = {
    [key: string]: string; // Permite cualquier cadena como clave
};
const cardColors: CardColors = {
    "abierto": "lightinfo",
    "progreso": "lightsecondary",
    "completado": "lightsuccess",
    "cancelado": "light"
};
// Clasificar los proyectos por status y ordenarlos
const getProjects = computed(() => {
    // Agrupar los proyectos por status
    const groupedProjects = projects.value.reduce((acc, project) => {
        const status = project.status || 'sin_estado'; // Usar 'sin_estado' si no hay status
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(project);
        return acc;
    }, {});

    // Ordenar los estados según el orden definido
    return statusOrder.map(status => ({
        status, // Nombre del status
        cardbg: cardColors[status] || '',
        projects: groupedProjects[status] || [] // Proyectos con este status (o un arreglo vacío si no hay proyectos)
    }));
});
const columns = getProjects;
</script>

<template>
    <v-row>
        <v-col cols="12" md="3" sm="6" class="d-flex" v-for="column in columns" :key="column.status">
            <TaskColumn :column="column"/>
        </v-col>
    </v-row>
</template>
