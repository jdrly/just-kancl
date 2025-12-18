import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    organizations: defineTable({
        name: v.string(),
        slug: v.optional(v.string()),
        ownerId: v.id('users'),
        isActive: v.boolean(),
        createdAt: v.number(),
    })
        .index('by_owner', ['ownerId'])
        .index('by_slug', ['slug']),

    users: defineTable({
        // Authentication
        email: v.string(),
        passwordHash: v.string(),
        emailVerified: v.optional(v.boolean()),

        // Profile (temporarily optional for migration)
        name: v.optional(v.string()), // Legacy field - to be removed
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        phone: v.optional(v.string()),
        locale: v.optional(v.string()),

        // Organization & Role
        organizationId: v.optional(v.id('organizations')),
        role: v.optional(
            v.union(
                v.literal('personal'),
                v.literal('owner'),
                v.literal('admin'),
                v.literal('manager'),
                v.literal('employee')
            )
        ),

        // Account status
        isActive: v.optional(v.boolean()),
        lastLoginAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
    })
        .index('by_email', ['email'])
        .index('by_organization', ['organizationId'])
        .index('by_role', ['role']),

    sessions: defineTable({
        userId: v.id('users'),
        expiresAt: v.number(),
    }).index('by_user', ['userId']),

    tasks: defineTable({
        text: v.string(),
        isCompleted: v.boolean(),
    }),

    translations: defineTable({
        locale: v.string(),
        translations: v.record(v.string(), v.string()),
    }).index('by_locale', ['locale']),
});
