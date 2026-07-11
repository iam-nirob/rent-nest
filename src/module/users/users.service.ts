import { CreateUserPayload } from "./users.interface";

const createUserDB = async (payload: CreateUserPayload) => {};
const getUserDB = async () => {};
const getUsersIdDB = async () => {};
const updateUserDB = async () => {};
const deleteUserDB = async () => {};

export const usersService = {
  createUserDB,
  getUserDB,
  getUsersIdDB,
  updateUserDB,
  deleteUserDB,
};
