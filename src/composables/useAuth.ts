import { useConvexMutation, useConvexQuery } from 'convex-vue';
import { computed, watch } from 'vue';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
    const authStore = useAuthStore();

    const { data: user, isPending: isLoading } = useConvexQuery(api.users.currentUser, () => ({
        sessionId: authStore.sessionId,
    }));

    const isAuthenticated = computed(() => !!user.value);

    const loginMutation = useConvexMutation(api.auth.login);
    const logoutMutation = useConvexMutation(api.auth.logout);

    async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        authStore.startLogin();

        try {
            const result = await loginMutation.mutate({ email, password });

            if (result.success) {
                authStore.setSessionId(result.sessionId);

                // Wait for the user query to update with the new session
                await new Promise<void>((resolve) => {
                    const unwatch = watch(
                        user,
                        (newUser) => {
                            if (newUser) {
                                unwatch();
                                resolve();
                            }
                        },
                        { immediate: true },
                    );

                    // Timeout after 5 seconds to prevent hanging
                    setTimeout(() => {
                        unwatch();
                        resolve();
                    }, 5000);
                });

                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } finally {
            authStore.endLogin();
        }
    }

    async function signOut() {
        if (authStore.sessionId) {
            await logoutMutation.mutate({ sessionId: authStore.sessionId });
        }
        authStore.setSessionId(null);
    }

    // Watch for user becoming null (session expired) and clear stored session
    // But don't clear if we're actively logging in
    watch(user, (newUser) => {
        if (!newUser && authStore.sessionId && !authStore.isLoggingIn) {
            authStore.clearSession();
        }
    });

    return {
        user,
        isLoading,
        isAuthenticated,
        login,
        signOut,
    };
}
