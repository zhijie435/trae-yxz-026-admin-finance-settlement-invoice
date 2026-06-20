<template>
  <div class="withdrawal-manage">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon"><el-icon><Wallet /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">全部提现</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card amount">
          <div class="stat-icon"><el-icon><Coin /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">¥{{ (stats.paidAmount || 0).toLocaleString() }}</div>
            <div class="stat-label">累计提现总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending">
          <div class="stat-icon"><el-icon><Clock /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待审核 / ¥{{ (stats.pendingAmount || 0).toLocaleString() }}</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card success">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.paid }}</div>
            <div class="stat-label">已打款 / ¥{{ (stats.paidAmount || 0).toLocaleString() }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" type="card" class="main-tabs">
      <el-tab-pane label="提现记录" name="records">
        <template #label>
          <span class="tab-label">
            <el-icon><Tickets /></el-icon>
            提现记录
          </span>
        </template>
        <WithdrawalRecordTab
          :stats="stats"
          @refresh="loadStats"
        />
      </el-tab-pane>
      <el-tab-pane label="自动提现配置" name="config">
        <template #label>
          <span class="tab-label">
            <el-icon><Setting /></el-icon>
            自动提现配置
          </span>
        </template>
        <WithdrawalConfigTab @updated="loadStats" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Wallet, Coin, Clock, CircleCheck, Tickets, Setting } from '@element-plus/icons-vue';
import { getWithdrawalStatistics } from '../api/withdrawal.js';
import WithdrawalRecordTab from './WithdrawalRecordTab.vue';
import WithdrawalConfigTab from './WithdrawalConfigTab.vue';

const activeTab = ref('records');
const stats = ref({
  total: 0, pending: 0, approved: 0, paid: 0, rejected: 0, failed: 0, cancelled: 0,
  totalAmount: 0, paidAmount: 0, pendingAmount: 0, feeTotal: 0
});

const loadStats = async () => {
  try {
    stats.value = await getWithdrawalStatistics();
  } catch (e) {
    console.error('加载提现统计失败', e);
  }
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.withdrawal-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  margin-bottom: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  flex-shrink: 0;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.pending .stat-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-card.success .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-card.amount .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

.stat-info { flex: 1; min-width: 0; }
.stat-value { font-size: 26px; font-weight: 700; color: #303133; line-height: 1.2; }
.stat-value.small { font-size: 16px; }
.stat-label { font-size: 12px; color: #909399; margin-top: 4px; }

.main-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.main-tabs :deep(.el-tabs__item) {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  font-weight: 500;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.main-tabs :deep(.el-tabs__content) {
  padding: 16px 0 0 0;
}
</style>
