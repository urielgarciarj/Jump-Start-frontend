<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';
import PostItem from '@/components/posts/PostItem.vue';
import axios from 'axios';

// Components
import ProfileBanner from '@/components/profile/ProfileBanner.vue';
import IntroCard from '@/components/profile/IntroCard.vue';
import SkillsCard from '@/components/profile/SkillsCard.vue';

// Composables y stores
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Estado
const posts = ref<any[]>([]);
const isLoadingPosts = ref(false);
const errorPosts = ref<string | null>(null);
const isEditing = ref(false);

// Valores computados
const loggedInUserId = computed(() => authStore.userId);
const userId = computed(() => route.params.userId || loggedInUserId.value);
const isOwnProfile = computed(() => userId.value === loggedInUserId.value);
const canEdit = computed(() => isOwnProfile.value && authStore.isAuthenticated);

// Información de página - usando refs normales, no computadas dentro de refs
const pageTitle = computed(() => isOwnProfile.value ? 'Mi Perfil' : 'Perfil de Usuario');
const breadcrumbs = computed(() => [
    {
        text: 'Dashboard',
        disabled: false,
        href: '/'
    },
    {
        text: isOwnProfile.value ? 'Mi Perfil' : 'Perfil de Usuario',
        disabled: true,
        href: '#'
    }
]);

// Cargar posts del usuario
const fetchUserPosts = async () => {
    if (!userId.value) return;
    
    isLoadingPosts.value = true;
    errorPosts.value = null;
    
    try {
        const response = await axios.get('http://localhost:3000/posts/list/user/' + userId.value);
        posts.value = response.data;
    } catch (error: any) {
        console.error('Error al obtener los posts:', error);
        errorPosts.value = 'No se pudieron cargar las publicaciones.';
    } finally {
        isLoadingPosts.value = false;
    }
};

// Elimina el post del array filtrando el que se ha eliminado
const handlePostDelete = (deletedPostId: string) => {
    // Verificar permisos antes de eliminar
    if (!canEdit.value) {
        console.error('No tienes permisos para eliminar publicaciones de este perfil');
        return;
    }
    
    posts.value = posts.value.filter((post) => post.id !== deletedPostId);
};

// Función para verificar acceso a la página
const checkAccess = () => {
    // Si la página requiere autenticación y el usuario no está autenticado
    if (!authStore.isAuthenticated) {
        router.push('/auth/login?redirect=' + encodeURIComponent(route.fullPath));
        return false;
    }
    return true;
};

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
    console.log('userId:', userId.value);
    console.log('loggedInUserId:', loggedInUserId.value);
    
    // Verificar acceso
    if (!checkAccess()) return;
    
    // Cargar datos
    await fetchUserPosts();
});
</script>

<template>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :isOwnProfile="isOwnProfile"
        :canEdit="canEdit"
    />
    
    <v-row class="mt-4">
        <!-- Columna lateral con información de perfil -->
        <v-col cols="12" lg="4" md="4">
            <!-- Organizamos IntroCard y SkillsCard verticalmente en la misma columna -->
            <IntroCard 
                :isOwnProfile="isOwnProfile" 
                :canEdit="canEdit"
                :isEditing="isEditing"
                @cancelEdit="isEditing = false"
                class="mb-4"
            />
            
            <SkillsCard 
                :isOwnProfile="isOwnProfile" 
                :canEdit="canEdit"
                :isEditing="isEditing"
                @cancelEdit="isEditing = false"
                class="mb-4"
            />
        </v-col>
        
        <!-- Columna principal con posts -->
        <v-col cols="12" md="8" lg="8">
            <!-- Botón para crear publicación (solo en perfil propio) -->
            <v-card v-if="canEdit" class="mb-4 pa-4">
                <v-card-text class="text-center">
                    <v-btn
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-plus"
                        to="/crear-publicacion"
                    >
                        Crear nueva publicación
                    </v-btn>
                </v-card-text>
            </v-card>
            
            <!-- Loader mientras se cargan los posts -->
            <v-skeleton-loader
                v-if="isLoadingPosts"
                type="card, card"
                class="mb-4"
            ></v-skeleton-loader>
            
            <!-- Error al cargar posts -->
            <v-alert
                v-else-if="errorPosts"
                type="error"
                variant="tonal"
                closable
                class="mb-4"
            >
                {{ errorPosts }}
                <template v-slot:append>
                    <v-btn
                        color="primary"
                        variant="text"
                        @click="fetchUserPosts"
                    >
                        Reintentar
                    </v-btn>
                </template>
            </v-alert>
            
            <!-- Lista de posts -->
            <template v-else>
                <!-- Mensaje cuando no hay posts -->
                <v-card
                    v-if="posts.length === 0"
                    class="pa-4 mb-4 text-center"
                    variant="outlined"
                >
                    <v-icon icon="mdi-post" size="large" class="mb-2"></v-icon>
                    <h3 class="text-h6 mb-2">No hay publicaciones disponibles</h3>
                    <p class="text-body-2 text-medium-emphasis">
                        {{ isOwnProfile ? 'Aún no has creado ninguna publicación.' : 'Este usuario aún no ha creado publicaciones.' }}
                    </p>
                </v-card>
                
                <!-- Grid de posts -->
                <v-row v-else>
                    <v-col v-for="post in posts" :key="post.id" cols="12">
                        <PostItem 
                            :post="post" 
                            :canEdit="canEdit"
                            @deletePost="handlePostDelete" 
                        />
                    </v-col>
                </v-row>
            </template>
        </v-col>
    </v-row>
</template>