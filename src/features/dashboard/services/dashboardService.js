import {
  dashboardAlertsMock,
  dashboardHeroMock,
  dashboardLoanTrendMock,
  dashboardQuickActionsMock,
  dashboardStatsMock,
} from "../data/dashboardMock";

export const fetchDashboardHero = async () => dashboardHeroMock;

export const fetchDashboardStats = async () => dashboardStatsMock;

export const fetchDashboardAlerts = async () => dashboardAlertsMock;

export const fetchDashboardQuickActions = async () => dashboardQuickActionsMock;

export const fetchDashboardLoanTrend = async () => dashboardLoanTrendMock;
