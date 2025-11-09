<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';

const props = defineProps({
    column: Object,
});

const capitalizeFirstLetter = (str: string) => {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getStatusIcon = (status: string) => {
    const icons: { [key: string]: string } = {
        'cancelado': 'mdi:cancel',
        'abierto': 'mdi:folder-open-outline',
        'progreso': 'mdi:progress-clock',
        'completado': 'mdi:check-circle-outline'
    };
    return icons[status.toLowerCase()] || 'mdi:folder-outline';
};

const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
        'cancelado': 'error',
        'abierto': 'info',
        'progreso': 'primary',
        'completado': 'success'
    };
    return colors[status.toLowerCase()] || 'primary';
};
</script>

<template>
    <v-card variant="outlined" rounded="lg" class="kanban-column">
        <div class="column-header">
            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                    <div class="status-icon-wrapper">
                        <Icon :icon="getStatusIcon(column?.status)" height="20" />
                    </div>
                    <h6 class="text-h6 font-weight-bold ml-3">{{ capitalizeFirstLetter(column?.status) }}</h6>
                    <v-chip 
                        :color="getStatusColor(column?.status)" 
                        size="small" 
                        class="ml-3 count-chip"
                    >
                        {{ column?.projects?.length || 0 }}
                    </v-chip>
                </div>
            </div>
        </div>
        
        <div class="column-content pa-4">
            <div v-if="column?.projects && column.projects.length === 0" class="empty-column">
                <Icon icon="mdi:inbox-outline" height="48" class="mb-2 opacity-50" />
                <p class="text-body-2 text-medium-emphasis">No hay proyectos</p>
            </div>
            
            <div v-else>
                <div 
                    v-for="project in column?.projects" 
                    :key="project.id" 
                    class="project-task-card mb-3"
                >
                    <v-card variant="outlined" rounded="lg" class="task-card">
                        <v-card-item class="pa-4">
                            <RouterLink 
                                class="task-title text-decoration-none" 
                                :to="`/project/details/${project?.id}`"
                            >
                                {{ project?.name }}
                            </RouterLink>
                            <div class="task-category mt-2">
                                <Icon icon="mdi:tag-outline" height="14" class="mr-1" />
                                <span class="text-caption text-medium-emphasis">{{ project?.category }}</span>
                            </div>
                        </v-card-item>
                    </v-card>
                </div>
            </div>
        </div>
    </v-card>
</template>

<style scoped>
.kanban-column {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
    height: 100%;
    min-height: 500px;
}

.kanban-column:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.column-header {
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
    border-bottom: 2px solid rgba(99, 102, 241, 0.2);
}

.status-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(99, 102, 241);
}

.count-chip {
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.column-content {
    min-height: 400px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.01) 0%, rgba(168, 85, 247, 0.01) 100%);
}

.empty-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
}

.project-task-card {
    transition: all 0.2s ease;
}

.project-task-card:hover {
    transform: translateX(4px);
}

.task-card {
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
}

.task-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.3);
}

.task-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    transition: all 0.2s ease;
    display: block;
}

.task-title:hover {
    color: rgb(99, 102, 241);
}

.task-category {
    display: flex;
    align-items: center;
    gap: 4px;
}

@media (max-width: 960px) {
    .kanban-column {
        margin-bottom: 24px;
        min-height: 300px;
    }
}
</style>
