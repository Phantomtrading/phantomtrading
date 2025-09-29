import { Router } from 'express';
import { SettingController } from './setting.controller.js';

const settingRouter = Router();

settingRouter.get('/', SettingController.getAllSettings);
settingRouter.get('/:key', SettingController.getSettingByKey);
settingRouter.post('/', SettingController.createSetting);
settingRouter.patch('/:key', SettingController.updateSetting);
settingRouter.delete('/:key', SettingController.deleteSetting);

export default settingRouter;
