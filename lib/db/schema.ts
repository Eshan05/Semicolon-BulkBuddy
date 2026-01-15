import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).default(
    false,
  ),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = sqliteTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const member = sqliteTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = sqliteTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const twoFactor = sqliteTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ],
);

export const passkey = sqliteTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: integer("backed_up", { mode: "boolean" }).notNull(),
    transports: text("transports"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ],
);

export const deviceCode = sqliteTable("device_code", {
  id: text("id").primaryKey(),
  deviceCode: text("device_code").notNull(),
  userCode: text("user_code").notNull(),
  userId: text("user_id"),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  status: text("status").notNull(),
  lastPolledAt: integer("last_polled_at", { mode: "timestamp_ms" }),
  pollingInterval: integer("polling_interval"),
  clientId: text("client_id"),
  scope: text("scope"),
});

export const companyProfile = sqliteTable(
  "company_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    legalName: text("legal_name").notNull(),
    companyType: text("company_type").notNull(),
    registrationNumber: text("registration_number"),
    taxId: text("tax_id"),
    website: text("website"),
    yearFounded: integer("year_founded"),
    employeeCount: text("employee_count"),
    annualRevenueBand: text("annual_revenue_band"),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    city: text("city").notNull(),
    state: text("state"),
    country: text("country").notNull(),
    postalCode: text("postal_code"),
    lat: real("lat"),
    lng: real("lng"),
    contactName: text("contact_name").notNull(),
    contactRole: text("contact_role"),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    alternatePhone: text("alternate_phone"),
    status: text("status").default("pending").notNull(),
    statusReason: text("status_reason"),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("company_profile_user_uidx").on(table.userId),
    uniqueIndex("company_profile_name_uidx").on(table.companyName),
    index("company_profile_status_idx").on(table.status),
  ],
);

export const buyerProfile = sqliteTable(
  "buyer_profile",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companyProfile.id, { onDelete: "cascade" }),
    procurementCategories: text("procurement_categories"),
    avgMonthlySpend: text("avg_monthly_spend"),
    typicalOrderVolume: text("typical_order_volume"),
    deliveryPreferences: text("delivery_preferences"),
    paymentTerms: text("payment_terms"),
    storageCapacity: text("storage_capacity"),
    complianceNeeds: text("compliance_needs"),
    preferredSuppliers: text("preferred_suppliers"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("buyer_profile_company_uidx").on(table.companyId)],
);

export const supplierProfile = sqliteTable(
  "supplier_profile",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companyProfile.id, { onDelete: "cascade" }),
    productCategories: text("product_categories"),
    productionCapacity: text("production_capacity"),
    minOrderQuantity: text("min_order_quantity"),
    leadTimeDays: integer("lead_time_days"),
    certifications: text("certifications"),
    warehouseLocations: text("warehouse_locations"),
    qualityAssurance: text("quality_assurance"),
    logisticsCapabilities: text("logistics_capabilities"),
    paymentTerms: text("payment_terms"),
    serviceRegions: text("service_regions"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("supplier_profile_company_uidx").on(table.companyId)],
);

export const verificationDocument = sqliteTable(
  "verification_document",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companyProfile.id, { onDelete: "cascade" }),
    docType: text("doc_type").notNull(),
    fileName: text("file_name"),
    fileUrl: text("file_url"),
    status: text("status").default("pending").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("verification_document_company_idx").on(table.companyId)],
);

export const pool = sqliteTable(
  "pool",
  {
    id: text("id").primaryKey(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    material: text("material").notNull(),
    specification: text("specification"),
    unit: text("unit").default("kg").notNull(),
    targetQuantity: integer("target_quantity").notNull(),
    currentQuantity: integer("current_quantity").default(0).notNull(),
    minFillPercent: integer("min_fill_percent").default(60).notNull(),
    status: text("status").default("filling").notNull(),
    retailPriceCents: integer("retail_price_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    locationCity: text("location_city"),
    locationState: text("location_state"),
    locationCountry: text("location_country"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("pool_creator_idx").on(table.creatorId),
    index("pool_status_idx").on(table.status),
  ],
);

export const poolPriceTier = sqliteTable(
  "pool_price_tier",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pool.id, { onDelete: "cascade" }),
    minPercent: integer("min_percent").notNull(),
    pricePerUnitCents: integer("price_per_unit_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("pool_price_tier_pool_idx").on(table.poolId)],
);

export const poolParticipant = sqliteTable(
  "pool_participant",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pool.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    participantType: text("participant_type").default("buyer").notNull(),
    quantity: integer("quantity").notNull(),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false).notNull(),
    displayName: text("display_name"),
    specNotes: text("spec_notes"),
    commitStatus: text("commit_status").default("none").notNull(),
    committedAt: integer("committed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("pool_participant_pool_idx").on(table.poolId),
    index("pool_participant_user_idx").on(table.userId),
    uniqueIndex("pool_participant_unique").on(table.poolId, table.userId),
  ],
);

export const poolActivity = sqliteTable(
  "pool_activity",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pool.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    message: text("message").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("pool_activity_pool_idx").on(table.poolId)],
);

export const poolMessage = sqliteTable(
  "pool_message",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pool.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    senderRole: text("sender_role").default("buyer").notNull(),
    displayName: text("display_name"),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).default(false).notNull(),
    message: text("message").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("pool_message_pool_idx").on(table.poolId),
    index("pool_message_sender_idx").on(table.senderId),
  ],
);

export const poolVibeCheck = sqliteTable(
  "pool_vibe_check",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pool.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    matchedSpecs: integer("matched_specs", { mode: "boolean" }).notNull(),
    chatHelpful: integer("chat_helpful", { mode: "boolean" }).notNull(),
    wouldPoolAgain: integer("would_pool_again", { mode: "boolean" }).notNull(),
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("pool_vibe_check_pool_idx").on(table.poolId),
    index("pool_vibe_check_user_idx").on(table.userId),
    uniqueIndex("pool_vibe_check_unique").on(table.poolId, table.userId),
  ],
);

export const messageThread = sqliteTable(
  "message_thread",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    lastMessageAt: integer("last_message_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("message_thread_lastMessageAt_idx").on(table.lastMessageAt)],
);

export const messageThreadParticipant = sqliteTable(
  "message_thread_participant",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => messageThread.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastReadAt: integer("last_read_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("message_thread_participant_thread_idx").on(table.threadId),
    index("message_thread_participant_user_idx").on(table.userId),
    uniqueIndex("message_thread_participant_unique").on(table.threadId, table.userId),
  ],
);

export const directMessage = sqliteTable(
  "direct_message",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => messageThread.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("direct_message_thread_idx").on(table.threadId),
    index("direct_message_sender_idx").on(table.senderId),
  ],
);

export const notification = sqliteTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("notification_user_idx").on(table.userId),
    index("notification_readAt_idx").on(table.readAt),
  ],
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("audit_log_actor_idx").on(table.actorId),
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
    index("audit_log_createdAt_idx").on(table.createdAt),
  ],
);

export const poolSupplierBid = sqliteTable(
  "pool_supplier_bid",
  {
    id: text("id").primaryKey(),
    poolId: text("pool_id")
      .notNull()
      .references(() => pool.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    offeredPriceCents: integer("offered_price_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    maxQuantity: integer("max_quantity"),
    notes: text("notes"),
    status: text("status").default("open").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("pool_supplier_bid_pool_idx").on(table.poolId),
    index("pool_supplier_bid_supplier_idx").on(table.supplierId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  twoFactors: many(twoFactor),
  passkeys: many(passkey),
  companyProfiles: many(companyProfile),
  poolsCreated: many(pool),
  poolParticipants: many(poolParticipant),
  poolVibeChecks: many(poolVibeCheck),
  threadParticipants: many(messageThreadParticipant),
  directMessagesSent: many(directMessage),
  notifications: many(notification),
  auditLogs: many(auditLog),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const companyProfileRelations = relations(
  companyProfile,
  ({ one, many }) => ({
    user: one(user, {
      fields: [companyProfile.userId],
      references: [user.id],
    }),
    buyerProfile: one(buyerProfile, {
      fields: [companyProfile.id],
      references: [buyerProfile.companyId],
    }),
    supplierProfile: one(supplierProfile, {
      fields: [companyProfile.id],
      references: [supplierProfile.companyId],
    }),
    documents: many(verificationDocument),
  }),
);

export const buyerProfileRelations = relations(buyerProfile, ({ one }) => ({
  company: one(companyProfile, {
    fields: [buyerProfile.companyId],
    references: [companyProfile.id],
  }),
}));

export const supplierProfileRelations = relations(
  supplierProfile,
  ({ one }) => ({
    company: one(companyProfile, {
      fields: [supplierProfile.companyId],
      references: [companyProfile.id],
    }),
  }),
);

export const verificationDocumentRelations = relations(
  verificationDocument,
  ({ one }) => ({
    company: one(companyProfile, {
      fields: [verificationDocument.companyId],
      references: [companyProfile.id],
    }),
  }),
);

export const poolRelations = relations(pool, ({ one, many }) => ({
  creator: one(user, {
    fields: [pool.creatorId],
    references: [user.id],
  }),
  priceTiers: many(poolPriceTier),
  participants: many(poolParticipant),
  activities: many(poolActivity),
  messages: many(poolMessage),
  vibeChecks: many(poolVibeCheck),
  supplierBids: many(poolSupplierBid),
}));

export const poolPriceTierRelations = relations(poolPriceTier, ({ one }) => ({
  pool: one(pool, {
    fields: [poolPriceTier.poolId],
    references: [pool.id],
  }),
}));

export const poolParticipantRelations = relations(poolParticipant, ({ one }) => ({
  pool: one(pool, {
    fields: [poolParticipant.poolId],
    references: [pool.id],
  }),
  user: one(user, {
    fields: [poolParticipant.userId],
    references: [user.id],
  }),
}));

export const poolActivityRelations = relations(poolActivity, ({ one }) => ({
  pool: one(pool, {
    fields: [poolActivity.poolId],
    references: [pool.id],
  }),
}));

export const poolMessageRelations = relations(poolMessage, ({ one }) => ({
  pool: one(pool, {
    fields: [poolMessage.poolId],
    references: [pool.id],
  }),
  sender: one(user, {
    fields: [poolMessage.senderId],
    references: [user.id],
  }),
}));

export const poolVibeCheckRelations = relations(poolVibeCheck, ({ one }) => ({
  pool: one(pool, {
    fields: [poolVibeCheck.poolId],
    references: [pool.id],
  }),
  user: one(user, {
    fields: [poolVibeCheck.userId],
    references: [user.id],
  }),
}));

export const poolSupplierBidRelations = relations(poolSupplierBid, ({ one }) => ({
  pool: one(pool, {
    fields: [poolSupplierBid.poolId],
    references: [pool.id],
  }),
  supplier: one(user, {
    fields: [poolSupplierBid.supplierId],
    references: [user.id],
  }),
}));

export const messageThreadRelations = relations(messageThread, ({ many }) => ({
  participants: many(messageThreadParticipant),
  messages: many(directMessage),
}));

export const messageThreadParticipantRelations = relations(
  messageThreadParticipant,
  ({ one }) => ({
    thread: one(messageThread, {
      fields: [messageThreadParticipant.threadId],
      references: [messageThread.id],
    }),
    user: one(user, {
      fields: [messageThreadParticipant.userId],
      references: [user.id],
    }),
  }),
);

export const directMessageRelations = relations(directMessage, ({ one }) => ({
  thread: one(messageThread, {
    fields: [directMessage.threadId],
    references: [messageThread.id],
  }),
  sender: one(user, {
    fields: [directMessage.senderId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(user, {
    fields: [auditLog.actorId],
    references: [user.id],
  }),
}));
