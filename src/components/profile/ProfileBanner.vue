<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { HeartIcon, PhotoIcon, UserCircleIcon, UsersIcon } from 'vue-tabler-icons';
import profileBg from '@/assets/images/backgrounds/profilebg.jpg';
import UserImage from '@/assets/images/profile/user-5.jpg';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

const authStore = useAuthStore();
const userId = authStore.userId;

const tab = ref(null);
const items = shallowRef([
    { tab: 'Profile', icon: UserCircleIcon, href: '/apps/user/profile' },
    { tab: 'Followers', icon: HeartIcon, href: '/apps/user/profile/followers' },
    { tab: 'Friends', icon: UsersIcon, href: '/apps/user/profile/friends' },
    { tab: 'Gallery', icon: PhotoIcon, href: '/apps/user/profile/gallery' }
]);

// Getting full name of the user
const fullName = ref('');
const role = ref('');

// Getting profile picture from profile of the user
const profilePicture = ref('');

const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${userId}`);
        const userData = response.data;
        fullName.value = `${userData.name} ${userData.lastName}`;
        role.value = userData.role;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${userId}`);
        const profileData = response.data;
        profilePicture.value = profileData.picture;
    } catch (error) {
        console.error('Error fetching profile data:', error);
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
                const response = await axios.post(`http://localhost:3000/profiles/upload-profile-picture/${userId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                profilePicture.value = response.data.fileUrl; // Actualiza la imagen mostrada
                console.log('Image uploaded:', profilePicture.value);
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
</script>

<style scoped>
.adjusted-image {
    max-width: 100%; /* La imagen no puede exceder el tamaño del contenedor */
    max-height: 100%; /* Limita la altura máxima de la imagen */
    object-fit: contain; /* Asegura que la imagen se ajusta manteniendo su proporción */
}
</style>

<template>
    <v-card elevation="10" class="overflow-hidden">
        <img :src="profileBg" alt="profile" class="w-100" height="160px" />
        <div>
            <v-row class="mt-1">
                <v-col cols="12" lg="4" sm="12" class="order-sm-second">
                    <div class="px-4 py-1">
                        <v-row class="justify-center">
                            <v-col cols="4" class="text-center">
                                <FileDescriptionIcon size="20" />
                                <h4 class="text-h4">938</h4>
                                <h6 class="text-h6 font-weight-regular">Posts</h6>
                            </v-col>
                            <v-col cols="4" class="text-center">
                                <UserCircleIcon size="20" />
                                <h4 class="text-h4">3,586</h4>
                                <h6 class="text-h6 font-weight-regular">Seguidores</h6>
                            </v-col>
                            <v-col cols="4" class="text-center">
                                <UserCheckIcon size="20" />
                                <h4 class="text-h4">2,659</h4>
                                <h6 class="text-h6 font-weight-regular">Siguiendo</h6>
                            </v-col>
                        </v-row>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" sm="12" class="d-flex justify-center order-sml-first">
                    <div class="text-center top-spacer">
                        <div class="avatar-border">
                            <v-avatar size="100" class="userImage">
                                <img :src="profilePicture || UserImage" alt="Mathew" width="100" @click="triggerFileInput" />
                                <Icon icon="solar:pen-linear" class="edit-icon" height="25" />
                            </v-avatar>
                            <input type="file" ref="fileInput" @change="onFileChange" style="display: none" />
                        </div>
                        <h5 class="text-h5 mt-3">{{ fullName }}</h5>
                        <span class="textSecondary font-weight-regular">{{ role }}</span>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" class="d-flex align-center justify-center justify-lg-end order-sm-third">
                    <div class="d-flex align-center justify-space-between px-10 py-1 gap-3">
                        <v-btn icon variant="flat" size="x-small" color="primary" class="btn-brand-facebook"
                            ><BrandFacebookIcon size="16"
                        /></v-btn>
                        <v-btn icon variant="flat" size="x-small" color="primary" class="btn-brand-twitter"
                            ><BrandTwitterIcon size="16"
                        /></v-btn>
                        <v-btn icon variant="flat" size="x-small" color="primary" class="btn-brand-dribbble"
                            ><BrandDribbbleIcon size="16"
                        /></v-btn>
                        <v-btn icon variant="flat" size="x-small" color="primary" class="btn-brand-youtube"
                            ><BrandYoutubeIcon size="16"
                        /></v-btn>
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
<style lang="scss">
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
.btn-brand-dribbble {
    background-color: rgb(234, 76, 137) !important;
}
.btn-brand-youtube {
    background-color: rgb(205, 32, 31) !important;
}
</style>
