import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        email: v.string(),
        passwordHash: v.string(),
        name: v.optional(v.string()),
    }).index('by_email', ['email']),

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
