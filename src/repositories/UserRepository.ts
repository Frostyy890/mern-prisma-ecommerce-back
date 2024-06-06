import { db } from "../config/db";
import type { Prisma } from "@prisma/client";

export default class UserRepository {
  private readonly db;
  constructor() {
    this.db = db;
  }
  async getAll() {
    return await this.db.user.findMany();
  }
  async getById(id: string) {
    return await this.db.user.findUnique({ where: { id } });
  }
  async getByKey(
    key: keyof Prisma.UserWhereInput,
    value: Prisma.UserWhereInput[keyof Prisma.UserWhereInput]
  ) {
    return await this.db.user.findFirst({ where: { [key]: value } });
  }

  async create(data: Prisma.UserCreateInput) {
    return await this.db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await this.db.user.update({ where: { id }, data });
  }
  async delete(id: string) {
    return await this.db.user.delete({ where: { id } });
  }
}
