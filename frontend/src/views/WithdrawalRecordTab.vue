<template>
  <div class="withdrawal-record-tab">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="提现状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待审核" value="pending" />
            <el-option label="审核通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已打款" value="paid" />
            <el-option label="打款失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核方式">
          <el-select v-model="filterForm.auditMode" placeholder="全部方式" style="width: 140px" clearable @change="handleSearch">
            <el-option label="自动审核" value="auto" />
            <el-option label="人工审核" value="manual" />
          </el-select>
        </el-form-item>
        <el-form-item label="提现类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 140px" clearable @change="handleSearch">
            <el-option label="普通提现" value="normal" />
            <el-option label="加急提现" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
            clearable
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="提现单号/门店/合伙人" style="width: 260px" clearable @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item style="margin-left: auto">
          <el-button type="primary" @click="handleCreate"><el-icon><Wallet /></el-icon>发起提现</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Tickets /></el-icon>
            提现记录列表
          </span>
          <el-button text @click="loadList"><el-icon><Refresh /></el-icon>刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="withdrawalNo" label="提现单号" width="170" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.withdrawalNo }}</span></template>
        </el-table-column>
        <el-table-column prop="storeName" label="门店名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="partnerName" label="合伙人" width="90" align="center" />
        <el-table-column label="提现金额" width="130" align="right">
          <template #default="{ row }">
            <span class="money-text">¥{{ Number(row.amount).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手续费" width="90" align="right">
          <template #default="{ row }">
            <span v-if="row.fee > 0" style="color: #f56c6c">¥{{ row.fee }}</span>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="实际到账" width="120" align="right">
          <template #default="{ row }">
            <span class="money-text green">¥{{ Number(row.actualAmount).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.auditModeType" effect="light" size="small">{{ row.auditModeText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.typeType" effect="light" size="small">{{ row.typeText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.statusType" effect="light" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="160" align="center" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending' && row.auditMode === 'manual'"
              type="success" link
              @click="handleAudit(row, 'approved')"
            >
              <el-icon><Check /></el-icon>通过
            </el-button>
            <el-button
              v-if="row.status === 'pending' && row.auditMode === 'manual'"
              type="danger" link
              @click="handleAudit(row, 'rejected')"
            >
              <el-icon><Close /></el-icon>拒绝
            </el-button>
            <el-button
              v-if="row.status === 'approved'"
              type="primary" link
              @click="handlePay(row)"
            >
              <el-icon><Money /></el-icon>打款
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              type="warning" link
              @click="handleRetryPay(row)"
            >
              <el-icon><RefreshRight /></el-icon>重试打款
            </el-button>
            <el-button
              v-if="row.status === 'pending' || row.status === 'failed'"
              type="info" link
              @click="handleCancel(row)"
            >
              <el-icon><Close /></el-icon>取消
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

    <el-dialog v-model="createVisible" title="发起提现" width="620px" :close-on-click-modal="false">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px" class="dialog-form">
        <el-form-item label="选择门店" prop="storeId">
          <el-select
            v-model="createForm.storeId"
            placeholder="请选择门店"
            style="width: 100%"
            filterable
            @change="handleStoreChange"
          >
            <el-option
              v-for="store in storeOptions"
              :key="store.id"
              :label="`${store.storeName} (${store.storeNo})`"
              :value="store.id"
            />
          </el-select>
        </el-form-item>
        <div v-if="selectedStore" class="balance-info">
          <el-alert
            title=""
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              <div class="balance-info-content">
                <span>当前可用余额：</span>
                <span class="balance-amount">¥{{ Number(selectedStore.balance - selectedStore.frozenBalance).toLocaleString() }}</span>
              </div>
            </template>
          </el-alert>
        </div>
        <el-form-item label="提现类型" prop="type">
          <el-radio-group v-model="createForm.type">
            <el-radio value="normal">普通提现</el-radio>
            <el-radio value="urgent">
              加急提现
              <span style="color: #f56c6c; font-size: 12px">（手续费10元）</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提现金额" prop="amount">
          <el-input-number
            v-model="createForm.amount"
            :min="100"
            :precision="2"
            :step="100"
            style="width: 100%"
            placeholder="最低提现100元"
          />
          <div class="amount-actions">
            <el-button size="small" text @click="setFullAmount">全部提现</el-button>
          </div>
        </el-form-item>
        <el-form-item label="收款银行">
          <el-input v-model="createForm.bankName" placeholder="请输入收款银行名称" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="createForm.bankAccount" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="开户名">
          <el-input v-model="createForm.bankAccountName" placeholder="请输入开户名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" placeholder="选填，备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitCreate">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditVisible" :title="auditType === 'approved' ? '审核通过' : '审核拒绝'" width="560px" :close-on-click-modal="false">
      <div v-if="auditRow" class="audit-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="提现单号"><span class="mono-text">{{ auditRow.withdrawalNo }}</span></el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ auditRow.storeName }}</el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ auditRow.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="提现金额">
            <span style="color: #f56c6c; font-weight: 700">¥{{ Number(auditRow.amount).toLocaleString() }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="100px" class="dialog-form" style="margin-top: 16px">
        <el-form-item label="审核人" prop="auditor">
          <el-input v-model="auditForm.auditor" placeholder="请输入审核人姓名" />
        </el-form-item>
        <el-form-item :label="auditType === 'approved' ? '审核意见' : '拒绝原因'" prop="auditRemark">
          <el-input v-model="auditForm.auditRemark" type="textarea" :rows="3" :placeholder="auditType === 'approved' ? '请输入审核意见（选填）' : '请输入拒绝原因'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button :type="auditType === 'approved' ? 'success' : 'danger'" :loading="submitting" @click="handleSubmitAudit">
          {{ auditType === 'approved' ? '确认通过' : '确认拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="提现详情" width="720px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="提现单号"><span class="mono-text">{{ currentDetail.withdrawalNo }}</span></el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.statusType" effect="light">{{ currentDetail.statusText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="门店编号"><span class="mono-text">{{ currentDetail.storeNo }}</span></el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.partnerPhone }}</el-descriptions-item>
          <el-descriptions-item label="提现类型">
            <el-tag :type="currentDetail.typeType" effect="light" size="small">{{ currentDetail.typeText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核方式">
            <el-tag :type="currentDetail.auditModeType" effect="light" size="small">{{ currentDetail.auditModeText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提现金额" :span="2">
            <span style="font-size: 20px; font-weight: 700; color: #f56c6c">¥{{ Number(currentDetail.amount).toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="手续费">
            <span v-if="currentDetail.fee > 0">¥{{ currentDetail.fee }}</span>
            <span v-else style="color: #909399">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="实际到账">
            <span style="font-weight: 600; color: #67c23a">¥{{ Number(currentDetail.actualAmount).toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收款银行" :span="2">{{ currentDetail.bankName }}</el-descriptions-item>
          <el-descriptions-item label="银行账号"><span class="mono-text">{{ currentDetail.bankAccount }}</span></el-descriptions-item>
          <el-descriptions-item label="开户名">{{ currentDetail.bankAccountName }}</el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">{{ currentDetail.applyTime }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.auditTime" label="审核时间">{{ currentDetail.auditTime }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.auditor" label="审核人">{{ currentDetail.auditor }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.auditRemark" label="审核意见" :span="2">{{ currentDetail.auditRemark }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.payTime" label="打款时间">{{ currentDetail.payTime }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.payRemark" label="打款备注" :span="2">{{ currentDetail.payRemark }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Wallet, Search, Refresh, Tickets, View, Check, Close, Money, RefreshRight
} from '@element-plus/icons-vue';
import {
  getWithdrawalList,
  getWithdrawalDetail,
  applyWithdrawal,
  auditWithdrawal,
  executePay,
  retryPay,
  cancelWithdrawal
} from '../api/withdrawal.js';
import { getStoreList } from '../api/store.js';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['refresh']);

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const storeOptions = ref([]);
const selectedStore = ref(null);

const filterForm = reactive({
  status: '',
  auditMode: '',
  type: '',
  keyword: '',
  dateRange: []
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const createVisible = ref(false);
const auditVisible = ref(false);
const detailVisible = ref(false);
const auditType = ref('approved');
const auditRow = ref(null);
const currentDetail = ref(null);

const createFormRef = ref(null);
const auditFormRef = ref(null);

const createForm = reactive({
  storeId: '',
  amount: null,
  type: 'normal',
  bankName: '',
  bankAccount: '',
  bankAccountName: '',
  remark: ''
});

const createRules = {
  storeId: [{ required: true, message: '请选择门店', trigger: 'change' }],
  amount: [{ required: true, message: '请输入提现金额', trigger: 'blur' }]
};

const auditForm = reactive({ auditor: '', auditRemark: '' });
const auditRules = {
  auditor: [{ required: true, message: '请输入审核人', trigger: 'blur' }]
};

const loadStores = async () => {
  try {
    const result = await getStoreList({ page: 1, pageSize: 1000 });
    storeOptions.value = result.list || [];
  } catch (e) {
    console.error('加载门店列表失败', e);
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
    if (filterForm.auditMode) params.auditMode = filterForm.auditMode;
    if (filterForm.type) params.type = filterForm.type;
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0];
      params.endDate = filterForm.dateRange[1];
    }
    const result = await getWithdrawalList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载提现列表失败');
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
  filterForm.auditMode = '';
  filterForm.type = '';
  filterForm.keyword = '';
  filterForm.dateRange = [];
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

const handleCreate = () => {
  Object.assign(createForm, {
    storeId: '',
    amount: null,
    type: 'normal',
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    remark: ''
  });
  selectedStore.value = null;
  createVisible.value = true;
};

const handleStoreChange = async (storeId) => {
  const store = storeOptions.value.find(s => s.id === storeId);
  selectedStore.value = store || null;
  if (store) {
    createForm.bankName = store.bankName || '';
    createForm.bankAccount = store.bankAccount || '';
    createForm.bankAccountName = store.bankAccountName || '';
  }
};

const setFullAmount = () => {
  if (selectedStore.value) {
    const available = selectedStore.value.balance - selectedStore.value.frozenBalance;
    createForm.amount = available;
  }
};

const handleSubmitCreate = async () => {
  if (!createFormRef.value) return;
  try {
    await createFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await applyWithdrawal({ ...createForm });
    ElMessage.success('提现申请提交成功');
    createVisible.value = false;
    loadList();
    emit('refresh');
  } catch (e) {
    ElMessage.error(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
};

const handleAudit = (row, type) => {
  auditType.value = type;
  auditRow.value = row;
  auditForm.auditor = '';
  auditForm.auditRemark = '';
  auditVisible.value = true;
};

const handleSubmitAudit = async () => {
  if (!auditFormRef.value) return;
  try {
    await auditFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await auditWithdrawal(auditRow.value.id, {
      status: auditType.value,
      auditor: auditForm.auditor,
      auditRemark: auditForm.auditRemark
    });
    ElMessage.success(auditType.value === 'approved' ? '审核通过' : '已拒绝');
    auditVisible.value = false;
    loadList();
    emit('refresh');
  } catch (e) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

const handlePay = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认对提现单 ${row.withdrawalNo} 执行打款操作？金额：¥${Number(row.amount).toLocaleString()}`,
      '打款确认',
      { type: 'warning', confirmButtonText: '确认打款', cancelButtonText: '取消' }
    );
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await executePay(row.id);
    ElMessage.success('打款成功');
    loadList();
    emit('refresh');
  } catch (e) {
    ElMessage.error(e.message || '打款失败');
  } finally {
    submitting.value = false;
  }
};

const handleRetryPay = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认重试打款？提现单：${row.withdrawalNo}，金额：¥${Number(row.amount).toLocaleString()}`,
      '重试打款',
      { type: 'warning', confirmButtonText: '确认重试', cancelButtonText: '取消' }
    );
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await retryPay(row.id);
    ElMessage.success('重试打款成功');
    loadList();
    emit('refresh');
  } catch (e) {
    ElMessage.error(e.message || '重试失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认取消提现 ${row.withdrawalNo}？该操作不可恢复。`,
      '取消确认',
      { type: 'warning', confirmButtonText: '确认取消', cancelButtonText: '再想想' }
    );
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await cancelWithdrawal(row.id);
    ElMessage.success('已取消提现');
    loadList();
    emit('refresh');
  } catch (e) {
    ElMessage.error(e.message || '取消失败');
  } finally {
    submitting.value = false;
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getWithdrawalDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

onMounted(() => {
  loadStores();
  loadList();
});
</script>

<style scoped>
.withdrawal-record-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.money-text {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
  color: #f56c6c;
}

.money-text.green {
  color: #67c23a;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-form { padding: 4px 8px; }

.balance-info {
  margin-bottom: 12px;
}

.balance-info-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.balance-amount {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.amount-actions {
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
}

.audit-info { padding: 0 8px; }

.detail-content { padding: 4px 0; }
</style>
