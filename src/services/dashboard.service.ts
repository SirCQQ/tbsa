import { api } from "@/lib/axios";

export type ActivityType = "reading" | "user" | "building" | "apartment";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
  };
};

export type DashboardStats = {
  totalUsers: number;
  totalBuildings: number;
  totalApartments: number;
  totalReadings: number;
  pendingReadings: number;
  recentActivity: ActivityItem[];
};

export type OwnerDashboardStats = {
  totalApartments: number;
  pendingReadings: number;
  lastReading?: {
    date: string;
    value: number;
    apartment: string;
  };
  monthlyConsumption: number;
  recentActivity: ActivityItem[];
};

export type MonthlyStats = {
  month: string;
  readings: number;
  consumption: number;
  users: number;
};

export type ConsumptionTrends = {
  labels: string[];
  data: number[];
  comparison: {
    current: number;
    previous: number;
    change: number;
  };
};

export type UserGrowth = {
  labels: string[];
  data: number[];
  total: number;
  growth: number;
};

export type BuildingOccupancy = {
  occupied: number;
  vacant: number;
  total: number;
  occupancyRate: number;
};

export type ConsumptionPeriod = "week" | "month" | "year";

export const dashboardService = {
  // Get admin dashboard statistics
  async getAdminStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/dashboard/admin/stats");
    return response.data;
  },

  // Get owner dashboard statistics
  async getOwnerStats(): Promise<OwnerDashboardStats> {
    const response = await api.get<OwnerDashboardStats>(
      "/dashboard/owner/stats"
    );
    return response.data;
  },

  // Get recent activity
  async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
    const response = await api.get<ActivityItem[]>("/dashboard/activity", {
      params: { limit },
    });
    return response.data;
  },

  // Get monthly statistics for charts
  async getMonthlyStats(months = 12): Promise<MonthlyStats[]> {
    const response = await api.get<MonthlyStats[]>("/dashboard/monthly-stats", {
      params: { months },
    });
    return response.data;
  },

  // Get consumption trends
  async getConsumptionTrends(
    period: ConsumptionPeriod = "month"
  ): Promise<ConsumptionTrends> {
    const response = await api.get<ConsumptionTrends>(
      "/dashboard/consumption-trends",
      {
        params: { period },
      }
    );
    return response.data;
  },

  // Get user growth statistics
  async getUserGrowth(): Promise<UserGrowth> {
    const response = await api.get<UserGrowth>("/dashboard/user-growth");
    return response.data;
  },

  // Get building occupancy statistics
  async getBuildingOccupancy(): Promise<BuildingOccupancy> {
    const response = await api.get<BuildingOccupancy>(
      "/dashboard/building-occupancy"
    );
    return response.data;
  },
};
