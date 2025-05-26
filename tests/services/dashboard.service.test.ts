import {
  dashboardService,
  type ActivityItem,
  type MonthlyStats,
} from "../../src/services/dashboard.service";
import { api } from "../../src/lib/axios";

// Mock the axios instance
jest.mock("../../src/lib/axios", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("DashboardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminStats", () => {
    it("should fetch admin dashboard statistics", async () => {
      const mockStats = {
        totalUsers: 150,
        totalBuildings: 25,
        totalApartments: 500,
        totalReadings: 1200,
        pendingReadings: 45,
        recentActivity: [
          {
            id: "1",
            type: "reading" as const,
            description: "New water reading submitted",
            timestamp: "2024-01-15T10:30:00Z",
            user: {
              firstName: "John",
              lastName: "Doe",
            },
          },
        ],
      };

      mockedApi.get.mockResolvedValue({ data: mockStats });

      const result = await dashboardService.getAdminStats();

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/admin/stats");
      expect(result).toEqual(mockStats);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockedApi.get.mockRejectedValue(error);

      await expect(dashboardService.getAdminStats()).rejects.toThrow(
        "API Error"
      );
      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/admin/stats");
    });
  });

  describe("getOwnerStats", () => {
    it("should fetch owner dashboard statistics", async () => {
      const mockStats = {
        totalApartments: 2,
        pendingReadings: 1,
        lastReading: {
          date: "2024-01-15",
          value: 125.5,
          apartment: "Apt 101",
        },
        monthlyConsumption: 45.2,
        recentActivity: [
          {
            id: "2",
            type: "reading" as const,
            description: "Water reading updated",
            timestamp: "2024-01-14T15:20:00Z",
          },
        ],
      };

      mockedApi.get.mockResolvedValue({ data: mockStats });

      const result = await dashboardService.getOwnerStats();

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/owner/stats");
      expect(result).toEqual(mockStats);
    });
  });

  describe("getRecentActivity", () => {
    it("should fetch recent activity with default limit", async () => {
      const mockActivity = [
        {
          id: "1",
          type: "user" as const,
          description: "New user registered",
          timestamp: "2024-01-15T10:30:00Z",
          user: {
            firstName: "Jane",
            lastName: "Smith",
          },
        },
        {
          id: "2",
          type: "building" as const,
          description: "Building updated",
          timestamp: "2024-01-14T14:20:00Z",
        },
      ];

      mockedApi.get.mockResolvedValue({ data: mockActivity });

      const result = await dashboardService.getRecentActivity();

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/activity", {
        params: { limit: 10 },
      });
      expect(result).toEqual(mockActivity);
    });

    it("should fetch recent activity with custom limit", async () => {
      const mockActivity: ActivityItem[] = [];
      mockedApi.get.mockResolvedValue({ data: mockActivity });

      await dashboardService.getRecentActivity(5);

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/activity", {
        params: { limit: 5 },
      });
    });
  });

  describe("getMonthlyStats", () => {
    it("should fetch monthly statistics with default months", async () => {
      const mockStats = [
        {
          month: "2024-01",
          readings: 120,
          consumption: 450.5,
          users: 15,
        },
        {
          month: "2023-12",
          readings: 115,
          consumption: 425.2,
          users: 14,
        },
      ];

      mockedApi.get.mockResolvedValue({ data: mockStats });

      const result = await dashboardService.getMonthlyStats();

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/monthly-stats", {
        params: { months: 12 },
      });
      expect(result).toEqual(mockStats);
    });

    it("should fetch monthly statistics with custom months", async () => {
      const mockStats: MonthlyStats[] = [];
      mockedApi.get.mockResolvedValue({ data: mockStats });

      await dashboardService.getMonthlyStats(6);

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/monthly-stats", {
        params: { months: 6 },
      });
    });
  });

  describe("getConsumptionTrends", () => {
    it("should fetch consumption trends with default period", async () => {
      const mockTrends = {
        labels: ["Jan", "Feb", "Mar"],
        data: [120.5, 135.2, 142.8],
        comparison: {
          current: 142.8,
          previous: 135.2,
          change: 5.6,
        },
      };

      mockedApi.get.mockResolvedValue({ data: mockTrends });

      const result = await dashboardService.getConsumptionTrends();

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/dashboard/consumption-trends",
        {
          params: { period: "month" },
        }
      );
      expect(result).toEqual(mockTrends);
    });

    it("should fetch consumption trends with custom period", async () => {
      const mockTrends = {
        labels: ["Week 1", "Week 2"],
        data: [25.5, 28.2],
        comparison: {
          current: 28.2,
          previous: 25.5,
          change: 10.6,
        },
      };

      mockedApi.get.mockResolvedValue({ data: mockTrends });

      const result = await dashboardService.getConsumptionTrends("week");

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/dashboard/consumption-trends",
        {
          params: { period: "week" },
        }
      );
      expect(result).toEqual(mockTrends);
    });
  });

  describe("getUserGrowth", () => {
    it("should fetch user growth statistics", async () => {
      const mockGrowth = {
        labels: ["Jan", "Feb", "Mar"],
        data: [10, 15, 22],
        total: 22,
        growth: 46.7,
      };

      mockedApi.get.mockResolvedValue({ data: mockGrowth });

      const result = await dashboardService.getUserGrowth();

      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard/user-growth");
      expect(result).toEqual(mockGrowth);
    });
  });

  describe("getBuildingOccupancy", () => {
    it("should fetch building occupancy statistics", async () => {
      const mockOccupancy = {
        occupied: 450,
        vacant: 50,
        total: 500,
        occupancyRate: 90.0,
      };

      mockedApi.get.mockResolvedValue({ data: mockOccupancy });

      const result = await dashboardService.getBuildingOccupancy();

      expect(mockedApi.get).toHaveBeenCalledWith(
        "/dashboard/building-occupancy"
      );
      expect(result).toEqual(mockOccupancy);
    });
  });
});
