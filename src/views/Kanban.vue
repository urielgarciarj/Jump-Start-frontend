<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import TaskCard from "@/components/projects/kanban/TaskCard.vue";
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

const authStore = useAuthStore();
const userRole = authStore.userRole;

const page = ref({ title: 'Kanban' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Kanban', disabled: true, href: '#' }
]);
</script>

<template>
    <div class="kanban-page-container">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        
        <div class="kanban-header mb-6">
            <v-row>
                <v-col v-if="userRole.toLowerCase() === 'docente'" cols="12" sm="6" class="d-flex justify-end">
                    <v-btn 
                        color="primary" 
                        variant="flat"
                        to="/projects/create-project"
                        rounded="lg"
                        size="large"
                        class="new-project-btn"
                    >
                        <Icon icon="mdi:plus-circle-outline" height="20" class="mr-2" />
                        Nuevo Proyecto
                    </v-btn>
                </v-col>
            </v-row>
        </div>
        
        <TaskCard />
    </div>
</template>

<style scoped>
.kanban-page-container {
    padding-bottom: 2rem;
    width: 100%;
    min-height: 100%;
    display: block;
}

.kanban-header {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(99, 102, 241, 0.1);
    margin-bottom: 24px;
}

.new-project-btn {
    font-weight: 600;
    text-transform: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
}

.new-project-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}
</style>

