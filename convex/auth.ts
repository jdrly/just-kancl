import bcrypt from 'bcryptjs';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const BCRYPT_ROUNDS = 10;

export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    returns: v.union(
        v.object({
            success: v.literal(true),
            sessionId: v.id('sessions'),
            user: v.object({
                _id: v.id('users'),
                email: v.string(),
                name: v.optional(v.string()),
            }),
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

        const isValidPassword = bcrypt.compareSync(args.password, user.passwordHash);
        if (!isValidPassword) {
            return { success: false as const, error: 'Invalid email or password' };
        }

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
                name: user.name,
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
    returns: v.union(
        v.object({
            _id: v.id('users'),
            email: v.string(),
            name: v.optional(v.string()),
        }),
        v.null(),
    ),
    handler: async (ctx, args) => {
        if (!args.sessionId) {
            return null;
        }

        const session = await ctx.db.get(args.sessionId);
        if (!session || session.expiresAt < Date.now()) {
            return null;
        }

        const user = await ctx.db.get(session.userId);
        if (!user) {
            return null;
        }

        return {
            _id: user._id,
            email: user.email,
            name: user.name,
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

        if (existingUser) {
            // Update existing user with new bcrypt hash
            await ctx.db.patch(existingUser._id, { passwordHash });
            return 'Test user updated with bcrypt hash: jd@jandrly.cz / admin';
        }

        await ctx.db.insert('users', {
            email: 'jd@jandrly.cz',
            passwordHash,
            name: 'JD',
        });

        return 'Test user created with bcrypt hash: jd@jandrly.cz / admin';
    },
});
