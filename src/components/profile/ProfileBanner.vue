<script setup lang="ts">
import { ref, shallowRef, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { UserIcon, ArchiveIcon, FileStarIcon, FileCvIcon } from 'vue-tabler-icons';
import { Icon } from '@iconify/vue';
import axios from 'axios';
// Components
import profileBg from '@/assets/images/backgrounds/profilebg.jpg';
import UserImage from '@/assets/images/profile/user-5.jpg';
import { VLazy } from 'vuetify/lib/components/index.mjs';

const props = defineProps({
    userId: String
});
const authStore = useAuthStore();
const loggedInUserId = authStore.userId;
const isOwnProfile = props.userId == loggedInUserId;
const tab = ref(null);
const items = shallowRef([
    { tab: 'Perfil', icon: UserIcon, href: `/profile/${props.userId}` }
]);

// Getting full name of the user
const fullName = ref('');
const role = ref('');

// Getting profile picture from profile of the user
const profilePicture = ref('');

// social media links
const isEditing = ref(false);
const showSuccessPopup = ref(false);
const socialLinks = ref({
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
})
const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${props.userId}`);
        const userData = response.data;
        fullName.value = `${userData.name} ${userData.lastName}`;
        role.value = userData.role;
        socialLinks.value = userData.socialLinks || {};
        updateTabs(userData.role);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${props.userId}`);
        const profileData = response.data;
        profilePicture.value = profileData.picture;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

// Guardar cambios en redes sociales
const saveSocialLinks = async () => {
    try {
        await axios.put(`http://localhost:3000/profiles/update-social-links/${props.userId}`, socialLinks.value);
        isEditing.value = false;
    } catch (error) {
        console.error('Error saving social links:', error);
    }
};

const onFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
        const file = target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post(`http://localhost:3000/profiles/upload-profile-picture/${loggedInUserId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                profilePicture.value = response.data.fileUrl; // Actualiza la imagen mostrada
                //console.log('Image uploaded:', profilePicture.value);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    }
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
    fileInput.value?.click();
};

onMounted(() => {
    fetchUserData();
    fetchProfileData();
});

// Updates available tabs based on user role
const updateTabs = (role: String) => {
    try {
        if (!role) return;
        items.value = [{ tab: 'Perfil', icon: UserIcon, href: `/profile/${props.userId}` }];
        switch (role.toLowerCase()) {
            case 'docente':
                items.value.push({ tab: 'Proyectos', icon: FileStarIcon, href: '/myprojects/' + props.userId });
                break;
            case 'reclutador':
                items.value.push({ tab: 'Ofertas laborales', icon: ArchiveIcon, href: '/userapplications/' + props.userId });
                break;
            case 'estudiante':
                items.value.push({ tab: 'CV', icon: FileCvIcon, href: '/cv/' + props.userId });
                items.value.push({ tab: 'Proyectos', icon: FileStarIcon, href: '/myprojects/' + props.userId });
                if (props.userId == loggedInUserId) {// Just the owner estudent can view the vacants where he send an apply
                    items.value.push({ tab: 'Ofertas laborales', icon: ArchiveIcon, href: '/userapplications/' + props.userId });
                }
                break;
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};
</script>

<template>
    <v-card elevation="10" class="overflow-hidden">
        <img :src="profileBg" alt="profile" class="w-100" height="160px" />
        <div>
            <v-row class="mt-1">
                <v-col cols="12" lg="4" sm="12" class="order-sm-second">
                    <div class="px-4 py-1">
                    </div>
                </v-col>
                <v-col cols="12" lg="4" sm="12" class="d-flex justify-center order-sml-first">
                    <div class="text-center top-spacer">
                        <div class="avatar-border">
                            <v-avatar size="100" class="userImage">
                                <img :src="profilePicture || UserImage" alt="Mathew" width="100" @click="triggerFileInput" />
                                <Icon v-if="isOwnProfile" icon="solar:pen-linear" class="edit-icon" height="25" />
                            </v-avatar>
                            <input v-if="isOwnProfile" type="file" ref="fileInput" @change="onFileChange" style="display: none" />
                        </div>
                        <h5 class="text-h5 mt-3">{{ fullName }}</h5>
                        <span class="textSecondary font-weight-regular">{{ role }}</span>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" class="d-flex align-center justify-center justify-lg-end order-sm-third">
                    <div class="d-flex align-center justify-space-between px-10 py-1 gap-3">
                        <v-btn v-if="socialLinks.facebook" :href="socialLinks.facebook" target="_blank" icon variant="flat" size="x-small" color="primary" class="btn-brand-facebook"
                            ><BrandFacebookIcon size="16"
                        /></v-btn>
                        <v-btn v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank" icon variant="flat" size="x-small" color="primary" class="btn-brand-twitter"
                            ><BrandTwitterIcon size="16"
                        /></v-btn>
                        <v-btn v-if="socialLinks.linkedin" :href="socialLinks.linkedin" target="_blank" icon variant="flat" size="x-small" color="primary" class="btn-brand-linkedin"
                            ><BrandLinkedinIcon size="16"
                        /></v-btn>
                        <v-btn v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank" icon variant="flat" size="x-small" color="primary" class="btn-brand-instagram"
                            ><BrandInstagramIcon size="16"
                        /></v-btn>
                        <v-btn icon class="ml-2" @click="isEditing = true">
                            <Icon icon="solar:pen-linear" class="text-success" />
                        </v-btn>
                        <v-dialog v-model="isEditing" persistent max-width="600px">
                        <v-card variant="outlined">
                                <v-card-title class="pa-4 bg-primary">
                                    <span class="title text-white">Ingresa Redes Sociales</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-text-field v-model="socialLinks.facebook" label="Facebook" prepend-icon="mdi-facebook" />
                                    <v-text-field v-model="socialLinks.twitter" label="Twitter" prepend-icon="mdi-twitter" />
                                    <v-text-field v-model="socialLinks.linkedin" label="LinkedIn" prepend-icon="mdi-linkedin" />
                                    <v-text-field v-model="socialLinks.instagram" label="Instagram" prepend-icon="mdi-instagram" />
                                </v-card-text>
                                <v-card-actions class="pa-4">
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="flat" @click="isEditing = false">Cancelar</v-btn>
                                    <v-btn color="primary" variant="flat" @click="saveSocialLinks">Guardar</v-btn>
                                </v-card-actions>
                        </v-card>
                    </v-dialog>
                    </div>
                </v-col>
                <v-col md="12" class="order-sm-last">
                    <v-tabs v-model="tab" color="primary" class="profiletab bg-lightprimary">
                        <v-tab v-for="item in items" :key="item.tab" :to="item.href" class="font-weight-regular text-subtitle-1">
                            <component :is="item.icon" size="18" stroke-width="1.5" class="mr-2"></component>
                            {{ item.tab }}
                        </v-tab>
                    </v-tabs>
                </v-col>
            </v-row>
        </div>
    </v-card>
</template>

<style scoped>
.avatar-border {
    background-image: linear-gradient(rgb(80, 178, 252), rgb(244, 76, 102));
    border-radius: 50%;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    position: relative; /* Asegúrate de que el contenedor tenga position: relative */
}

.userImage {
    border: 4px solid rgb(255, 255, 255);
    position: relative; /* Asegúrate de que el contenedor tenga position: relative */
}

.edit-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 5px;
    display: none;
}

.avatar-border:hover .edit-icon {
    display: block;
}

.top-spacer {
    margin-top: -95px;
}

.profiletab .v-slide-group__content {
    justify-content: end;
    .v-btn--variant-text .v-btn__overlay {
        background: transparent;
    }
}

@media (max-width: 1023px) {
    .order-sm-second {
        order: 2;
    }
    .order-sml-first {
        order: 1;
    }
    .order-sm-third {
        order: 3;
    }
    .order-sm-last {
        order: 4;
    }
}

.btn-brand-facebook {
    background-color: rgb(24, 119, 242) !important;
}

.btn-brand-twitter {
    background-color: rgb(29, 161, 242) !important;
}
.btn-brand-linkedin {
    background-color: rgb(234, 76, 137) !important;
}
.btn-brand-instagram {
    background-color: rgb(205, 32, 31) !important;
}
</style>