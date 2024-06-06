import type { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import UserRepository from "../repositories/UserRepository";
import type { CreateUserInput, UpdateUserInput } from "../validations/UserValidations";
import { HttpException, HttpStatusCodes } from "../utils/HttpExceptions";
import configuration from "../config/configuration";

const userRepository = new UserRepository();

export default class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = userRepository;
  }
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
    const hashedPassword = await bcrypt.hash(data.password, configuration.bcrypt.salt_rounds);
    return await this.userRepository.create({ ...data, password: hashedPassword });
  }
  async update(id: string, data: UpdateUserInput) {
    await this.getById(id);
    if (data.password)
      data.password = await bcrypt.hash(data.password, configuration.bcrypt.salt_rounds);
    return await this.userRepository.update(id, data);
  }
  async delete(id: string) {
    await this.getById(id);
    await this.userRepository.delete(id);
  }
}
