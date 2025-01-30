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
            name: 'Sample Page 2',
            path: '/samplepage',
            component: () => import('@/views/Samplepage.vue')
        },
        {
            name: 'Sample Page 3',
            path: '/photos',
            component: () => import('@/views/Photospage.vue')
        },
        {
            name: 'my Profile',
            path: '/profile',
            component: () => import('@/views/Profilepage.vue')
        },
        {
            name: 'my Cv',
            path: '/cv',
            component: () => import('@/views/Cvpage.vue')
        },
        {
            name: 'My projects',
            path: '/myprojects',
            component: () => import('@/views/Myprojectspage.vue')
        },
    ]
};

export default MainRoutes;
