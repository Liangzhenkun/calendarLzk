<template>
  <div class="diary-container">
    <div class="diary-header">
      <h1>我的日记</h1>
      <el-button type="primary" @click="showNewDiaryDialog = true">写新日记</el-button>
    </div>

    <!-- 日记列表 -->
    <div class="diary-list" v-if="diaries.length">
      <el-timeline>
        <el-timeline-item
          v-for="diary in diaries"
          :key="diary.date"
          :timestamp="formatDate(diary.date)"
          placement="top"
        >
          <el-card>
            <h4>{{ diary.title }}</h4>
            <p>{{ diary.content }}</p>
            <div class="diary-footer">
              <el-tag size="small">心情: {{ getMoodLabel(diary.mood) }}</el-tag>
              <el-tag size="small" type="success">获得经验: +{{ diary.exp || 10 }}</el-tag>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
    <el-empty v-else description="还没有写过日记哦~"></el-empty>

    <!-- 新建日记对话框 -->
    <el-dialog
      v-model="showNewDiaryDialog"
      title="写新日记"
      width="50%"
    >
      <el-form :model="newDiary" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newDiary.title" placeholder="给今天的日记起个标题吧"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="newDiary.content"
            type="textarea"
            :rows="6"
            placeholder="今天发生了什么有趣的事情呢？"
          ></el-input>
        </el-form-item>
        <el-form-item label="心情">
          <el-select v-model="newDiary.mood" placeholder="选择今天的心情">
            <el-option label="开心" value="happy"></el-option>
            <el-option label="平静" value="peaceful"></el-option>
            <el-option label="疲惫" value="tired"></el-option>
            <el-option label="沮丧" value="sad"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewDiaryDialog = false">取消</el-button>
          <el-button type="primary" @click="saveDiary">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useAchievementStore } from '@/stores/achievement'

const achievementStore = useAchievementStore()
const diaries = ref([])
const showNewDiaryDialog = ref(false)
const newDiary = ref({
  title: '',
  content: '',
  mood: '',
  date: new Date().toISOString().split('T')[0]
})

// 获取日记列表
const fetchDiaries = async () => {
  try {
    const response = await axios.get('/api/diary/list')
    diaries.value = response.data
  } catch (error) {
    ElMessage.error('获取日记列表失败')
    console.error('获取日记列表失败:', error)
  }
}

// 保存新日记
const saveDiary = async () => {
  try {
    await axios.post('/api/diary/create', newDiary.value)
    ElMessage.success('日记保存成功')
    showNewDiaryDialog.value = false
    await fetchDiaries()
    
    // 自动检查成就（包含连续天数计算和成就检查）
    console.log('日记保存成功，执行成就检查...');
    await achievementStore.checkAchievementsRealTime('saveDiary');
    
    // 重置表单
    newDiary.value = {
      title: '',
      content: '',
      mood: '',
      date: new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    ElMessage.error('保存日记失败')
    console.error('保存日记失败:', error)
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取心情标签
const getMoodLabel = (mood) => {
  const moodMap = {
    happy: '开心',
    peaceful: '平静',
    tired: '疲惫',
    sad: '沮丧'
  }
  return moodMap[mood] || mood
}

onMounted(() => {
  fetchDiaries()
})
</script>

<style scoped>
.diary-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.diary-list {
  margin-top: 20px;
}

.diary-footer {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.el-timeline-item {
  margin-bottom: 20px;
}

.el-card {
  margin-left: 10px;
}
</style> 