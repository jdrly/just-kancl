import bcrypt from 'bcryptjs';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const BCRYPT_ROUNDS = 10;

// User role type for return validators
const userRoleValidator = v.union(
    v.literal('personal'),
    v.literal('owner'),
    v.literal('admin'),
    v.literal('manager'),
    v.literal('employee'),
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

export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    returns: v.union(
        v.object({
            success: v.literal(true),
            sessionId: v.id('sessions'),
            user: userResponseValidator,
        }),
        v.object({
            success: v.literal(false),
            error: v.string(),
        }),
    ),
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', args.email))
            .unique();

        if (!user) {
            return { success: false as const, error: 'Invalid email or password' };
        }

        if (user.isActive === false) {
            return { success: false as const, error: 'Account is deactivated' };
        }

        const isValidPassword = bcrypt.compareSync(args.password, user.passwordHash);
        if (!isValidPassword) {
            return { success: false as const, error: 'Invalid email or password' };
        }

        // Update last login time
        const lastLoginAt = Date.now();
        await ctx.db.patch(user._id, { lastLoginAt });

        // Create session (expires in 7 days)
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const sessionId = await ctx.db.insert('sessions', {
            userId: user._id,
            expiresAt,
        });

        return {
            success: true as const,
            sessionId,
            user: {
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
                lastLoginAt,
                createdAt: user.createdAt,
            },
        };
    },
});

export const logout = mutation({
    args: {
        sessionId: v.id('sessions'),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.delete(args.sessionId);
        return null;
    },
});

export const getSession = query({
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

// Seed function to create or update test user with bcrypt hash
export const seedTestUser = mutation({
    args: {},
    returns: v.string(),
    handler: async (ctx) => {
        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_email', (q) => q.eq('email', 'jd@jandrly.cz'))
            .unique();

        const passwordHash = bcrypt.hashSync('admin', BCRYPT_ROUNDS);
        const now = Date.now();

        if (existingUser) {
            // Update existing user with new schema fields
            await ctx.db.patch(existingUser._id, {
                passwordHash,
                emailVerified: true,
                firstName: 'Jan',
                lastName: 'Drndly',
                role: 'personal',
                isActive: true,
                createdAt: existingUser.createdAt ?? now,
            });
            return 'Test user updated: jd@jandrly.cz / admin';
        }

        await ctx.db.insert('users', {
            email: 'jd@jandrly.cz',
            passwordHash,
            emailVerified: true,
            firstName: 'Jan',
            lastName: 'Drndly',
            role: 'personal',
            isActive: true,
            createdAt: now,
        });

        return 'Test user created: jd@jandrly.cz / admin';
    },
});
