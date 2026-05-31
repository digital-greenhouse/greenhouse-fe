export function parseStoredUser() {
    try {
        const rawUser = localStorage.getItem('user');
        return rawUser ? JSON.parse(rawUser) : null;
    } catch {
        return null;
    }
}

export function getStoredUserId(user) {
    return user?.id ?? user?.user_id ?? user?.userId ?? user?.owner_id ?? user?.ownerId ?? null;
}

export function getUserName(user, fallback = 'Usuario') {
    return user?.name || user?.fullName || fallback;
}

export function getDisplayUserName(userName, maxLength = 15) {
    if (typeof userName !== 'string' || userName.length === 0) {
        return 'Usuario';
    }

    return userName.length > maxLength ? `${userName.slice(0, maxLength)}...` : userName;
}

export function extractRoleNames(roles) {
    if (Array.isArray(roles)) {
        return roles
            .map((role) => (typeof role === 'string' ? role : role?.name))
            .filter(Boolean);
    }

    if (typeof roles === 'string' && roles) {
        return [roles];
    }

    return [];
}

export function hasSuperAdminRole(roles) {
    return extractRoleNames(roles).includes('SUPERADMIN');
}