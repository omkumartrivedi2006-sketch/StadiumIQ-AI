import { userRepository } from "../repositories/userRepository";

export const userService = {
  async getAllUsers(filter: any, options: any) {
    return userRepository.find({ ...filter, isDeleted: { $ne: true } }, options);
  },

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (user && user.isDeleted) return null;
    return user;
  },

  async updateUser(id: string, data: any) {
    return userRepository.update(id, data);
  },

  async deleteUser(id: string) {
    return userRepository.update(id, { isDeleted: true });
  },
};
