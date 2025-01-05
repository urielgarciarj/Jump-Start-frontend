<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { Icon } from "@iconify/vue";
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

// Getting email of the user
const email = ref('');

const fetchUserData = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/users/user/${userId}`);
    const userData = response.data;
    email.value = userData.email;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const description = ref('None');

onMounted(() => {
  fetchUserData();
});

</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined">
                <v-card-item class="d-flex justify-space-between align-center">
                    <div class="d-flex gap-3 mb-3">
                        <h4 class="text-h4">Introduction</h4>
                        <v-btn icon color="lightsuccess" size="29">
                        <Icon icon="solar:pen-linear" class="text-success" height="15" />
                        <v-tooltip activator="parent" location="bottom">Editar</v-tooltip>
                    </v-btn>
                    </div>
                    <p class="my-3 text-subtitle-1 lh-md textSecondary mb-6">
                        Hello, I am David McMichael. I love making websites and graphics. Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit.
                    </p>
                    <div class="d-flex gap-3 mb-5">
                        <BriefcaseIcon size="21" />
                        <span class="text-h6">Sir, P P Institute Of Science</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MailIcon size="21" />
                        <span class="text-h6">{{ email }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <DeviceDesktopIcon size="21" />
                        <span class="text-h6">www.xyz.com</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MapPinIcon size="21" />
                        <span class="text-h6">Newyork, USA - 100001</span>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
