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
    <v-navigation-drawer class="bg-light" v-model="customizer.Sidebar_drawer" top="0" rail rail-width="80">
        <perfect-scrollbar class="miniscrollnavbar">
            <v-list-item class="px-0">
                <!-- Toggle Sidebar Button -->
                <div class="px-4 mb-3">
                    <v-btn
                        class="hidden-md-and-down my-2"
                        icon
                        rounded="md"
                        variant="plain"
                        @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
                    >
                        <Icon icon="solar:hamburger-menu-line-duotone" height="25" />
                    </v-btn>
                </div>

                <div class="miniicons mt-lg-0 mt-4">
                    <!-- MiniSidebar Icons -->
                    <div class="d-flex flex-column gap-2">
                        <div class="miniicons-list px-4" v-for="menu in MiniSideIcons" :key="menu.icon">
                            <v-btn
                                rounded="md"
                                flat
                                icon
                                variant="plain"
                                @click="showData(menu.id)"
                                :class="{ 'bg-primary opacity-1': currentMenu === menu.id }"
                            >
                                <Icon :icon="'solar:' + menu.icon" width="25" />
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
        class="leftSidebar"
        :rail="customizer.mini_sidebar"
        width="240"
    >
        <!---Logo part -->
        <div class="pa-4 pb-0">
            <!-- <Logo /> -->
            <img :src="LogoImage" width="180" height="50" />
        </div>

        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar">
            <div class="px-4 py-0 sidebar-menus">
                <v-list class="py-1">
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
