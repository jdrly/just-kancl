import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getByLocale = query({
    args: { locale: v.string() },
    returns: v.union(
        v.object({
            _id: v.id('translations'),
            _creationTime: v.number(),
            locale: v.string(),
            translations: v.record(v.string(), v.string()),
        }),
        v.null()
    ),
    handler: async (ctx, args) => {
        return await ctx.db
            .query('translations')
            .withIndex('by_locale', (q) => q.eq('locale', args.locale))
            .unique();
    },
});

export const getAvailableLocales = query({
    args: {},
    returns: v.array(v.string()),
    handler: async (ctx) => {
        const all = await ctx.db.query('translations').collect();
        return all.map((t) => t.locale);
    },
});

export const upsertTranslation = mutation({
    args: {
        locale: v.string(),
        key: v.string(),
        value: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('translations')
            .withIndex('by_locale', (q) => q.eq('locale', args.locale))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                translations: {
                    ...existing.translations,
                    [args.key]: args.value,
                },
            });
        } else {
            await ctx.db.insert('translations', {
                locale: args.locale,
                translations: { [args.key]: args.value },
            });
        }
        return null;
    },
});

export const seedTranslations = mutation({
    args: {},
    returns: v.string(),
    handler: async (ctx) => {
        const enTranslations: Record<string, string> = {
            // Common
            'common.loading': 'Loading...',
            'common.save': 'Save',
            'common.cancel': 'Cancel',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.create': 'Create',
            'common.search': 'Search',
            'common.noResults': 'No results found',
            'common.error': 'An error occurred',
            'common.success': 'Success',

            // Auth
            'auth.login': 'Sign In',
            'auth.logout': 'Sign Out',
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.loginTitle': 'Sign in to your account',
            'auth.loginSubtitle': 'Enter your email below to login to your account',
            'auth.loginButton': 'Login',
            'auth.loggingIn': 'Logging in...',
            'auth.invalidCredentials': 'Invalid email or password',
            'auth.welcomeBack': 'Welcome back',

            // Navigation
            'nav.dashboard': 'Dashboard',
            'nav.settings': 'Settings',
            'nav.profile': 'Profile',
            'nav.home': 'Home',

            // Dashboard
            'dashboard.title': 'Dashboard',
            'dashboard.welcome': 'Welcome to your dashboard',
        };

        const csTranslations: Record<string, string> = {
            // Common
            'common.loading': 'Načítání...',
            'common.save': 'Uložit',
            'common.cancel': 'Zrušit',
            'common.delete': 'Smazat',
            'common.edit': 'Upravit',
            'common.create': 'Vytvořit',
            'common.search': 'Hledat',
            'common.noResults': 'Žádné výsledky',
            'common.error': 'Došlo k chybě',
            'common.success': 'Úspěch',

            // Auth
            'auth.login': 'Přihlásit se',
            'auth.logout': 'Odhlásit se',
            'auth.email': 'E-mail',
            'auth.password': 'Heslo',
            'auth.loginTitle': 'Přihlaste se do svého účtu',
            'auth.loginSubtitle': 'Zadejte svůj e-mail pro přihlášení',
            'auth.loginButton': 'Přihlásit',
            'auth.loggingIn': 'Přihlašování...',
            'auth.invalidCredentials': 'Nesprávný e-mail nebo heslo',
            'auth.welcomeBack': 'Vítejte zpět',

            // Navigation
            'nav.dashboard': 'Nástěnka',
            'nav.settings': 'Nastavení',
            'nav.profile': 'Profil',
            'nav.home': 'Domů',

            // Dashboard
            'dashboard.title': 'Nástěnka',
            'dashboard.welcome': 'Vítejte na vaší nástěnce',
        };

        // Upsert English translations
        const existingEn = await ctx.db
            .query('translations')
            .withIndex('by_locale', (q) => q.eq('locale', 'en'))
            .unique();

        if (existingEn) {
            await ctx.db.patch(existingEn._id, { translations: enTranslations });
        } else {
            await ctx.db.insert('translations', {
                locale: 'en',
                translations: enTranslations,
            });
        }

        // Upsert Czech translations
        const existingCs = await ctx.db
            .query('translations')
            .withIndex('by_locale', (q) => q.eq('locale', 'cs'))
            .unique();

        if (existingCs) {
            await ctx.db.patch(existingCs._id, { translations: csTranslations });
        } else {
            await ctx.db.insert('translations', {
                locale: 'cs',
                translations: csTranslations,
            });
        }

        return 'Seeded English and Czech translations';
    },
});

