import { v } from 'convex/values';
import { query } from './_generated/server';

export const currentUser = query({
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
