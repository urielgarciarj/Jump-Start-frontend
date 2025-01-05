<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

// components
import ProfileBanner from '@/components/profile/ProfileBanner.vue';
import IntroCard from '@/components/profile/IntroCard.vue';
// import IntroCard from '@/components/apps/user-profile/IntroCard.vue';

const page = ref({ title: 'Perfil de usuario' });
const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        href: '/'
    },
    {
        text: 'Perfil de Usuario',
        disabled: true,
        href: '#'
    }
]);
console.log('userId', userId);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner />
    <v-row class="mt-4">
        <v-col cols="12" lg="4" md="4">
            <IntroCard />
        </v-col>
        <v-col cols="12" lg="8" md="8">
        </v-col>
    </v-row>
</template>
