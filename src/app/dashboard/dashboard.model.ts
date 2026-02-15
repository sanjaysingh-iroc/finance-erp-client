
export interface DashboardModel {
    id: number;
    moduleName: string;
}

export interface DashboardAclModel {
    id: number;
    dashboardId: number;
    userTypeId: number;
}

export class UpdateDashboardAclModel {
    dashboardIds: number[];
    userTypeId: number;
}

