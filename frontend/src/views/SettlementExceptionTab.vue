<template>
  <div class="settlement-exception-tab">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="4">
        <div class="stat-card total">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ exceptionStats.total }}</div>
            <div class="stat-label">异常总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card open">
          <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ exceptionStats.open }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card resolved">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ exceptionStats.resolved }}</div>
            <div class="stat-label">已解决</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card ignored">
          <div class="stat-icon"><el-icon><MinusCircle /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ exceptionStats.ignored }}</div>
            <div class="stat-label">已忽略</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card open-amount">
          <div class="stat-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">¥{{ (exceptionStats.openAmount || 0).toLocaleString() }}</div>
            <div class="stat-label">待处理涉及金额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="4">
        <div class="stat-card total-amount">
          <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">¥{{ (exceptionStats.totalAmount || 0).toLocaleString() }}</div>
            <div class="stat-label">累计涉及金额</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="处理状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待处理" value="open" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item label="异常类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 160px" clearable @change="handleSearch">
            <el-option label="金额不符" value="amount_mismatch" />
            <el-option label="规则缺失" value="rule_not_found" />
            <el-option label="重复记录" value="duplicate_record" />
            <el-option label="支付失败" value="payment_failed" />
            <el-option label="其他异常" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="异常编号/关联流水/标题" style="width: 240px" clearable @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item style="margin-left: auto">
          <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>登记异常</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title"><el-icon class="title-icon"><WarningFilled /></el-icon>异常处理列表</span>
          <el-button text @click="loadList"><el-icon><Refresh /></el-icon>刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="exceptionNo" label="异常编号" width="170" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.exceptionNo }}</span></template>
        </el-table-column>
        <el-table-column prop="recordNo" label="关联流水" width="170" align="center">
          <template #default="{ row }">
            <span v-if="row.recordNo" class="mono-text">{{ row.recordNo }}</span>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="异常类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'amount_mismatch'" type="warning" effect="light">金额不符</el-tag>
            <el-tag v-else-if="row.type === 'rule_not_found'" type="danger" effect="light">规则缺失</el-tag>
            <el-tag v-else-if="row.type === 'duplicate_record'" type="warning" effect="light">重复记录</el-tag>
            <el-tag v-else-if="row.type === 'payment_failed'" type="danger" effect="light">支付失败</el-tag>
            <el-tag v-else type="info" effect="light">其他异常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="异常标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="涉及金额" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row.amount > 0" class="money-text">¥{{ row.amount.toLocaleString() }}</span>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="涉及方" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-for="party in row.affectedParties" :key="party" size="small" effect="plain" style="margin-right: 4px">{{ party }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'open'" type="danger" effect="light">待处理</el-tag>
            <el-tag v-else-if="row.status === 'resolved'" type="success" effect="light">已解决</el-tag>
            <el-tag v-else type="info" effect="light">已忽略</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'open'" type="success" link @click="handleResolve(row)">
              <el-icon><CircleCheck /></el-icon>解决
            </el-button>
            <el-button v-if="row.status === 'open'" type="info" link @click="handleIgnore(row)">
              <el-icon><MinusCircle /></el-icon>忽略
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

    <el-dialog v-model="formVisible" title="登记异常记录" width="680px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="110px" class="add-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="异常类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择异常类型" style="width: 100%">
                <el-option label="金额不符" value="amount_mismatch" />
                <el-option label="规则缺失" value="rule_not_found" />
                <el-option label="重复记录" value="duplicate_record" />
                <el-option label="支付失败" value="payment_failed" />
                <el-option label="其他异常" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联流水号" prop="recordNo">
              <el-input v-model="formData.recordNo" placeholder="选填，相关分账流水编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="异常标题" prop="title">
          <el-input v-model="formData.title" placeholder="请简要描述异常" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="涉及金额">
              <el-input-number v-model="formData.amount" :min="0" :precision="2" style="width: 100%" placeholder="选填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="涉及方">
              <el-select v-model="formData.affectedParties" multiple placeholder="选择涉及方" style="width: 100%">
                <el-option label="平台" value="平台" />
                <el-option label="加盟商" value="加盟商" />
                <el-option label="门店" value="门店" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请详细描述异常情况" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认登记</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="异常详情" width="680px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="异常编号"><span class="mono-text">{{ currentDetail.exceptionNo }}</span></el-descriptions-item>
          <el-descriptions-item label="关联流水">
            <span v-if="currentDetail.recordNo" class="mono-text">{{ currentDetail.recordNo }}</span>
            <span v-else style="color: #c0c4cc">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="异常类型">
            <el-tag v-if="currentDetail.type === 'amount_mismatch'" type="warning" effect="light">金额不符</el-tag>
            <el-tag v-else-if="currentDetail.type === 'rule_not_found'" type="danger" effect="light">规则缺失</el-tag>
            <el-tag v-else-if="currentDetail.type === 'duplicate_record'" type="warning" effect="light">重复记录</el-tag>
            <el-tag v-else-if="currentDetail.type === 'payment_failed'" type="danger" effect="light">支付失败</el-tag>
            <el-tag v-else type="info" effect="light">其他异常</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag v-if="currentDetail.status === 'open'" type="danger" effect="light">待处理</el-tag>
            <el-tag v-else-if="currentDetail.status === 'resolved'" type="success" effect="light">已解决</el-tag>
            <el-tag v-else type="info" effect="light">已忽略</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="异常标题" :span="2">{{ currentDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="涉及金额">
            <span v-if="currentDetail.amount > 0" class="money-text">¥{{ currentDetail.amount.toLocaleString() }}</span>
            <span v-else style="color: #c0c4cc">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="涉及方">
            <el-tag v-for="party in currentDetail.affectedParties" :key="party" size="small" effect="plain" style="margin-right: 4px">{{ party }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="处理人">
            <span v-if="currentDetail.handler">{{ currentDetail.handler }}</span>
            <span v-else style="color: #c0c4cc">未处理</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.handleTime" label="处理时间">{{ currentDetail.handleTime }}</el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">{{ currentDetail.description }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.handleResult" label="处理结果" :span="2">
            <div style="background: #f0f9eb; padding: 10px; border-radius: 4px; color: #67c23a">
              {{ currentDetail.handleResult }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog v-model="resolveVisible" title="处理异常" width="560px" :close-on-click-modal="false">
      <div v-if="resolveRow" class="resolve-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="异常编号">{{ resolveRow.exceptionNo }}</el-descriptions-item>
          <el-descriptions-item label="异常标题">{{ resolveRow.title }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="resolveForm" :rules="resolveRules" ref="resolveFormRef" label-width="100px" style="margin-top: 20px">
          <el-form-item label="处理人">
            <el-input v-model="resolveForm.handler" placeholder="请输入处理人姓名" />
          </el-form-item>
          <el-form-item label="处理结果" prop="handleResult">
            <el-input v-model="resolveForm.handleResult" type="textarea" :rows="4" placeholder="请输入详细处理结果" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="resolveVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitResolve">确认解决</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ignoreVisible" title="忽略异常" width="500px" :close-on-click-modal="false">
      <div v-if="ignoreRow" class="ignore-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="异常编号">{{ ignoreRow.exceptionNo }}</el-descriptions-item>
          <el-descriptions-item label="异常标题">{{ ignoreRow.title }}</el-descriptions-item>
        </el-descriptions>
        <el-alert type="warning" show-icon :closable="false" style="margin-top: 16px">
          标记为忽略后，该异常将不再出现在待处理列表中。
        </el-alert>
        <el-form :model="ignoreForm" ref="ignoreFormRef" label-width="100px" style="margin-top: 20px">
          <el-form-item label="处理人">
            <el-input v-model="ignoreForm.handler" placeholder="请输入处理人姓名" />
          </el-form-item>
          <el-form-item label="忽略原因">
            <el-input v-model="ignoreForm.handleResult" type="textarea" :rows="3" placeholder="选填，说明忽略原因" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="ignoreVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="handleSubmitIgnore">确认忽略</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getSettlementExceptionList, getSettlementExceptionDetail,
  addSettlementException, resolveSettlementException, ignoreSettlementException
} from '../api/settlement.js';

const props = defineProps({
  exceptionStats: {
    type: Object,
    default: () => ({ total: 0, open: 0, resolved: 0, ignored: 0, totalAmount: 0, openAmount: 0 })
  }
});

const emit = defineEmits(['refresh']);

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);

const filterForm = reactive({
  status: '',
  type: '',
  keyword: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const formVisible = ref(false);
const detailVisible = ref(false);
const resolveVisible = ref(false);
const ignoreVisible = ref(false);

const formRef = ref(null);
const resolveFormRef = ref(null);
const ignoreFormRef = ref(null);

const currentDetail = ref(null);
const resolveRow = ref(null);
const ignoreRow = ref(null);

const getDefaultForm = () => ({
  type: '',
  recordNo: '',
  title: '',
  amount: 0,
  affectedParties: [],
  description: ''
});

const formData = reactive(getDefaultForm());

const resolveForm = reactive({
  handler: '',
  handleResult: ''
});

const ignoreForm = reactive({
  handler: '',
  handleResult: ''
});

const formRules = {
  type: [{ required: true, message: '请选择异常类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入异常标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入详细描述', trigger: 'blur' }]
};

const resolveRules = {
  handleResult: [{ required: true, message: '请输入处理结果', trigger: 'blur' }]
};

const refreshStats = () => {
  emit('refresh');
};

const loadList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (filterForm.status) params.status = filterForm.status;
    if (filterForm.type) params.type = filterForm.type;
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    const result = await getSettlementExceptionList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载异常列表失败');
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
  filterForm.type = '';
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
    await addSettlementException({ ...formData });
    ElMessage.success('异常登记成功');
    formVisible.value = false;
    loadList();
    refreshStats();
  } catch (e) {
    ElMessage.error(e.message || '登记失败');
  } finally {
    submitting.value = false;
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getSettlementExceptionDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

const handleResolve = (row) => {
  resolveRow.value = row;
  resolveForm.handler = '';
  resolveForm.handleResult = '';
  resolveVisible.value = true;
};

const handleSubmitResolve = async () => {
  if (!resolveFormRef.value) return;
  try {
    await resolveFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await resolveSettlementException(resolveRow.value.id, { ...resolveForm });
    ElMessage.success('异常已标记为解决');
    resolveVisible.value = false;
    loadList();
    refreshStats();
  } catch (e) {
    ElMessage.error(e.message || '处理失败');
  } finally {
    submitting.value = false;
  }
};

const handleIgnore = (row) => {
  ignoreRow.value = row;
  ignoreForm.handler = '';
  ignoreForm.handleResult = '';
  ignoreVisible.value = true;
};

const handleSubmitIgnore = async () => {
  submitting.value = true;
  try {
    await ignoreSettlementException(ignoreRow.value.id, { ...ignoreForm });
    ElMessage.success('异常已标记为忽略');
    ignoreVisible.value = false;
    loadList();
    refreshStats();
  } catch (e) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.settlement-exception-tab {
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
.stat-card.open .stat-icon { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); }
.stat-card.resolved .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-card.ignored .stat-icon { background: linear-gradient(135deg, #89909f 0%, #a8b0c0 100%); }
.stat-card.open-amount .stat-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-card.total-amount .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

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

.title-icon { color: #f56c6c; }

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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.add-form { padding: 4px 8px; }
.detail-content { padding: 4px 0; }
.resolve-info { padding: 4px 0; }
.ignore-info { padding: 4px 0; }
</style>
