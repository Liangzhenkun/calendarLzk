// This file is created by egg-ts-helper@1.35.2
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAuth = require('../../../app/controller/auth');
import ExportCalendar = require('../../../app/controller/calendar');
import ExportDiary = require('../../../app/controller/diary');

declare module 'egg' {
  interface IController {
    auth: ExportAuth;
    calendar: ExportCalendar;
    diary: ExportDiary;
  }
}
