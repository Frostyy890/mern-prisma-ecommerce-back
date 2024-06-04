import { type Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import type UserRepository from "../repositories/UserRepository";
import type { CreateUserInput, UpdateUserInput } from "../validations/UserValidations";
import { HttpException, HttpStatusCodes } from "../utils/HttpExceptions";
import configuration from "../config/configuration";

export default class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async getAll() {
    return await this.userRepository.getAll();
  }
  async getById(id: string) {
    const user = await this.userRepository.getById(id);
    if (!user) throw new HttpException(HttpStatusCodes.NOT_FOUND, "User not found");
    return user;
  }
  async getByKey(key: keyof Prisma.UserWhereInput, value: Prisma.UserWhereInput[typeof key]) {
    return await this.userRepository.getByKey(key, value);
  }
  async create(data: CreateUserInput) {
    await this.ensureUniqueInput({ email: data.email, phone: data.phone });
    const hashedPassword = await bcrypt.hash(data.password, configuration.bcrypt.salt_rounds);
    const newUser = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return newUser;
  }
  async update(id: string, data: UpdateUserInput) {
    await this.getById(id);
    if (data.email) await this.ensureUniqueInput({ email: data.email }, id);
    if (data.phone) await this.ensureUniqueInput({ phone: data.phone }, id);
    if (data.password)
      data.password = await bcrypt.hash(data.password, configuration.bcrypt.salt_rounds);
    return await this.userRepository.update(id, data);
  }
  async delete(id: string) {
    await this.getById(id);
    await this.userRepository.delete(id);
  }

  async ensureUniqueInput(input: Prisma.UserWhereInput, id?: string) {
    const keys = Object.keys(input) as (keyof Prisma.UserWhereInput)[];
    for (const key of keys) {
      const value = input[key];
      const user = await this.userRepository.getByKey(key, value);
      if (user)
        if (!id || user.id !== id)
          throw new HttpException(
            HttpStatusCodes.CONFLICT,
            `User with ${key} ${value} already exists!`
          );
    }
  }
}
