<template>
  <div class="diary-container">
    <el-row :gutter="20">
      <!-- 日记列表 -->
      <el-col :span="8">
        <div class="diary-list card-shadow">
          <div class="list-header">
            <h3>我的日记</h3>
            <el-button type="primary" @click="handleNewDiary">写日记</el-button>
          </div>
          
          <el-scrollbar height="calc(100vh - 180px)">
            <el-empty v-if="diaryList.length === 0" description="暂无日记" />
            <div v-else class="diary-list-content">
              <div
                v-for="diary in diaryList"
                :key="diary.id"
                class="diary-item"
                :class="{ 'is-active': selectedDiary?.id === diary.id }"
                @click="handleSelectDiary(diary)"
              >
                <div class="diary-item-header">
                  <span class="diary-date">{{ diary.date }}</span>
                  <el-rate
                    v-model="diary.mood"
                    :max="5"
                    disabled
                    size="small"
                  />
                </div>
                <h4 class="diary-title">{{ diary.title }}</h4>
                <p class="diary-preview">{{ diary.content }}</p>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-col>
      
      <!-- 日记编辑 -->
      <el-col :span="16">
        <div class="diary-editor card-shadow">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
          >
            <div class="editor-header">
              <el-form-item class="date-picker" label="日期">
                <el-date-picker
                  v-model="form.date"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              
              <el-form-item class="mood-rate" label="心情">
                <el-rate v-model="form.mood" :max="5" />
              </el-form-item>
            </div>
            
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="给今天的日记起个标题吧"
              />
            </el-form-item>
            
            <el-form-item label="内容" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="12"
                placeholder="记录下今天的故事..."
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="loading"
              >
                保存
              </el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button
                v-if="selectedDiary"
                type="danger"
                @click="handleDelete"
                :loading="deleteLoading"
              >
                删除
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as diaryApi from '@/api/diary'

const formRef = ref(null)
const loading = ref(false)
const deleteLoading = ref(false)
const diaryList = ref([])
const selectedDiary = ref(null)

const form = reactive({
  date: new Date().toISOString().split('T')[0],
  title: '',
  mood: 3,
  content: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
}

const fetchDiaryList = async () => {
  try {
    const data = await diaryApi.getDiaryList()
    diaryList.value = data
  } catch (error) {
    console.error('获取日记列表失败:', error)
  }
}

const handleNewDiary = () => {
  selectedDiary.value = null
  form.date = new Date().toISOString().split('T')[0]
  form.title = ''
  form.mood = 3
  form.content = ''
}

const handleSelectDiary = (diary) => {
  selectedDiary.value = diary
  Object.assign(form, diary)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    console.log('提交的日记数据:', form)
    
    if (selectedDiary.value) {
      await diaryApi.updateDiary(selectedDiary.value.id, form)
      ElMessage.success('更新成功')
    } else {
      const result = await diaryApi.createDiary(form)
      console.log('服务器响应:', result)
      ElMessage.success('保存成功')
    }
    
    await fetchDiaryList()
  } catch (error) {
    console.error('保存日记失败:', error)
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

const handleReset = () => {
  if (selectedDiary.value) {
    Object.assign(form, selectedDiary.value)
  } else {
    formRef.value?.resetFields()
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇日记吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    deleteLoading.value = true
    await diaryApi.deleteDiary(selectedDiary.value.id)
    ElMessage.success('删除成功')
    
    handleNewDiary()
    await fetchDiaryList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  fetchDiaryList()
})
</script>

<style scoped>
.diary-container {
  padding: 20px;
}

.diary-list,
.diary-editor {
  padding: 20px;
  height: calc(100vh - 100px);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.diary-list-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-item {
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.diary-item:hover {
  background-color: #ecf5ff;
}

.diary-item.is-active {
  background-color: #ecf5ff;
  border-left: 4px solid var(--el-color-primary);
}

.diary-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.diary-date {
  color: #909399;
  font-size: 0.9em;
}

.diary-title {
  margin-bottom: 8px;
  color: #303133;
}

.diary-preview {
  color: #606266;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.editor-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.date-picker {
  flex: 1;
}

.mood-rate {
  min-width: 200px;
}
</style> 