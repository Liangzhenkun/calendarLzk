// This file is created by egg-ts-helper@1.35.2
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAuth = require('../../../app/middleware/auth');

declare module 'egg' {
  interface IMiddleware {
    auth: typeof ExportAuth;
  }
}
