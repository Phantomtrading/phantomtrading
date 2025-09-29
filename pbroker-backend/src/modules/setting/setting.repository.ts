import prisma from "../../common/config/db.js";
import type { Setting } from "../../generated/prisma/index.js";

export class SettingRepository {
  static async getAll(): Promise<Setting[]> {
    return prisma.setting.findMany();
  }
  static async findByKey(key: string): Promise<Setting | null> {
    return prisma.setting.findUnique({ where: { key } });
  }
  static async create(data: {
    key: string;
    value: Record<string, any>;
    description: string;
  }): Promise<Setting> {
    return prisma.setting.create({ data });
  }
  static async update(
    key: string,
    data: Partial<{ value: Record<string, any>; description?: string;}>
  ): Promise<Setting> {
    return prisma.setting.update({
      where: { key },
      data,
    });
  }
  static async delete(key: string): Promise<Setting> {
    return prisma.setting.delete({ where: { key } });
  }
}
