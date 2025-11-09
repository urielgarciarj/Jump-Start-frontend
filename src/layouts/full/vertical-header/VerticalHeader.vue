<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import LanguageDD from './LanguageDD.vue';
import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';
import Searchbar from './Searchbar.vue';
import RightMobileSidebar from './RightMobileSidebar.vue';
import Navigations from './Navigations.vue';
import { Icon } from '@iconify/vue';
import Logo from '../logo/Logo.vue';
import ThemeToggler from './ThemeToggler.vue';
const customizer = useCustomizerStore();
const showSearch = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
function searchbox() {
    showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
    priority.value = newPriority;
});

</script>

<template>
    <v-app-bar elevation="0" :priority="priority" height="75" class="main-head modern-header">
        <v-btn
            class="hidden-lg-and-up custom-hover-primary mobile-menu-btn"
            size="small"
            variant="flat"
            color="primary"
            icon
            rounded="lg"
            @click.stop="customizer.SET_SIDEBAR_DRAWER"
        >
            <Icon icon="solar:hamburger-menu-line-duotone" height="22" />
        </v-btn>

        <!-- ---------------------------------------------- -->
        <!-- Search part -->
        <!-- ---------------------------------------------- -->
        <div class="header-search-wrapper">
            <Searchbar />
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <!-- ---------------------------------------------- -->
        <!-- Mobile Logo -->
        <!-- ---------------------------------------------- -->
        <div class="hidden-md-and-up mobile-logo-wrapper">
            <Logo />
        </div>

        <!-- ThemeToggler -->
        <div class="header-action-btn">
            <ThemeToggler/>
        </div>

        <!-- ---------------------------------------------- -->
        <!-- Notification -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <NotificationDD />
        </div> -->
        
        <!-- ---------------------------------------------- -->
        <!-- User Profile -->
        <!-- ---------------------------------------------- -->
        <div class="hidden-sm-and-down header-profile-wrapper">
            <ProfileDD />
        </div>

        <!----Mobile ----->
        <v-menu :close-on-content-click="true" class="mobile_popup">
            <template v-slot:activator="{ props }">
                <v-btn icon class="hidden-md-and-up custom-hover-primary mobile-profile-btn" color="primary" variant="flat" v-bind="props" size="small" rounded="lg">
                    <!-- <Icon icon="solar:menu-dots-bold-duotone" height="22"   /> -->
                    <ProfileDD />
                </v-btn>
            </template>
            <!-- <v-sheet rounded="lg" elevation="10" class="mt-4 dropdown-box px-4 py-3">
                <div class="d-flex justify-space-between align-center">
                    <RightMobileSidebar/>
                    <LanguageDD />
                    <v-btn icon variant="text" class="mr-sm-3 mr-2 custom-hover-primary" to="/ecommerce/checkout"
                        size="small">
                        <v-badge color="primary" content="0" offset-x="-4" offset-y="-6">
                            <Icon icon="solar:cart-large-2-outline" height="22"   />
                        </v-badge>
                    </v-btn>
                    <NotificationDD />
                    <ProfileDD />
                </div>
            </v-sheet> -->
        </v-menu>
    </v-app-bar>
</template>

<style scoped>
.modern-header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.98) 100%) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04) !important;
}

.mobile-menu-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}

.header-search-wrapper {
    margin-left: 8px;
}

.header-action-btn {
    margin-right: 8px;
}

.header-profile-wrapper {
    margin-right: 8px;
}

.mobile-logo-wrapper {
    margin-left: 8px;
}

.mobile-profile-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s ease;
}

.mobile-profile-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}
</style>
