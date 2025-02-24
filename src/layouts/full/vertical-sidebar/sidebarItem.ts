export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    id?: number;
    to?: string;
    chip?: string;
    BgColor?: string;
    chipBgColor?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
}
const sidebarItem: menu[] = [
    {
        header: 'JumpStart',
        id: 1,
        children: [
            {
                title: 'Mi Cuenta',
                icon: 'shield-user-line-duotone',
                to: '/profile'
            },
            {
                title: 'Publicaciones',
                icon: 'widget-add-line-duotone',
                to: '/'
            },
            {
                title: 'Ofertas Laborales',
                icon: 'card-search-line-duotone',
                to: '/vacancies/list-all'
            },
            {
                title: 'Proyectos',
                icon: 'passport-line-duotone',
                to: '/projects/list-all'
            },
            {
                title: 'Kanban',
                icon: 'airbuds-case-minimalistic-line-duotone',
                to: '/projects/kanban-board'
            }
        ]
    },
    {
        header: 'Multi Level',
        id: 2,
        children: [
            {
                title: 'Menu Level',
                icon: 'align-left-line-duotone',
                to: '#',
                id: 8,
                children: [
                    {
                        title: 'Level 1',
                        to: '/level1'
                    },
                    {
                        title: 'Level 1 ',
                        to: '/2level',
                        children: [
                            {
                                title: 'Level 2',
                                to: '/barry'
                            },
                            {
                                title: 'Level 2',
                                to: '/2.2level',
                                children: [
                                    {
                                        title: 'Level 3',
                                        to: '/barry'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        header: 'More Options',
        id: 2,
        children: [
            {
                title: 'Applications',
                icon: 'check-circle-bold',
                BgColor: 'primary'
            },
            {
                title: 'Form Options',
                icon: 'check-circle-bold',
                BgColor: 'secondary'
            },
            {
                title: 'Table Variations',
                icon: 'check-circle-bold',
                BgColor: 'error'
            },
            {
                title: 'Charts Selection',
                icon: 'check-circle-bold',
                BgColor: 'warning'
            },
            {
                title: 'Widgets',
                icon: 'check-circle-bold',
                BgColor: 'success'
            }
        ]
    }
];

export default sidebarItem;
