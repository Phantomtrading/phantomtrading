import { SettingRepository } from './setting.repository.js';
import { NotFoundError } from '../../common/error/index.error.js';
import type { createSettingInput, updateSettingInput } from './setting.validation.js';

export class SettingService {
  static async getAllSettings() {
    return SettingRepository.getAll();
  }

  static async getSettingByKey(key: string) {
    const setting = await SettingRepository.findByKey(key);
    if (!setting) throw new NotFoundError(`Setting with key "${key}" not found.`);
    return setting;
  }

  static async createSetting(data: createSettingInput) {
    return SettingRepository.create(data);
  }

  static async updateSetting(key: string, data: updateSettingInput) {
    const setting = await SettingRepository.findByKey(key);
    if (!setting) throw new NotFoundError(`Setting with key "${key}" not found.`);

    let newValue = setting.value as Object;

    // Merge nested JSON if provided
    if (data.value) {
      newValue = { ...newValue, ...data.value };
    }

    return SettingRepository.update(key, {
      value: newValue,
      description: data.description,
    });
  }

  static async deleteSetting(key: string) {
    const setting = await SettingRepository.findByKey(key);
    if (!setting) throw new NotFoundError(`Setting with key "${key}" not found.`);
    return SettingRepository.delete(key);
  }
}
