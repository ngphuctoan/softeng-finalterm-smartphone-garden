type RolePermissions = {
    [role: string]: string[];
}

const roles: RolePermissions = {
    administrator: [
        "product:read",
        "product:add",
        "item:read",
        "item:add",
        "user:read",
        "user:update-role",
        "profile:read",
        "profile:update",
        "profile:change-password"
    ],
    manager: [
        "product:read",
        "product:add",
        "item:read",
        "item:add",
        "profile:read",
        "profile:update",
        "profile:change-password"
    ],
    customer: [
        "product:read",
        "item:read",
        "profile:read",
        "profile:update",
        "profile:change-password"
    ]
} ;

export default roles;