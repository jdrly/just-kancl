import { v } from 'convex/values';
import { query } from './_generated/server';

// User role type for return validators
const userRoleValidator = v.union(
    v.literal('personal'),
    v.literal('owner'),
    v.literal('admin'),
    v.literal('manager'),
    v.literal('employee')
);

// User object validator for API responses (temporarily optional for migration)
const userResponseValidator = v.object({
    _id: v.id('users'),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    locale: v.optional(v.string()),
    organizationId: v.optional(v.id('organizations')),
    role: v.optional(userRoleValidator),
    isActive: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
});

export const currentUser = query({
    args: {
        sessionId: v.union(v.id('sessions'), v.null()),
    },
    returns: v.union(userResponseValidator, v.null()),
    handler: async (ctx, args) => {
        if (!args.sessionId) {
            return null;
        }

        const session = await ctx.db.get(args.sessionId);
        if (!session || session.expiresAt < Date.now()) {
            return null;
        }

        const user = await ctx.db.get(session.userId);
        if (!user || user.isActive === false) {
            return null;
        }

        return {
            _id: user._id,
            email: user.email,
            emailVerified: user.emailVerified,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            locale: user.locale,
            organizationId: user.organizationId,
            role: user.role,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
        };
    },
});
