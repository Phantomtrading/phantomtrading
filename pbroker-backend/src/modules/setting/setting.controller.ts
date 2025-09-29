import type { Request, Response, NextFunction } from 'express';
import { SettingService } from './setting.service.js';
import { APIResponder } from '../../common/util/apiResponder.util.js';

export class SettingController {
  static async getAllSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingService.getAllSettings();
      APIResponder.ok(res, settings, 'Settings retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getSettingByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const setting = await SettingService.getSettingByKey(key);
      APIResponder.ok(res, setting, 'Setting retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async createSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value, description} = req.body;
      const newSetting = await SettingService.createSetting({ key, value, description});
      APIResponder.created(res, newSetting, 'Setting created successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const dataToUpdate = req.body;
      const updatedSetting = await SettingService.updateSetting(key, dataToUpdate);
      APIResponder.ok(res, updatedSetting, 'Setting updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      await SettingService.deleteSetting(key);
      APIResponder.ok(res, null, 'Setting deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
}
