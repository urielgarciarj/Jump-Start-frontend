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
    <div class="profile-page-container">
        <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        <ProfileBanner 
            :userId="userId"
            class="mb-6"
        />
        
        <v-row class="mt-2">
            <!-- Columna lateral con información de perfil -->
            <v-col cols="12" lg="4" md="4">
                <!-- Organizamos IntroCard y SkillsCard verticalmente en la misma columna -->
                <div class="profile-sidebar">
                    <IntroCard class="mb-4" />
                    
                    <SkillsCard 
                        :isOwnProfile="isOwnProfile" 
                        :canEdit="canEdit"
                        :isEditing="isEditing"
                        @cancelEdit="isEditing = false"
                        class="mb-4"
                    />
                </div>
            </v-col>
            
            <!-- Columna principal con posts -->
            <v-col cols="12" md="8" lg="8">
                <div class="posts-container">
                    <v-alert v-if="showAlert" type="success" variant="tonal" class="mb-4 success-alert" dismissible @mouseleave="showAlert = false" rounded="lg">
                        <template v-slot:prepend>
                            <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
                        </template>
                        <div class="font-weight-medium">{{ snackbarMessage }}</div>
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
                        rounded="lg"
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
                            class="empty-posts-card pa-8 text-center"
                            variant="outlined"
                            rounded="lg"
                        >
                            <div class="empty-posts-icon mb-4">
                                <v-icon icon="mdi-post-outline" size="64" color="primary" class="opacity-50"></v-icon>
                            </div>
                            <h3 class="text-h5 mb-3 font-weight-bold">No hay publicaciones disponibles</h3>
                            <p class="text-body-1 text-medium-emphasis mb-6">
                                {{ isOwnProfile ? 'Aún no has creado ninguna publicación. ¡Comparte tus ideas con la comunidad!' : 'Este usuario aún no ha creado publicaciones.' }}
                            </p>
                            <!-- Botón para crear publicación (solo en perfil propio) -->
                            <div v-if="canEdit" class="d-flex justify-center">
                                <PostForm @postCreated="addNewPost"/>
                            </div>
                        </v-card>
                        
                        <!-- Grid de posts -->
                        <div v-else class="posts-grid">
                            <div v-for="post in posts" :key="post.id" class="post-item-wrapper">
                                <PostItem 
                                    :post="post"
                                    @deletePost="handlePostDelete" 
                                />
                            </div>
                        </div>
                    </template>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>
.profile-page-container {
    padding-bottom: 2rem;
}

.profile-sidebar {
    position: sticky;
    top: 20px;
}

.posts-container {
    min-height: 400px;
}

.success-alert {
    border-left: 4px solid rgb(76, 175, 80);
    animation: slideIn 0.3s ease;
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

.empty-posts-card {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border: 2px dashed rgba(99, 102, 241, 0.2);
    transition: all 0.3s ease;
}

.empty-posts-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
}

.empty-posts-icon {
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

.posts-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.post-item-wrapper {
    transition: transform 0.2s ease;
}

.post-item-wrapper:hover {
    transform: translateY(-2px);
}

@media (max-width: 960px) {
    .profile-sidebar {
        position: relative;
        top: 0;
    }
}
</style>