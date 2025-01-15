
export interface minisidebar {
    icon?: string;
    id?:number;
    tooltip?:string
}
const MiniSideIcons: minisidebar[] = [
    {
        icon: 'layers-line-duotone',
        tooltip:'Dashboards',
        id: 1
    },
    {
        icon:'mirror-left-line-duotone',
        tooltip:'Others',
        id: 2
    }
]

export default MiniSideIcons;
