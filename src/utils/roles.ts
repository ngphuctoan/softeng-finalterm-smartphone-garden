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
        "me:read",
        "me:update",
        "me:change-password"
    ],
    manager: [
        "product:read",
        "product:add",
        "item:read",
        "item:add",
        "me:read",
        "me:update",
        "me:change-password"
    ],
    customer: [
        "product:read",
        "item:read",
        "me:read",
        "me:update",
        "me:change-password"
    ]
} ;

export default roles;