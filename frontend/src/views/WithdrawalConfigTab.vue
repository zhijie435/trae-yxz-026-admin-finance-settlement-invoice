<template>
  <div class="withdrawal-config-tab">
    <el-card class="config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Setting /></el-icon>
            自动提现配置
          </span>
          <el-switch
            v-model="config.enabled"
            active-text="开启自动提现"
            inactive-text="关闭自动提现"
            @change="handleToggleEnabled"
          />
        </div>
      </template>

      <el-form :model="config" :disabled="!config.enabled" label-width="140px" class="config-form">
        <div class="section-title">
          <el-icon><Money /></el-icon>
          金额限制
        </div>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="单笔最低金额(元)">
              <el-input-number
                v-model="config.minAmount"
                :min="0"
                :step="10"
                style="width: 100%"
                :disabled="!canEdit"
              />
              <div class="form-tip">低于此金额的提现需人工审核</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单笔最高金额(元)">
              <el-input-number
                v-model="config.maxAmount"
                :min="0"
                :step="1000"
                style="width: 100%"
                :disabled="!canEdit"
              />
              <div class="form-tip">超过此金额的提现需人工审核</div>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">
          <el-icon><Calendar /></el-icon>
          额度限制
        </div>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="单日限额(元)">
              <el-input-number
                v-model="config.dailyLimit"
                :min="0"
                :step="1000"
                style="width: 100%"
                :disabled="!canEdit"
              />
              <div class="form-tip">单门店每日自动提现累计上限</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单月限额(元)">
              <el-input-number
                v-model="config.monthlyLimit"
                :min="0"
                :step="10000"
                style="width: 100%"
                :disabled="!canEdit"
              />
              <div class="form-tip">单门店每月自动提现累计上限</div>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-actions">
          <el-button type="primary" :disabled="!canEdit" :loading="saving" @click="handleSave">
            <el-icon><Check /></el-icon>保存配置
          </el-button>
          <el-button :disabled="!canEdit" @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><InfoFilled /></el-icon>
            自动提现说明
          </span>
        </div>
      </template>
      <div class="info-content">
        <el-steps :active="3" finish-status="success" simple>
          <el-step title="门店发起提现" description="门店在管理后台提交提现申请" />
          <el-step title="系统自动审核" description="符合自动提现条件的申请自动通过" />
          <el-step title="自动打款" description="系统自动执行转账到银行卡" />
          <el-step title="到账完成" description="款项1-3个工作日内到账" />
        </el-steps>

        <el-alert
          title="自动提现规则"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 20px"
        >
          <template #default>
            <ul class="rule-list">
              <li>普通提现且金额在设定范围内的，自动审核通过并打款</li>
              <li>加急提现需人工审核，不参与自动提现</li>
              <li>超出单日或单月限额的提现申请，转为人工审核</li>
              <li>自动提现失败的申请，自动转为人工处理状态</li>
              <li>门店处于禁用状态时，所有提现申请均需人工审核</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Setting, Money, Calendar, Check, Refresh, InfoFilled
} from '@element-plus/icons-vue';
import {
  getAutoWithdrawalConfig,
  updateAutoWithdrawalConfig
} from '../api/withdrawal.js';

const emit = defineEmits(['updated']);

const saving = ref(false);
const canEdit = ref(true);
const originalConfig = reactive({
  enabled: true,
  maxAmount: 50000,
  minAmount: 100,
  dailyLimit: 100000,
  monthlyLimit: 500000
});

const config = reactive({ ...originalConfig });

const loadConfig = async () => {
  try {
    const result = await getAutoWithdrawalConfig();
    Object.assign(originalConfig, result);
    Object.assign(config, result);
  } catch (e) {
    console.error('加载自动提现配置失败', e);
  }
};

const handleToggleEnabled = async (val) => {
  try {
    await ElMessageBox.confirm(
      val ? '确认开启自动提现功能？' : '确认关闭自动提现功能？关闭后所有提现申请需人工审核。',
      val ? '开启自动提现' : '关闭自动提现',
      { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' }
    );
  } catch (e) {
    config.enabled = !val;
    return;
  }
  
  saving.value = true;
  try {
    await updateAutoWithdrawalConfig({ enabled: val });
    ElMessage.success(val ? '自动提现已开启' : '自动提现已关闭');
    emit('updated');
  } catch (e) {
    config.enabled = !val;
    ElMessage.error(e.message || '操作失败');
  } finally {
    saving.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    await updateAutoWithdrawalConfig({ ...config });
    Object.assign(originalConfig, config);
    ElMessage.success('配置保存成功');
    emit('updated');
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
  } finally {
    saving.value = false;
  }
};

const handleReset = () => {
  Object.assign(config, originalConfig);
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.withdrawal-config-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-card, .info-card {
  border-radius: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon { color: #3b82f6; }

.config-form {
  padding: 12px 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
}

.section-title:first-of-type {
  margin-top: 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.info-content {
  padding: 8px 0;
}

.rule-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  font-size: 13px;
  color: #606266;
}

.rule-list li {
  list-style-type: disc;
}
</style>
