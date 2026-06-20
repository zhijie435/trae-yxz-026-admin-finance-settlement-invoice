<template>
  <div class="settlement-rule-tab">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="4">
        <div class="stat-card total">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ ruleStats.total }}</div>
            <div class="stat-label">规则总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card enabled">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ ruleStats.enabled }}</div>
            <div class="stat-label">已启用</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card disabled">
          <div class="stat-icon"><el-icon><CircleClose /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ ruleStats.disabled }}</div>
            <div class="stat-label">已停用</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card rates">
          <div class="stat-icon"><el-icon><Percentage /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">3%~5%</div>
            <div class="stat-label">平台费率区间</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="加盟等级">
          <el-select v-model="filterForm.levelName" placeholder="全部等级" style="width: 140px" clearable @change="handleSearch">
            <el-option label="金牌加盟商" value="金牌加盟商" />
            <el-option label="银牌加盟商" value="银牌加盟商" />
            <el-option label="标准加盟商" value="标准加盟商" />
            <el-option label="全等级" value="全等级" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="规则编号/名称/等级" style="width: 240px" clearable @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item style="margin-left: auto">
          <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增规则</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title"><el-icon class="title-icon"><Setting /></el-icon>分账规则列表</span>
          <el-button text @click="loadList"><el-icon><Refresh /></el-icon>刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="ruleNo" label="规则编号" width="170" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.ruleNo }}</span></template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="levelName" label="适用等级" width="110" align="center" />
        <el-table-column label="分账比例" width="260" align="center">
          <template #default="{ row }">
            <div class="rate-bar">
              <div class="rate-segment platform" :style="{ width: row.platformRate + '%' }" :title="`平台: ${row.platformRate}%`"></div>
              <div class="rate-segment franchisee" :style="{ width: row.franchiseeRate + '%' }" :title="`加盟商: ${row.franchiseeRate}%`"></div>
              <div class="rate-segment store" :style="{ width: row.storeRate + '%' }" :title="`门店: ${row.storeRate}%`"></div>
            </div>
            <div class="rate-texts">
              <span class="rate-item platform">平台{{ row.platformRate }}%</span>
              <span class="rate-item franchisee">加盟商{{ row.franchiseeRate }}%</span>
              <span class="rate-item store">门店{{ row.storeRate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="settlementCycle" label="结算周期" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.settlementCycle === 'daily'" type="info" effect="light">日结</el-tag>
            <el-tag v-else-if="row.settlementCycle === 'weekly'" type="warning" effect="light">周结</el-tag>
            <el-tag v-else type="success" effect="light">月结</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额限额" width="160" align="center">
          <template #default="{ row }">
            <span v-if="row.minAmount || row.maxAmount">¥{{ row.minAmount.toLocaleString() }} ~ ¥{{ row.maxAmount.toLocaleString() }}</span>
            <span v-else>无限制</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="200" align="center">
          <template #default="{ row }">{{ row.effectiveDate || '-' }} ~ {{ row.expiryDate || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'enabled'" type="success" effect="light">启用</el-tag>
            <el-tag v-else type="info" effect="light">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)"><el-icon><View /></el-icon>详情</el-button>
            <el-button type="primary" link @click="handleEdit(row)"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button v-if="row.status === 'enabled'" type="warning" link @click="handleToggleStatus(row, 'disabled')">停用</el-button>
            <el-button v-else type="success" link @click="handleToggleStatus(row, 'enabled')">启用</el-button>
            <el-button type="danger" link @click="handleDelete(row)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="formVisible" :title="isEdit ? '编辑分账规则' : '新增分账规则'" width="720px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="110px" class="add-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用等级" prop="levelName">
              <el-select v-model="formData.levelName" placeholder="请选择适用等级" style="width: 100%">
                <el-option label="金牌加盟商" value="金牌加盟商" />
                <el-option label="银牌加盟商" value="银牌加盟商" />
                <el-option label="标准加盟商" value="标准加盟商" />
                <el-option label="全等级通用" value="全等级" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">分账比例配置（合计须为100%）</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="平台比例(%)" prop="platformRate">
              <el-input-number v-model="formData.platformRate" :min="0" :max="100" :precision="2" :step="0.5" style="width: 100%" @change="validateRateSum" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="加盟商比例(%)" prop="franchiseeRate">
              <el-input-number v-model="formData.franchiseeRate" :min="0" :max="100" :precision="2" :step="0.5" style="width: 100%" @change="validateRateSum" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="门店比例(%)" prop="storeRate">
              <el-input-number v-model="formData.storeRate" :min="0" :max="100" :precision="2" :step="0.5" style="width: 100%" @change="validateRateSum" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="rateSumError" class="rate-error-row">
          <el-col :span="24">
            <el-alert :title="rateSumError" type="error" show-icon :closable="false" size="small" />
          </el-col>
        </el-row>
        <el-row v-else class="rate-success-row">
          <el-col :span="24">
            <el-alert title="比例合计正确（100%）" type="success" show-icon :closable="false" size="small" />
          </el-col>
        </el-row>
        <el-divider content-position="left">其他配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算周期" prop="settlementCycle">
              <el-select v-model="formData.settlementCycle" placeholder="请选择结算周期" style="width: 100%">
                <el-option label="日结" value="daily" />
                <el-option label="周结" value="weekly" />
                <el-option label="月结" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最低金额" prop="minAmount">
              <el-input-number v-model="formData.minAmount" :min="0" :precision="2" style="width: 100%" placeholder="0为不限制" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最高金额" prop="maxAmount">
              <el-input-number v-model="formData.maxAmount" :min="0" :precision="2" style="width: 100%" placeholder="0为不限制" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker v-model="formData.effectiveDate" type="date" value-format="YYYY-MM-DD" placeholder="选择生效日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expiryDate">
              <el-date-picker v-model="formData.expiryDate" type="date" value-format="YYYY-MM-DD" placeholder="选择失效日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="规则说明">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="选填，描述规则使用场景" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ isEdit ? '保存修改' : '确认添加' }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="分账规则详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="规则编号"><span class="mono-text">{{ currentDetail.ruleNo }}</span></el-descriptions-item>
          <el-descriptions-item label="规则名称">{{ currentDetail.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="适用等级">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="currentDetail.status === 'enabled'" type="success" effect="light">启用</el-tag>
            <el-tag v-else type="info" effect="light">停用</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="平台分成" :span="2">{{ currentDetail.platformRate }}%</el-descriptions-item>
          <el-descriptions-item label="加盟商分成" :span="2">{{ currentDetail.franchiseeRate }}%</el-descriptions-item>
          <el-descriptions-item label="门店分成" :span="2">{{ currentDetail.storeRate }}%</el-descriptions-item>
          <el-descriptions-item label="结算周期">
            <el-tag v-if="currentDetail.settlementCycle === 'daily'" type="info" effect="light">日结</el-tag>
            <el-tag v-else-if="currentDetail.settlementCycle === 'weekly'" type="warning" effect="light">周结</el-tag>
            <el-tag v-else type="success" effect="light">月结</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="金额限制">¥{{ currentDetail.minAmount.toLocaleString() }} ~ ¥{{ currentDetail.maxAmount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ currentDetail.effectiveDate }}</el-descriptions-item>
          <el-descriptions-item label="失效日期">{{ currentDetail.expiryDate }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentDetail.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="规则说明" :span="2">{{ currentDetail.description || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getSettlementRuleList, getSettlementRuleStatistics, getSettlementRuleDetail,
  addSettlementRule, updateSettlementRule, updateSettlementRuleStatus, deleteSettlementRule
} from '../api/settlement.js';

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const ruleStats = ref({ total: 0, enabled: 0, disabled: 0 });

const filterForm = reactive({
  status: '',
  levelName: '',
  keyword: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const formVisible = ref(false);
const detailVisible = ref(false);
const isEdit = ref(false);
const editId = ref('');
const formRef = ref(null);
const currentDetail = ref(null);

const getDefaultForm = () => ({
  ruleName: '',
  levelName: '',
  platformRate: null,
  franchiseeRate: null,
  storeRate: null,
  settlementCycle: 'monthly',
  minAmount: 0,
  maxAmount: 0,
  effectiveDate: '',
  expiryDate: '',
  description: ''
});

const formData = reactive(getDefaultForm());

const formRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  levelName: [{ required: true, message: '请选择适用等级', trigger: 'change' }],
  platformRate: [{ required: true, message: '请输入平台比例', trigger: 'blur' }],
  franchiseeRate: [{ required: true, message: '请输入加盟商比例', trigger: 'blur' }],
  storeRate: [{ required: true, message: '请输入门店比例', trigger: 'blur' }],
  settlementCycle: [{ required: true, message: '请选择结算周期', trigger: 'change' }]
};

const rateSumError = computed(() => {
  const sum = (formData.platformRate || 0) + (formData.franchiseeRate || 0) + (formData.storeRate || 0);
  if (formData.platformRate == null || formData.franchiseeRate == null || formData.storeRate == null) return '';
  if (Math.abs(sum - 100) > 0.001) return `当前比例合计为 ${sum}%，必须等于 100%`;
  return '';
});

const validateRateSum = () => {};

const loadRuleStats = async () => {
  try {
    ruleStats.value = await getSettlementRuleStatistics();
  } catch (e) {
    console.error('加载规则统计失败', e);
  }
};

const loadList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (filterForm.status) params.status = filterForm.status;
    if (filterForm.levelName) params.levelName = filterForm.levelName;
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    const result = await getSettlementRuleList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载规则列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadList();
};

const handleReset = () => {
  filterForm.status = '';
  filterForm.levelName = '';
  filterForm.keyword = '';
  pagination.page = 1;
  loadList();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  loadList();
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  loadList();
};

const handleAdd = () => {
  isEdit.value = false;
  editId.value = '';
  Object.assign(formData, getDefaultForm());
  formVisible.value = true;
};

const handleEdit = async (row) => {
  try {
    const detail = await getSettlementRuleDetail(row.id);
    isEdit.value = true;
    editId.value = row.id;
    Object.assign(formData, {
      ruleName: detail.ruleName,
      levelName: detail.levelName,
      platformRate: detail.platformRate,
      franchiseeRate: detail.franchiseeRate,
      storeRate: detail.storeRate,
      settlementCycle: detail.settlementCycle,
      minAmount: detail.minAmount,
      maxAmount: detail.maxAmount,
      effectiveDate: detail.effectiveDate,
      expiryDate: detail.expiryDate,
      description: detail.description
    });
    formVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

const handleSubmit = async () => {
  if (rateSumError.value) {
    ElMessage.error(rateSumError.value);
    return;
  }
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateSettlementRule(editId.value, { ...formData });
      ElMessage.success('规则更新成功');
    } else {
      await addSettlementRule({ ...formData });
      ElMessage.success('规则添加成功');
    }
    formVisible.value = false;
    loadList();
    loadRuleStats();
  } catch (e) {
    ElMessage.error(e.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};

const handleToggleStatus = async (row, status) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 'enabled' ? '启用' : '停用'}该规则吗？`,
      '确认操作',
      { type: 'warning' }
    );
    await updateSettlementRuleStatus(row.id, status);
    ElMessage.success('状态更新成功');
    loadList();
    loadRuleStats();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败');
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该分账规则吗？删除后不可恢复。', '确认删除', { type: 'warning' });
    await deleteSettlementRule(row.id);
    ElMessage.success('删除成功');
    loadList();
    loadRuleStats();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败');
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getSettlementRuleDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

onMounted(() => {
  loadRuleStats();
  loadList();
});
</script>

<style scoped>
.settlement-rule-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.stat-card.enabled .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-card.disabled .stat-icon { background: linear-gradient(135deg, #89909f 0%, #a8b0c0 100%); }
.stat-card.rates .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

.stat-info { flex: 1; min-width: 0; }

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-value.small {
  font-size: 18px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.filter-card { border-radius: 10px; }
.filter-form { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.table-card { border-radius: 10px; }

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

.mono-text {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12.5px;
  font-weight: 500;
}

.rate-bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 6px;
}

.rate-segment {
  height: 100%;
  transition: width 0.3s;
}

.rate-segment.platform { background: linear-gradient(135deg, #3b82f6, #6366f1); }
.rate-segment.franchisee { background: linear-gradient(135deg, #10b981, #34d399); }
.rate-segment.store { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

.rate-texts {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  font-size: 11px;
}

.rate-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #f5f7fa;
}

.rate-item.platform { color: #3b82f6; }
.rate-item.franchisee { color: #10b981; }
.rate-item.store { color: #f59e0b; }

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.add-form { padding: 4px 8px; }

.rate-error-row, .rate-success-row {
  margin-bottom: 18px;
}

.detail-content { padding: 4px 0; }
</style>
