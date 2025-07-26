import { z } from "zod";
import {
  UserType,
  BuildingType,
  InviteCodeStatus,
  ApartmentRole,
  ResourcesEnum as PrismaResourcesEnum,
  ActionsEnum as PrismaActionsEnum,
  PriorityEnum as PrismaPriorityEnum,
} from "@prisma/client/";
// ======= Enums =======

export const userTypeSchemaEnum = z.enum([
  "SUPER_ADMIN",
  "ADMINISTRATOR",
  "RESIDENT",
  "OWNER",
  "TENANT",
]);
export const buildingTypeSchemaEnum = z.enum([
  BuildingType.RESIDENTIAL,
  BuildingType.COMMERCIAL,
  BuildingType.MIXED,
]);
export const inviteCodeStatusSchemaEnum = z.enum([
  InviteCodeStatus.ACTIVE,
  InviteCodeStatus.USED,
  InviteCodeStatus.EXPIRED,
  InviteCodeStatus.REVOKED,
]);
export const apartmentRoleSchemaEnum = z.enum([
  ApartmentRole.OWNER,
  ApartmentRole.CO_OWNER,
  ApartmentRole.TENANT,
  ApartmentRole.MANAGER,
  ApartmentRole.FAMILY,
]);
export const resourcesSchemaEnum = z.enum([
  PrismaResourcesEnum.USERS,
  PrismaResourcesEnum.ORGANIZATIONS,
  PrismaResourcesEnum.BUILDINGS,
  PrismaResourcesEnum.APARTMENTS,
  PrismaResourcesEnum.WATER_READINGS,
  PrismaResourcesEnum.WATER_METERS,
  PrismaResourcesEnum.WATER_BILLS,
  PrismaResourcesEnum.READING_NOTIFICATIONS,
  PrismaResourcesEnum.ROLES,
  PrismaResourcesEnum.PERMISSIONS,
  PrismaResourcesEnum.INVITE_CODES,
  PrismaResourcesEnum.ADMIN_GRANT,
  PrismaResourcesEnum.SUBSCRIPTION_PLANS,
  PrismaResourcesEnum.MODULES,
  PrismaResourcesEnum.PLAN_MODULES,
  PrismaResourcesEnum.APARTMENT_RESIDENTS,
  PrismaResourcesEnum.ADMINISTRATOR,
  PrismaResourcesEnum.SUPER_ADMIN,
]);
export const actionsSchemaEnum = z.enum([
  PrismaActionsEnum.READ,
  PrismaActionsEnum.CREATE,
  PrismaActionsEnum.UPDATE,
  PrismaActionsEnum.DELETE,
]);
export const prioritySchemaEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

// ======= Subscription & Organization Models =======

export const subscriptionPlanSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  price: z.number(),
  billingPeriod: z.string(),
  features: z.any(), // JSON
  maxBuildings: z.number().int().nullable().optional(),
  maxApartments: z.number().int().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const moduleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const planModuleSchema = z.object({
  id: z.string().uuid().optional(),
  subscriptionPlanId: z.string(),
  moduleId: z.string(),
  isIncluded: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const organizationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  subscriptionPlanId: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

// ======= User & Authentication Models =======

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  emailVerified: z.date().nullable().optional(),
  image: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const sessionSchema = z.object({
  id: z.string().uuid().optional(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.date(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userOrganizationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  organizationId: z.string(),
  permissionId: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ======= Permission & Role Models =======

export const permissionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  code: z.string(),
  resource: resourcesSchemaEnum,
  action: actionsSchemaEnum,
  description: z.string().nullable().optional(),
  moduleId: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const roleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable().optional(),
  isSystem: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const organizationRoleSchema = z.object({
  id: z.string().uuid().optional(),
  organizationId: z.string(),
  roleId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userRoleSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  roleId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const rolePermissionSchema = z.object({
  id: z.string().uuid().optional(),
  roleId: z.string(),
  permissionId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ======= Building & Apartment Models =======

export const buildingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  code: z.string(),
  address: z.string(),
  type: buildingTypeSchemaEnum,
  floors: z.number().int(),
  totalApartments: z.number().int().optional(),
  organizationId: z.string(),
  description: z.string().nullable().optional(),
  readingDay: z.number().int().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const apartmentSchema = z.object({
  id: z.string().uuid().optional(),
  number: z.string(),
  floor: z.number().int(),
  buildingId: z.string(),
  isOccupied: z.boolean().optional(),
  occupantCount: z.number().int().optional(),
  surface: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const apartmentResidentSchema = z.object({
  id: z.string().uuid().optional(),
  apartmentId: z.string(),
  userId: z.string(),
  role: apartmentRoleSchemaEnum,
  isActive: z.boolean().optional(),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

// ======= Water Management Models =======

export const waterMeterSchema = z.object({
  id: z.string().uuid().optional(),
  serialNumber: z.string(),
  apartmentId: z.string(),
  isActive: z.boolean().optional(),
  location: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const waterReadingSchema = z.object({
  id: z.string().uuid().optional(),
  waterMeterId: z.string(),
  value: z.number(),
  photo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isApproved: z.boolean().optional(),
  approvedById: z.string().nullable().optional(),
  submittedById: z.string(),
  readingDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const waterBillSchema = z.object({
  id: z.string().uuid().optional(),
  waterReadingId: z.string(),
  amount: z.number(),
  dueDate: z.date(),
  isPaid: z.boolean().optional(),
  paidAt: z.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const readingNotificationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  waterReadingId: z.string(),
  dueDate: z.date(),
  isRead: z.boolean().optional(),
  readAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

// ======= Utility Models =======

export const inviteCodeSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string(),
  email: z.string().email(),
  apartmentId: z.string(),
  status: inviteCodeStatusSchemaEnum.optional(),
  expiresAt: z.date(),
  usedAt: z.date().nullable().optional(),
  createdById: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const auditLogSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  oldValues: z.any().nullable().optional(),
  newValues: z.any().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.date().optional(),
});

export const emailLogSchema = z.object({
  id: z.string().optional(),
  recipient: z.string(),
  sender: z.string(),
  subject: z.string(),
  organizationId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  template: z.string().nullable().optional(),
  messageId: z.string().nullable().optional(),
  status: z.string(),
  errorMessage: z.string().nullable().optional(),
  sentAt: z.date().optional(),
  deliveredAt: z.date().nullable().optional(),
  openedAt: z.date().nullable().optional(),
  clickedAt: z.date().nullable().optional(),
  bouncedAt: z.date().nullable().optional(),
  complaintAt: z.date().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

// ======= NextAuth.js Models =======

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable().optional(),
  access_token: z.string().nullable().optional(),
  expires_at: z.number().int().nullable().optional(),
  token_type: z.string().nullable().optional(),
  scope: z.string().nullable().optional(),
  id_token: z.string().nullable().optional(),
  session_state: z.string().nullable().optional(),
});

export const oAuthSessionSchema = z.object({
  id: z.string().uuid().optional(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.date(),
});

export const verificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
});

export type UserTypeEnum = z.infer<typeof userTypeSchemaEnum>;
export type BuildingTypeEnum = z.infer<typeof buildingTypeSchemaEnum>;
export type InviteCodeStatusEnum = z.infer<typeof inviteCodeStatusSchemaEnum>;
export type ApartmentRoleEnum = z.infer<typeof apartmentRoleSchemaEnum>;
export type ResourcesEnum = z.infer<typeof resourcesSchemaEnum>;
export type ActionsEnum = z.infer<typeof actionsSchemaEnum>;
export type PriorityEnum = z.infer<typeof prioritySchemaEnum>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type PlanModule = z.infer<typeof planModuleSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type UserOrganization = z.infer<typeof userOrganizationSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type Role = z.infer<typeof roleSchema>;
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type RolePermission = z.infer<typeof rolePermissionSchema>;
export type Building = z.infer<typeof buildingSchema>;
export type Apartment = z.infer<typeof apartmentSchema>;
export type ApartmentResident = z.infer<typeof apartmentResidentSchema>;
export type WaterMeter = z.infer<typeof waterMeterSchema>;
export type WaterReading = z.infer<typeof waterReadingSchema>;
export type WaterBill = z.infer<typeof waterBillSchema>;
export type ReadingNotification = z.infer<typeof readingNotificationSchema>;
export type InviteCode = z.infer<typeof inviteCodeSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type EmailLog = z.infer<typeof emailLogSchema>;
export type Account = z.infer<typeof accountSchema>;
export type OAuthSession = z.infer<typeof oAuthSessionSchema>;
export type VerificationToken = z.infer<typeof verificationTokenSchema>;
