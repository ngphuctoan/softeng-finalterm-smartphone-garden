import { Profile, User } from "@interfaces";
import { UserModel } from "@models";

function userToProfile(user: User): Profile {
    return {
        name: user.name,
        email: user.email
    };
}

export async function getById(id: number): Promise<Profile> {
    const user = await UserModel.getById(id);
    return userToProfile(user);
}