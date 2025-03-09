'use strict';

const Controller = require('egg').Controller;

class TestController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = { 
      status: 200,
      message: 'API test successful',
      timestamp: new Date()
    };
  }
}

module.exports = TestController;
