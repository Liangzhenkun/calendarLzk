#!/bin/bash

# 设置错误时退出
set -e

echo "开始部署..."

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 root 权限运行此脚本"
    exit 1
fi

# 设置变量
APP_NAME="calendar"
BACKEND_DIR="/www/wwwroot/calendar/backend"
FRONTEND_DIR="/www/wwwroot/calendar/frontend"
NGINX_CONF_DIR="/etc/nginx/conf.d"
NGINX_CONF_FILE="calendar.conf"

# 创建必要的目录
echo "创建目录..."
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR

# 部署后端
echo "部署后端..."
cd $BACKEND_DIR
git pull
npm install --production
pm2 restart $APP_NAME || pm2 start npm --name $APP_NAME -- start

# 部署前端
echo "部署前端..."
cd $FRONTEND_DIR
git pull
npm install
npm run build

# 部署 Nginx 配置
echo "部署 Nginx 配置..."
cp nginx/conf.d/default.conf $NGINX_CONF_DIR/$NGINX_CONF_FILE

# 检查 Nginx 配置
echo "检查 Nginx 配置..."
nginx -t

# 重新加载 Nginx
echo "重新加载 Nginx..."
systemctl reload nginx

echo "部署完成！" 