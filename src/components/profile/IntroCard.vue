<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { PhoneIcon, SchoolIcon, BriefcaseIcon, MailIcon, MapPinIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;

// Getting email of the user
const email = ref('');
const profileIntroduction = ref('');
const profileLocation = ref('');
const profileCompany = ref('');
const profileUniversity = ref('');
const profilePhone = ref('');
const profileId = ref('');

const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${userId.value}`);
        const userData = response.data;
        email.value = userData.email;
        profileId.value = userData.profile.id;
        await fetchProfileData(); // Fetch profile data after fetching user data
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${profileId.value}`);
        const profileData = response.data;
        profileIntroduction.value = profileData.aboutMe;
        profileLocation.value = profileData.location;
        profileCompany.value = profileData.jobCompany;
        profileUniversity.value = profileData.university;
        profilePhone.value = profileData.phone;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

const saveChanges = async () => {
    try {
        await axios.patch(`http://localhost:3000/profiles/upsert/${loggedInUserId}`, {
            aboutMe: profileIntroduction.value,
            jobCompany: profileCompany.value,
            university: profileUniversity.value,
            email: email.value,
            phone: profilePhone.value,
            location: profileLocation.value,
        });
        alert('Cambios guardados exitosamente!');
        dialog.value = false; // Close the dialog after saving
    } catch (error) {
        console.error('Error saving changes:', error);
    }
};

const valid = ref(true);
const dialog = ref(false);

onMounted(async () => {
    await fetchUserData(); // Fetch user data when the component is mounted
});

watch(() => route.params.id, async (newUserId) => {
    userId.value = newUserId || loggedInUserId;
    await fetchUserData();
});

function close() {
    dialog.value = false;
}

</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined" class="intro-card" rounded="lg">
                <v-card-item class="pa-6">
                    <div class="d-flex justify-space-between align-center mb-4">
                        <div class="d-flex align-center gap-2">
                            <div class="card-icon-wrapper">
                                <Icon icon="mdi:account-circle-outline" height="24" class="card-icon" />
                            </div>
                            <h4 class="text-h5 font-weight-bold mb-0">Información personal</h4>
                        </div>
                        <v-dialog v-model="dialog" max-width="600">
                            <template v-slot:activator="{ props }">
                                <v-btn v-if="isOwnProfile" color="success" v-bind="props" size="small" variant="flat" class="edit-btn">
                                    <Icon icon="solar:pen-linear" height="18" class="mr-1" />
                                    Editar
                                </v-btn>
                            </template>
                            <v-card rounded="lg">
                                <v-card-title class="pa-4 bg-primary">
                                    <span class="title text-white">Editar Información Personal</span>
                                </v-card-title>

                                <v-card-text class="pa-4">
                                    <v-form ref="form" v-model="valid" lazy-validation>
                                        <v-row>
                                            <v-col cols="12" lg="12">
                                                <v-label class="mb-2 font-weight-medium">Mi introducción</v-label>
                                                <v-textarea v-model="profileIntroduction" persistent-hint variant="outlined" hide-details placeholder="Escribe tu introducción" color="primary" required class="mb-3"></v-textarea>
                                                <v-label class="mb-2 font-weight-medium">Empresa</v-label>
                                                <v-text-field
                                                    v-model="profileCompany"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Escribe la empresa donde laboras"
                                                    color="primary"
                                                    class="mb-3"
                                                ></v-text-field>

                                                <v-label class="mb-2 font-weight-medium">Educación Universitaria</v-label>
                                                <v-text-field
                                                    v-model="profileUniversity"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Escribe tu escuela universitaria"
                                                    color="primary"
                                                    class="mb-3"
                                                ></v-text-field>
                                                <v-label class="mb-2 font-weight-medium">Email</v-label>
                                                <v-text-field
                                                    v-model="email"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Escribe tu correo electrónico"
                                                    color="primary"
                                                    class="mb-3"
                                                ></v-text-field>
                                                <v-label class="mb-2 font-weight-medium">Teléfono</v-label>
                                                <v-text-field
                                                    v-model="profilePhone"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Escribe tu teléfono"
                                                    color="primary"
                                                    class="mb-3"
                                                ></v-text-field>
                                                <v-label class="mb-2 font-weight-medium">Ubicación</v-label>
                                                <v-text-field
                                                    v-model="profileLocation"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Ubicación"
                                                    color="primary"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>

                                <v-card-actions class="pa-4">
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="flat" @click="close">Cancelar</v-btn>
                                    <v-btn color="primary" variant="flat" @click="saveChanges">Guardar</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>
                    
                    <div v-if="profileIntroduction" class="intro-text mb-6">
                        <p class="text-body-1 lh-md textSecondary mb-0">
                            {{ profileIntroduction }}
                        </p>
                    </div>
                    <div v-else class="intro-text mb-6">
                        <p class="text-body-1 lh-md text-medium-emphasis mb-0 italic">
                            {{ isOwnProfile ? 'Comparte información sobre ti...' : 'No hay información disponible.' }}
                        </p>
                    </div>
                    
                    <v-divider class="mb-4"></v-divider>
                    
                    <div class="info-items">
                        <div class="info-item mb-4">
                            <div class="info-icon-wrapper">
                                <BriefcaseIcon size="20" stroke-width="1.5" />
                            </div>
                            <div class="info-content">
                                <span class="text-caption text-medium-emphasis">Empresa</span>
                                <span class="text-body-1 font-weight-medium">{{ profileCompany || 'No especificado' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item mb-4">
                            <div class="info-icon-wrapper">
                                <SchoolIcon size="20" stroke-width="1.5" />
                            </div>
                            <div class="info-content">
                                <span class="text-caption text-medium-emphasis">Universidad</span>
                                <span class="text-body-1 font-weight-medium">{{ profileUniversity || 'No especificado' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item mb-4">
                            <div class="info-icon-wrapper">
                                <MailIcon size="20" stroke-width="1.5" />
                            </div>
                            <div class="info-content">
                                <span class="text-caption text-medium-emphasis">Email</span>
                                <span class="text-body-1 font-weight-medium">{{ email || 'No especificado' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item mb-4">
                            <div class="info-icon-wrapper">
                                <PhoneIcon size="20" stroke-width="1.5" />
                            </div>
                            <div class="info-content">
                                <span class="text-caption text-medium-emphasis">Teléfono</span>
                                <span class="text-body-1 font-weight-medium">{{ profilePhone || 'No especificado' }}</span>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-icon-wrapper">
                                <MapPinIcon size="20" stroke-width="1.5" />
                            </div>
                            <div class="info-content">
                                <span class="text-caption text-medium-emphasis">Ubicación</span>
                                <span class="text-body-1 font-weight-medium">{{ profileLocation || 'No especificado' }}</span>
                            </div>
                        </div>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped>
.intro-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
}

.intro-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.card-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-icon {
    color: rgb(99, 102, 241);
}

.edit-btn {
    border-radius: 8px;
    text-transform: none;
    font-weight: 500;
}

.intro-text {
    padding: 16px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 12px;
    border-left: 3px solid rgb(99, 102, 241);
}

.info-items {
    display: flex;
    flex-direction: column;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    transition: all 0.2s ease;
}

.info-item:hover {
    background-color: rgba(99, 102, 241, 0.05);
}

.info-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: rgb(99, 102, 241);
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.italic {
    font-style: italic;
}

@media (max-width: 600px) {
    .intro-card {
        border-radius: 12px !important;
    }
    
    .info-item {
        padding: 8px;
    }
}
</style>