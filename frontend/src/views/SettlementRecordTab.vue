<template>
  <div class="settlement-record-tab">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="4">
        <div class="stat-card total">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ recordStats.total }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card total-amount">
          <div class="stat-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">¥{{ (recordStats.totalAmount || 0).toLocaleString() }}</div>
            <div class="stat-label">分账总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card success">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ recordStats.success }}</div>
            <div class="stat-label">分账成功</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card pending">
          <div class="stat-icon"><el-icon><Clock /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ recordStats.pending }}</div>
            <div class="stat-label">待分账</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card failed">
          <div class="stat-icon"><el-icon><CircleClose /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ recordStats.failed }}</div>
            <div class="stat-label">分账失败</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card platform">
          <div class="stat-icon"><el-icon><OfficeBuilding /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">¥{{ (recordStats.platformTotal || 0).toLocaleString() }}</div>
            <div class="stat-label">平台累计收益</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="分账状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待分账" value="pending" />
            <el-option label="分账成功" value="success" />
            <el-option label="分账失败" value="failed" />
            <el-option label="部分分账" value="partial" />
          </el-select>
        </el-form-item>
        <el-form-item label="账期">
          <el-select v-model="filterForm.period" placeholder="全部账期" style="width: 140px" clearable @change="handleSearch">
            <el-option label="2026-01" value="2026-01" />
            <el-option label="2026-02" value="2026-02" />
            <el-option label="2026-03" value="2026-03" />
            <el-option label="2026-04" value="2026-04" />
            <el-option label="2026-05" value="2026-05" />
            <el-option label="2026-06" value="2026-06" />
          </el-select>
        </el-form-item>
        <el-form-item label="加盟等级">
          <el-select v-model="filterForm.levelName" placeholder="全部等级" style="width: 140px" clearable @change="handleSearch">
            <el-option label="金牌加盟商" value="金牌加盟商" />
            <el-option label="银牌加盟商" value="银牌加盟商" />
            <el-option label="标准加盟商" value="标准加盟商" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="流水号/订单号/合伙人/门店" style="width: 240px" clearable @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item style="margin-left: auto">
          <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>创建分账</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title"><el-icon class="title-icon"><List /></el-icon>分账流水记录</span>
          <el-button text @click="loadList"><el-icon><Refresh /></el-icon>刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="recordNo" label="流水编号" width="170" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.recordNo }}</span></template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="170" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.orderNo }}</span></template>
        </el-table-column>
        <el-table-column prop="partnerName" label="合伙人" width="100" align="center" />
        <el-table-column prop="storeName" label="门店名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="levelName" label="等级" width="100" align="center" />
        <el-table-column label="分账总额" width="130" align="right">
          <template #default="{ row }"><span class="money-text">¥{{ row.totalAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="平台收益" width="120" align="right">
          <template #default="{ row }"><span class="money-text platform">¥{{ row.platformAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="加盟商收益" width="120" align="right">
          <template #default="{ row }"><span class="money-text franchisee">¥{{ row.franchiseeAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="门店收益" width="120" align="right">
          <template #default="{ row }"><span class="money-text store">¥{{ row.storeAmount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="period" label="账期" width="90" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning" effect="light">待分账</el-tag>
            <el-tag v-else-if="row.status === 'success'" type="success" effect="light">分账成功</el-tag>
            <el-tag v-else-if="row.status === 'failed'" type="danger" effect="light">分账失败</el-tag>
            <el-tag v-else-if="row.status === 'partial'" type="warning" effect="light">部分分账</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="primary" link @click="handleExecute(row)">
              <el-icon><Promotion /></el-icon>执行分账
            </el-button>
            <el-button v-if="row.status === 'failed'" type="warning" link @click="handleRetry(row)">
              <el-icon><RefreshRight /></el-icon>重试
            </el-button>
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
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

    <el-dialog v-model="formVisible" title="创建分账记录" width="720px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="110px" class="add-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="formData.orderNo" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="formData.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合伙人姓名" prop="partnerName">
              <el-input v-model="formData.partnerName" placeholder="请输入合伙人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="formData.storeName" placeholder="请输入门店名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店编号" prop="storeNo">
              <el-input v-model="formData.storeNo" placeholder="请输入门店编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="加盟等级" prop="levelName">
              <el-select v-model="formData.levelName" placeholder="请选择加盟等级" style="width: 100%">
                <el-option label="金牌加盟商" value="金牌加盟商" />
                <el-option label="银牌加盟商" value="银牌加盟商" />
                <el-option label="标准加盟商" value="标准加盟商" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分账金额" prop="totalAmount">
              <el-input-number v-model="formData.totalAmount" :min="0" :precision="2" style="width: 100%" placeholder="请输入分账总金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账期" prop="period">
              <el-input v-model="formData.period" placeholder="如 2026-06" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="使用规则编号">
          <el-input v-model="formData.ruleNo" placeholder="选填，不填则按加盟等级自动匹配" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="分账流水详情" width="720px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="流水编号"><span class="mono-text">{{ currentDetail.recordNo }}</span></el-descriptions-item>
          <el-descriptions-item label="订单号"><span class="mono-text">{{ currentDetail.orderNo }}</span></el-descriptions-item>
          <el-descriptions-item label="关联规则">{{ currentDetail.ruleName }} ({{ currentDetail.ruleNo }})</el-descriptions-item>
          <el-descriptions-item label="合同号"><span class="mono-text">{{ currentDetail.contractNo }}</span></el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="加盟等级">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="账期">{{ currentDetail.period }}</el-descriptions-item>
          <el-descriptions-item label="分账总额" :span="2">
            <span style="font-size: 18px; font-weight: 700; color: #303133">¥{{ currentDetail.totalAmount.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="平台分成">
            <span style="color: #3b82f6; font-weight: 600">¥{{ currentDetail.platformAmount.toLocaleString() }}</span>
            <span style="color: #909399; font-size: 12px">（{{ currentDetail.platformRate }}%）</span>
          </el-descriptions-item>
          <el-descriptions-item label="加盟商分成">
            <span style="color: #10b981; font-weight: 600">¥{{ currentDetail.franchiseeAmount.toLocaleString() }}</span>
            <span style="color: #909399; font-size: 12px">（{{ currentDetail.franchiseeRate }}%）</span>
          </el-descriptions-item>
          <el-descriptions-item label="门店分成" :span="2">
            <span style="color: #f59e0b; font-weight: 600">¥{{ currentDetail.storeAmount.toLocaleString() }}</span>
            <span style="color: #909399; font-size: 12px">（{{ currentDetail.storeRate }}%）</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="currentDetail.status === 'pending'" type="warning" effect="light">待分账</el-tag>
            <el-tag v-else-if="currentDetail.status === 'success'" type="success" effect="light">分账成功</el-tag>
            <el-tag v-else-if="currentDetail.status === 'failed'" type="danger" effect="light">分账失败</el-tag>
            <el-tag v-else-if="currentDetail.status === 'partial'" type="warning" effect="light">部分分账</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分账日期">{{ currentDetail.settlementDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getSettlementRecordList, getSettlementRecordStatistics, getSettlementRecordDetail,
  addSettlementRecord, executeSettlement, retrySettlement
} from '../api/settlement.js';

const emitRefreshException = inject('loadExceptionStats', () => {});

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const recordStats = ref({
  total: 0, pending: 0, success: 0, failed: 0, partial: 0,
  totalAmount: 0, platformTotal: 0, franchiseeTotal: 0, storeTotal: 0, successAmount: 0
});

const filterForm = reactive({
  status: '',
  period: '',
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
const formRef = ref(null);
const currentDetail = ref(null);

const getDefaultForm = () => ({
  orderNo: '',
  contractNo: '',
  partnerName: '',
  storeName: '',
  storeNo: '',
  levelName: '',
  totalAmount: null,
  period: '',
  ruleNo: '',
  remark: ''
});

const formData = reactive(getDefaultForm());

const formRules = {
  orderNo: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
  partnerName: [{ required: true, message: '请输入合伙人姓名', trigger: 'blur' }],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  levelName: [{ required: true, message: '请选择加盟等级', trigger: 'change' }],
  totalAmount: [{ required: true, message: '请输入分账金额', trigger: 'blur' }]
};

const loadRecordStats = async () => {
  try {
    recordStats.value = await getSettlementRecordStatistics();
  } catch (e) {
    console.error('加载流水统计失败', e);
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
    if (filterForm.period) params.period = filterForm.period;
    if (filterForm.levelName) params.levelName = filterForm.levelName;
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    const result = await getSettlementRecordList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载流水列表失败');
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
  filterForm.period = '';
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
  Object.assign(formData, getDefaultForm());
  formVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await addSettlementRecord({ ...formData });
    ElMessage.success('分账记录创建成功');
    formVisible.value = false;
    loadList();
    loadRecordStats();
  } catch (e) {
    ElMessage.error(e.message || '创建失败');
  } finally {
    submitting.value = false;
  }
};

const handleExecute = async (row) => {
  try {
    await ElMessageBox.confirm(`确定执行该分账吗？金额为 ¥${row.totalAmount.toLocaleString()}`, '确认执行', { type: 'warning' });
    const result = await executeSettlement(row.id);
    if (result.status === 'success') {
      ElMessage.success('分账执行成功');
    } else if (result.status === 'failed') {
      ElMessage.warning('分账执行失败，已生成异常记录，请在异常处理中查看');
    }
    loadList();
    loadRecordStats();
    emitRefreshException();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '执行失败');
  }
};

const handleRetry = async (row) => {
  try {
    await ElMessageBox.confirm('确定重试该分账吗？', '确认重试', { type: 'warning' });
    const result = await retrySettlement(row.id);
    if (result.status === 'success') {
      ElMessage.success('分账重试成功');
    } else {
      ElMessage.warning('分账重试仍失败，请人工处理');
    }
    loadList();
    loadRecordStats();
    emitRefreshException();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '重试失败');
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getSettlementRecordDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

onMounted(() => {
  loadRecordStats();
  loadList();
});
</script>

<style scoped>
.settlement-record-tab {
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
.stat-card.total-amount .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card.success .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-card.pending .stat-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-card.failed .stat-icon { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); }
.stat-card.platform .stat-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.stat-info { flex: 1; min-width: 0; }
.stat-value { font-size: 26px; font-weight: 700; color: #303133; line-height: 1.2; }
.stat-value.small { font-size: 16px; }
.stat-label { font-size: 12px; color: #909399; margin-top: 4px; }

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

.money-text {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12.5px;
  font-weight: 600;
}
.money-text.platform { color: #3b82f6; }
.money-text.franchisee { color: #10b981; }
.money-text.store { color: #f59e0b; }

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.add-form { padding: 4px 8px; }
.detail-content { padding: 4px 0; }
</style>
