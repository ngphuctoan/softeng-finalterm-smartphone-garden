type RolePermissions = {
    [role: string]: string[];
}

const roles: RolePermissions = {
    administrator: [
        "user:read",
        "user:update-role",
        "me:read",
        "me:update",
        "me:change-password"
    ],
    manager: [
        "me:read",
        "me:update",
        "me:change-password"
    ],
    customer: [
        "me:read",
        "me:update",
        "me:change-password"
    ]
} ;

export default roles;