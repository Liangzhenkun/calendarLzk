<template>
  <div class="calendar-container">
    <el-calendar v-model="currentDate">
      <template #dateCell="{ data }">
        <div class="calendar-cell" @click="handleDateClick(data.day)">
          <p :class="{ 'is-selected': isSelected(data.day) }">
            {{ data.day.split('-').slice(-1)[0] }}
          </p>
          <div v-if="hasRecord(data.day)" class="record-dot"></div>
        </div>
      </template>
    </el-calendar>

    <el-dialog
      v-model="dialogVisible"
      title="添加/编辑记录"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="日期">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="心情" prop="mood">
          <el-rate v-model="form.mood" :max="5" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="记录今天的心情..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as calendarApi from '@/api/calendar'

const currentDate = ref(new Date())
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const records = ref([])

const form = reactive({
  date: '',
  mood: 3,
  content: ''
})

const rules = {
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  mood: [
    { required: true, message: '请选择心情', trigger: 'change' }
  ]
}

const fetchRecords = async () => {
  if (!localStorage.getItem('auth_token')) {
    return;
  }

  try {
    const data = await calendarApi.getCalendarRecords(currentDate.value)
    records.value = data
  } catch (error) {
    if (localStorage.getItem('auth_token')) {
      console.error('获取记录失败:', error)
      ElMessage.error('获取记录失败')
    }
  }
}

const hasRecord = (date) => {
  return records.value.some(record => record.date === date)
}

const isSelected = (date) => {
  return form.date === date
}

const handleDateClick = (date) => {
  form.date = date
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    console.log('提交的表单数据:', form)
    const result = await calendarApi.createCalendarRecord(form)
    console.log('服务器响应:', result)
    
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await fetchRecords()
  } catch (error) {
    console.error('保存失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request
    })
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

watch(() => currentDate.value, () => {
  fetchRecords()
})

onMounted(() => {
  setTimeout(() => {
    fetchRecords()
  }, 1000)
})
</script>

<style scoped>
.calendar-container {
  padding: 20px;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.calendar-cell:hover {
  background-color: #f5f7fa;
}

.record-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #409EFF;
  margin-bottom: 2px;
}

.is-selected {
  color: #409EFF;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 