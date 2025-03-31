import { ElNotification } from 'element-plus'

export const showAchievementNotification = (achievement) => {
  ElNotification({
    title: '🎉 解锁新成就',
    message: `恭喜获得"${achievement.name}"成就！`,
    type: 'success',
    duration: 5000,
    customClass: 'achievement-notification',
    offset: 80,
    position: 'top-right'
  })
}

// 添加自定义样式
const style = document.createElement('style')
style.textContent = `
  .achievement-notification {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px) !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
  }

  .achievement-notification .el-notification__title {
    font-size: 18px !important;
    font-weight: 500 !important;
    color: #303133 !important;
  }

  .achievement-notification .el-notification__content {
    font-size: 14px !important;
    color: #606266 !important;
    margin-top: 8px !important;
  }

  .achievement-notification .el-notification__icon {
    font-size: 24px !important;
  }

  .achievement-notification .el-notification__closeBtn {
    color: #909399 !important;
    font-size: 16px !important;
  }

  .achievement-notification .el-notification__closeBtn:hover {
    color: #409EFF !important;
  }
`
document.head.appendChild(style) 