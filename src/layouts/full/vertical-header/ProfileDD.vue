<script setup lang="ts">
import { profileDD } from '@/_mockApis/headerData';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import UserImage from '@/assets/images/profile/user-5.jpg';

const router = useRouter();
const authStore = useAuthStore();
const userId = authStore.userId; // Obtener el userId desde el store

const user = ref({
    name: '',
    lastName: '',
    email: ''
});

// Getting profile picture from profile of the user
const profilePicture = ref('');

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${userId}`);
        const profileData = response.data;
        profilePicture.value = profileData.picture;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

onMounted(async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${userId}`);
        user.value = response.data;
    } catch (error) {
        console.error('Error al obtener los posts:', error);
    }
    fetchProfileData();
});

const logOut = async () => {
    authStore.logout();
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu open-on-hover open-on-click location="bottom end" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn variant="flat" class="profile-avatar-btn" color="primary" v-bind="props" icon rounded="lg">
                <v-avatar size="42" class="profile-avatar">
                    <img :src="profilePicture || UserImage" alt="Usuario" width="42" />
                    <div class="avatar-border-ring"></div>
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="lg" width="300" elevation="12" class="profile-dropdown">
            <div class="pa-6 profile-header">
                <div class="d-flex align-center">
                    <div class="profile-avatar-large-wrapper">
                        <v-avatar size="64" class="profile-avatar-large">
                            <img :src="profilePicture || UserImage" alt="Usuario" width="64" />
                        </v-avatar>
                        <div class="avatar-status-indicator"></div>
                    </div>
                    <div class="ml-4 profile-info">
                        <h6 class="text-h6 mb-1 font-weight-bold profile-name">{{ user.name }} {{ user.lastName }}</h6>
                        <span class="text-subtitle-2 text-medium-emphasis profile-email">{{ user.email }}</span>
                    </div>
                </div>
            </div>
            <v-divider class="mx-4"></v-divider>
            <perfect-scrollbar style="height: calc(100vh - 240px); max-height: 240px">
                <v-list class="py-3 theme-list" lines="one">
                    <v-list-item class="py-2 px-4 rounded-lg custom-text-primary profile-menu-item" color="primary">
                        <router-link to="/profile" class="text-decoration-none d-flex align-center">
                            <Icon icon="solar:user-bold-duotone" height="20" width="20" class="mr-3" style="color: rgba(99, 102, 241, 0.7);" />
                            <p class="text-subtitle-1 heading custom-title mb-0">Mi Perfil</p>
                        </router-link>
                    </v-list-item>
                    <v-list-item class="py-2 px-4 rounded-lg custom-text-primary profile-menu-item" color="primary">
                        <div class="d-flex align-center">
                            <Icon icon="solar:logout-3-bold-duotone" height="20" width="20" class="mr-3" style="color: rgba(244, 67, 54, 0.7);" />
                            <v-btn @click="logOut" variant="text" color="error" class="text-subtitle-1 heading custom-title px-0"
                                >Cerrar Sesión</v-btn
                            >
                        </div>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
        </v-sheet>
    </v-menu>
</template>

<style scoped>
.profile-avatar-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s ease;
    padding: 2px !important;
}

.profile-avatar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}

.profile-avatar {
    border: 3px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    position: relative;
    transition: all 0.3s ease;
}

.avatar-border-ring {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.6)) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.profile-avatar-btn:hover .avatar-border-ring {
    opacity: 1;
}

.profile-dropdown {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.profile-header {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 12px 12px 0 0;
    margin: -6px -6px 0 -6px;
}

.profile-avatar-large-wrapper {
    position: relative;
}

.profile-avatar-large {
    border: 4px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
}

.avatar-status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-info {
    flex: 1;
}

.profile-name {
    color: #1e293b;
    letter-spacing: -0.01em;
}

.profile-email {
    color: #64748b;
    font-size: 0.875rem;
}

.profile-menu-item {
    transition: all 0.2s ease;
    margin: 4px 8px;
}

.profile-menu-item:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%) !important;
    transform: translateX(4px);
}

.custom-title {
    transition: color 0.2s ease;
}
</style>
