// This file is created by egg-ts-helper@1.35.2
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportAuth = require('../../../app/service/auth');
import ExportCalendar = require('../../../app/service/calendar');
import ExportDiary = require('../../../app/service/diary');
import ExportIndex = require('../../../app/service/index');
import ExportMetrics = require('../../../app/service/metrics');
import ExportUser = require('../../../app/service/user');

declare module 'egg' {
  interface IService {
    auth: AutoInstanceType<typeof ExportAuth>;
    calendar: AutoInstanceType<typeof ExportCalendar>;
    diary: AutoInstanceType<typeof ExportDiary>;
    index: AutoInstanceType<typeof ExportIndex>;
    metrics: AutoInstanceType<typeof ExportMetrics>;
    user: AutoInstanceType<typeof ExportUser>;
  }
}
