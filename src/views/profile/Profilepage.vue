<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
// Components
import PostForm from '@/components/posts/createPostForm.vue';
import PostItem from '@/components/posts/PostItem.vue';
import ProfileBanner from '@/components/profile/ProfileBanner.vue';
import IntroCard from '@/components/profile/IntroCard.vue';
import SkillsCard from '@/components/profile/SkillsCard.vue';

// Composables y stores
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Valores computados
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;
const canEdit = userId.value === loggedInUserId;

// Estado
const posts = ref<any[]>([]);
const isLoadingPosts = ref(false);
const errorPosts = ref<string | null>(null);
const isEditing = ref(false);

// Información de página - usando refs normales, no computadas dentro de refs
const pageTitle = computed(() => isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario');
const breadcrumbs = computed(() => [
    {
        text: 'Dashboard',
        disabled: false,
        href: '/'
    },
    {
        text: isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario',
        disabled: true,
        href: '#'
    }
]);
// Manejo de notificaciones
const showAlert = ref(false); // Controlar la visibilidad del snackbar
const snackbarMessage = ref(''); // Mensaje para mostrar en el snackbar

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

// Función para actualizar la lista de posts cuando se crea un nuevo post
const addNewPost = (newPost: any) => {
  posts.value.unshift(newPost);
  snackbarMessage.value = '¡Nueva publicación creada con éxito!';
  showAlert.value = true;
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

// Elimina el post del array filtrando el que se ha eliminado
const handlePostDelete = (deletedPostId: string) => {
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
    // Verificar acceso
    if (!checkAccess()) return;
    
    // Cargar datos
    await fetchUserPosts();
});
</script>

<template>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :userId="userId"
    />
    
    <v-row class="mt-4">
        <!-- Columna lateral con información de perfil -->
        <v-col cols="12" lg="4" md="4">
            <!-- Organizamos IntroCard y SkillsCard verticalmente en la misma columna -->
            <IntroCard />
            
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
            
            <v-alert v-if="showAlert" type="success" variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
                <template v-slot:prepend>
                <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
                </template>
                <div>{{ snackbarMessage }}</div>
            </v-alert>

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
                    <!-- Botón para crear publicación (solo en perfil propio) -->
                    <div v-if="canEdit" class="mb-2 pa-2">
                        <PostForm @postCreated="addNewPost"/>
                    </div>
                </v-card>
                
                <!-- Grid de posts -->
                <v-row v-else>
                    <v-col v-for="post in posts" :key="post.id" cols="12">
                        <PostItem 
                            :post="post"
                            @deletePost="handlePostDelete" 
                        />
                    </v-col>
                </v-row>
            </template>
        </v-col>
    </v-row>
</template>