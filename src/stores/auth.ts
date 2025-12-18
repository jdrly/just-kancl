import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Id } from '../../convex/_generated/dataModel';

const SESSION_KEY = 'convex_session_id';

export const useAuthStore = defineStore('auth', () => {
    const sessionId = ref<Id<'sessions'> | null>(getStoredSessionId());
    const isLoggingIn = ref(false);

    function getStoredSessionId(): Id<'sessions'> | null {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored as Id<'sessions'> | null;
    }

    function setSessionId(id: Id<'sessions'> | null) {
        sessionId.value = id;
        if (id) {
            localStorage.setItem(SESSION_KEY, id);
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }

    function startLogin() {
        isLoggingIn.value = true;
    }

    function endLogin() {
        isLoggingIn.value = false;
    }

    function clearSession() {
        if (!isLoggingIn.value) {
            sessionId.value = null;
            localStorage.removeItem(SESSION_KEY);
        }
    }

    return {
        sessionId: computed(() => sessionId.value),
        isLoggingIn: computed(() => isLoggingIn.value),
        setSessionId,
        startLogin,
        endLogin,
        clearSession,
    };
});

