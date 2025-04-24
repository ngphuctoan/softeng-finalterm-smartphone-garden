import prisma from "@utils/db";
import { User } from "@interfaces";
import { userSelect } from "@utils/selects";

interface RoleFromDB {
  role: { name: string }
}

export function userToJson(user: Omit<User, "roleName"> & RoleFromDB) {
  return {
    ...user,
    role: undefined,
    roleName: user.role.name
  };
}

export async function getAll(): Promise<User[]> {
  const users = await prisma.user.findMany({
    select: userSelect
  });

  return users.map(userToJson);
}

export async function getById(id: number): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect
  });

  if (!user) {
    throw new Error("No user found.");
  }

  return userToJson(user);
}

export async function getByEmail(email: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: userSelect
  });

  if (!user) {
    throw new Error("No user found.");
  }

  return userToJson(user);
}

export async function getPasswordHash(id: number): Promise<string> {
  const result = await prisma.user.findUnique({
    where: { id },
    select: { password: true }
  });

  if (!result) {
    throw new Error("No user found.");
  }

  return result.password;
}

export async function add(
  { name, email, password, roleName }: Omit<User, "id"> & { password: string }
): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: {
        connectOrCreate: {
          where: { name: roleName },
          create: { name: roleName }
        }
      }
    },
    select: userSelect
  });

  return userToJson(user);
}

export async function update(
  params: Partial<Omit<User, "id">> & { id: number; password?: string; roleName?: string }
): Promise<User> {
  const { id, name, email, password, roleName } = params;
  // Chỉ include các field thực sự cần update
  const data: any = {};

  if (name !== undefined) {
    data.name = name;
  }
  if (email !== undefined) {
    data.email = email;
  }
  if (password !== undefined) {
    data.password = password;
  }
  if (roleName) {
    data.role = {
      connectOrCreate: {
        where: { name: roleName },
        create: { name: roleName }
      }
    };
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: userSelect
  });

  return userToJson(user);
}

export async function remove(id: number): Promise<User> {
  const user = await prisma.user.delete({
    where: { id },
    select: userSelect
  });

  return userToJson(user);
}
