import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'Starter',
            path: '/',
            component: () => import('@/views/StarterPage.vue')
        },
        {
            name: 'Vacancies',
            path: '/vacancies/list-all',
            component: () => import('@/views/Vacancies.vue')
        },
        {
            name: 'Nueva Oferta Laboral',
            path: '/new/job-opportunity',
            component: () => import('@/components/vacancies/CreateVacant.vue'),
            beforeEnter: (to, from, next) => {
                const authStore = useAuthStore();
                if (authStore.userRole.toLowerCase() === 'reclutador') {
                    next();  // Permite la navegación si el rol es 'reclutador'
                } else {
                    next({ name: 'Vacancies' });  // Redirige si no es 'reclutador'
                }
            }
        },
        {
            name: 'Detalle Oferta Laboral',
            path: '/details/job-opportunity/:id',
            component: () => import('@/components/vacancies/VacantDetails.vue'),
            beforeEnter: (to, from, next) => {
                const authStore = useAuthStore();
                if (authStore.userRole.toLowerCase() === 'reclutador') {
                    next();  // Permite la navegación si el rol es 'reclutador'
                } else {
                    next({ name: 'Vacancies' });  // Redirige si no es 'reclutador'
                }
            }
        },
        {
            name: 'Vacante-Search-Result',
            path: '/vancants/searchresult/:id',
            component: () => import('@/components/vacancies/VacantSearchResult.vue')
        },
        {
            name: 'Sample Page 3',
            path: '/photos',
            component: () => import('@/views/Photospage.vue')
        },
        // START Profile routes **************************************************************
        {
            name: 'my Profile',
            path: '/profile/:id?',
            component: () => import('@/views/profile/Profilepage.vue')
        },
        {
            name: 'my Cv',
            path: '/cv/:id?',
            component: () => import('@/views/profile/Cvpage.vue')
        },
        {
            name: 'My projects',
            path: '/myprojects/:id?',
            component: () => import('@/views/profile/Myprojectspage.vue')
        },
        {
            name: 'User Applications',
            path: '/userapplications/:id?',
            component: () => import('@/views/profile/ProfileApplicationsPage.vue')
        },
        // END Profile routes **************************************************************
        {
            name: 'All-Projects',
            path: '/projects/list-all',
            component: () => import('@/views/Projects.vue')
        },
        {
            name: 'Projects-Kanban',
            path: '/projects/kanban-board',
            component: () => import('@/views/Kanban.vue')
        },
        {
            name: 'Proyecto-Detalle',
            path: '/project/details/:id',
            component: () => import('@/components/projects/ProjectDetails.vue')
        },
        {
            name: 'Nuevo Proyecto',
            path: '/projects/create-project',
            component: () => import('@/components/projects/CreateProject.vue'),
            beforeEnter: (to, from, next) => {
                const authStore = useAuthStore();
                if (authStore.userRole.toLowerCase() === 'docente') {
                    next();  // Permite la navegación si el rol es 'docente'
                } else {
                    next({ name: 'All-Projects' });  // Redirige si no es 'docente'
                }
            }
        },
    ]
};
  
export default MainRoutes;
