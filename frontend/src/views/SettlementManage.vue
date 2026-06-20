<template>
  <div class="settlement-manage">
    <el-tabs v-model="activeTab" type="card" class="main-tabs">
      <el-tab-pane label="分账规则设置" name="rules">
        <template #label>
          <span class="tab-label">
            <el-icon><Setting /></el-icon>
            分账规则设置
          </span>
        </template>
        <SettlementRuleTab />
      </el-tab-pane>
      <el-tab-pane label="分账流水记录" name="records">
        <template #label>
          <span class="tab-label">
            <el-icon><List /></el-icon>
            分账流水记录
          </span>
        </template>
        <SettlementRecordTab />
      </el-tab-pane>
      <el-tab-pane label="异常处理" name="exceptions">
        <template #label>
          <span class="tab-label">
            <el-icon><WarningFilled /></el-icon>
            异常处理
            <el-badge v-if="exceptionStats.open > 0" :value="exceptionStats.open" class="tab-badge" />
          </span>
        </template>
        <SettlementExceptionTab :exception-stats="exceptionStats" @refresh="loadExceptionStats" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SettlementRuleTab from './SettlementRuleTab.vue';
import SettlementRecordTab from './SettlementRecordTab.vue';
import SettlementExceptionTab from './SettlementExceptionTab.vue';
import { getSettlementExceptionStatistics } from '../api/settlement.js';

const activeTab = ref('rules');
const exceptionStats = ref({ total: 0, open: 0, resolved: 0, ignored: 0, totalAmount: 0, openAmount: 0 });

const loadExceptionStats = async () => {
  try {
    exceptionStats.value = await getSettlementExceptionStatistics();
  } catch (e) {
    console.error('加载异常统计失败', e);
  }
};

onMounted(() => {
  loadExceptionStats();
});
</script>

<style scoped>
.settlement-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

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

.tab-badge {
  margin-left: 4px;
}

.main-tabs :deep(.el-tabs__content) {
  padding: 16px 0 0 0;
}
</style>
