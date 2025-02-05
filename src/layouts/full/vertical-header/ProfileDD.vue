<script setup lang="ts">
import { profileDD } from '@/_mockApis/headerData';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
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
    <v-menu open-on-hover open-on-click>
        <template v-slot:activator="{ props }">
            <v-btn variant="text" class="custom-hover-primary" color="primary" v-bind="props" icon>
                <v-avatar size="40" class="text-h5 font-weight-medium">
                    <img :src="profilePicture || UserImage" alt="Mathew" width="50" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="280" elevation="10">
            <div class="pa-6">
                <div class="d-flex align-center pb-6">
                    <!-- <v-avatar size="55" color="error" variant="flat" class="text-h5 font-weight-medium"> C </v-avatar> -->
                    <v-avatar size="55" class="text-h5 font-weight-medium">
                        <img :src="profilePicture || UserImage" alt="Mathew" width="50" />
                    </v-avatar>
                    <div class="ml-3">
                        <h6 class="text-subtitle-1 mb-n1">{{ user.name }} {{ user.lastName }}</h6>
                        <span class="text-subtitle-1 text-textSecondary">{{ user.email }}</span>
                    </div>
                </div>
                <v-divider></v-divider>
                <perfect-scrollbar style="height: calc(100vh - 240px); max-height: 240px">
                    <v-list class="py-0 theme-list mt-3" lines="one">
                        <!-- <v-list-item v-for="item in profileDD" :key="item.title" class="py-0 px-2 rounded-md custom-text-primary" color="primary"  :to="item.href">
                        <div class="d-flex gap-3 align-center">
                            <p class="text-subtitle-1 heading custom-title">{{ item.title }}</p>
                        </div>
                    </v-list-item> -->
                        <v-list-item class="py-0 px-2 rounded-md custom-text-primary" color="primary">
                            <router-link to="/profile" class="text-decoration-none">
                                <p class="text-subtitle-1 heading custom-title">Mi Perfil</p>
                            </router-link>
                        </v-list-item>
                        <v-list-item class="py-0 px-2 rounded-md custom-text-primary" color="primary">
                            <div class="d-flex gap-3 align-center">
                                <v-btn @click="logOut" variant="tonal" color="primary" class="text-subtitle-1 heading custom-title"
                                    >Cerrar Sesión</v-btn
                                >
                            </div>
                        </v-list-item>
                    </v-list>
                </perfect-scrollbar>
            </div>
        </v-sheet>
    </v-menu>
</template>
