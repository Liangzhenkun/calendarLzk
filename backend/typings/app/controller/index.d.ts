// This file is created by egg-ts-helper@1.35.2
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAchievement = require('../../../app/controller/achievement');
import ExportAuth = require('../../../app/controller/auth');
import ExportCalendar = require('../../../app/controller/calendar');
import ExportDailyTask = require('../../../app/controller/dailyTask');
import ExportDebug = require('../../../app/controller/debug');
import ExportDiary = require('../../../app/controller/diary');
import ExportMetrics = require('../../../app/controller/metrics');
import ExportShop = require('../../../app/controller/shop');

declare module 'egg' {
  interface IController {
    achievement: ExportAchievement;
    auth: ExportAuth;
    calendar: ExportCalendar;
    dailyTask: ExportDailyTask;
    debug: ExportDebug;
    diary: ExportDiary;
    metrics: ExportMetrics;
    shop: ExportShop;
  }
}
