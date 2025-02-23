<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userRole = authStore.userRole;

const page = ref({ title: 'Sample Page' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Kanban', disabled: true, href: '#' }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col v-if="userRole.toLowerCase() === 'docente'" cols="12" sm="6" class="d-flex justify-end">
            <v-btn color="primary" flat to="/projects/create-project">
                Nuevo Proyecto
            </v-btn>
        </v-col>
    </v-row>
</template>

