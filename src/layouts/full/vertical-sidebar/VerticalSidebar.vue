<script setup lang="ts">
import { onMounted, ref, shallowRef, computed } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import sidebarItems from './sidebarItem';
import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Logo from '../logo/Logo.vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
// MiniSidebar Icons
import MiniSideIcons from './MinIconItems';

import LogoImage from '@/assets/images/logos/JumpStart.png';

const route = useRoute();

const findTitleByPath = (items: any, path: any) => {
    let title = '';

    for (const item of items) {
        if (item.to === path) {
            title = item.id;
            break;
        } else if (item.children) {
            for (const child of item.children) {
                if (child.to === path) {
                    title = item.id;
                    break;
                }
            }
        }
    }

    return title;
};
const foundId = findTitleByPath(sidebarItems, route.path);
const getCurrent = foundId ? foundId : 1;
const currentMenu = ref<any>(getCurrent);
function showData(data: any) {
    currentMenu.value = data;
}

// MiniSidebar Icons End
const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);
</script>

<template>
    <!-- Minisidebar Icons -->
    <v-navigation-drawer class="mini-sidebar-drawer" v-model="customizer.Sidebar_drawer" top="0" rail rail-width="80">
        <perfect-scrollbar class="miniscrollnavbar">
            <v-list-item class="px-0">
                <!-- Toggle Sidebar Button -->
                <div class="px-4 mb-3 mt-2">
                    <v-btn
                        class="hidden-md-and-down toggle-sidebar-btn"
                        icon
                        rounded="lg"
                        variant="flat"
                        color="primary"
                        @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
                    >
                        <Icon icon="solar:hamburger-menu-line-duotone" height="22" />
                    </v-btn>
                </div>

                <div class="miniicons mt-lg-0 mt-4">
                    <!-- MiniSidebar Icons -->
                    <div class="d-flex flex-column gap-2">
                        <div class="miniicons-list px-4" v-for="menu in MiniSideIcons" :key="menu.icon">
                            <v-btn
                                rounded="lg"
                                flat
                                icon
                                variant="flat"
                                @click="showData(menu.id)"
                                :class="{ 'mini-icon-active': currentMenu === menu.id }"
                                class="mini-icon-btn"
                            >
                                <Icon :icon="'solar:' + menu.icon" width="22" />
                                <!-- Tooltip on Hover -->
                                <v-tooltip activator="parent" location="end" class="custom-tooltip">{{ menu.tooltip }}</v-tooltip>
                            </v-btn>
                        </div>
                    </div>
                </div>
            </v-list-item>
        </perfect-scrollbar>
    </v-navigation-drawer>

    <!-- LeftSidebar Items -->
    <v-navigation-drawer
        v-model="customizer.Sidebar_drawer"
        elevation="0"
        rail-width="1"
        app
        top="0"
        class="leftSidebar modern-sidebar"
        :rail="customizer.mini_sidebar"
        width="260"
    >
        <!---Logo part -->
        <div class="sidebar-logo-container pa-4 pb-3">
            <div class="logo-wrapper">
                <img :src="LogoImage" alt="JumpStart" class="sidebar-logo" />
            </div>
        </div>

        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar">
            <div class="px-3 py-2 sidebar-menus">
                <v-list class="py-1 modern-nav-list">
                    <template v-for="(item, i) in sidebarMenu">
                        <template v-if="currentMenu == item.id">
                            <!---Item Sub Header -->
                            <NavGroup :item="item" v-if="item.header" :key="item.title" />
                            <!---If Has Child -->
                            <template v-for="sItem in item.children">
                                <NavCollapse class="leftPadding" :item="sItem" :level="0" v-if="sItem.children" />
                                <NavItem :item="sItem" class="leftPadding" v-else />
                            </template>
                        </template>
                        <!---Single Item-->

                        <!---End Single Item-->
                        <!---End Single Item-->
                    </template>
                </v-list>
            </div>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>

<style scoped>
.mini-sidebar-drawer {
    background: linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%) !important;
    border-right: 1px solid rgba(99, 102, 241, 0.1);
}

.toggle-sidebar-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s ease;
}

.toggle-sidebar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}

.mini-icon-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: transparent !important;
}

.mini-icon-btn:hover {
    background-color: rgba(99, 102, 241, 0.1) !important;
    transform: translateX(2px);
}

.mini-icon-active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%) !important;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
    color: white !important;
}

.modern-sidebar {
    background: linear-gradient(180deg, #ffffff 0%, rgba(249, 250, 251, 0.8) 100%) !important;
    border-right: 1px solid rgba(99, 102, 241, 0.08);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04) !important;
}

.sidebar-logo-container {
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    margin-bottom: 8px;
}

.logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
}

.logo-wrapper:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.02);
}

.sidebar-logo {
    max-width: 100%;
    height: auto;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.1));
}

.modern-nav-list {
    background: transparent !important;
}
</style>
