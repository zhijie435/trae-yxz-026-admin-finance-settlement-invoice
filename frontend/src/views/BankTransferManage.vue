<template>
  <div class="bank-transfer-manage">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">全部水单</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card amount">
          <div class="stat-icon"><el-icon><Coin /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value small">¥{{ (stats.totalAmount || 0).toLocaleString() }}</div>
            <div class="stat-label">转账总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card approved">
          <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.approved }}</div>
            <div class="stat-label">已确认 / ¥{{ (stats.approvedAmount || 0).toLocaleString() }}</div>
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
    </el-row>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="审核状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable @change="handleSearch">
            <el-option label="待审核" value="pending" />
            <el-option label="已确认" value="approved" />
            <el-option label="已驳回" value="rejected" />
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
          <el-input v-model="filterForm.keyword" placeholder="水单号/合伙人/门店/合同号" style="width: 260px" clearable @keyup.enter="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item style="margin-left: auto">
          <el-button type="primary" @click="handleCreate"><el-icon><Upload /></el-icon>上传水单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="title-icon"><Tickets /></el-icon>
            对公转账水单管理
          </span>
          <el-button text @click="loadList"><el-icon><Refresh /></el-icon>刷新</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="transferNo" label="水单编号" width="160" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.transferNo }}</span></template>
        </el-table-column>
        <el-table-column prop="contractNo" label="合同号" width="140" align="center">
          <template #default="{ row }"><span class="mono-text">{{ row.contractNo }}</span></template>
        </el-table-column>
        <el-table-column prop="partnerName" label="合伙人" width="90" align="center" />
        <el-table-column prop="storeName" label="门店名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="levelName" label="等级" width="100" align="center" />
        <el-table-column label="转账金额" width="120" align="right">
          <template #default="{ row }"><span class="money-text">¥{{ Number(row.transferAmount).toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="transferDate" label="转账日期" width="110" align="center" />
        <el-table-column label="微信零钱包" min-width="160">
          <template #default="{ row }">
            <div class="wechat-cell">
              <el-icon style="color: #07c160"><Wallet /></el-icon>
              <div class="wechat-info">
                <div class="mono-text">{{ row.wechatWalletNo || '-' }}</div>
                <div class="wechat-name">{{ row.wechatWalletName || '' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="关联分账" width="150" align="center">
          <template #default="{ row }">
            <span v-if="row.settlementRecordNo" class="mono-text link-text" @click="goSettlement(row)">
              {{ row.settlementRecordNo }}
            </span>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning" effect="light">待审核</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success" effect="light">已确认</el-tag>
            <el-tag v-else-if="row.status === 'rejected'" type="danger" effect="light">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="success" link @click="handleApprove(row)">
              <el-icon><CircleCheck /></el-icon>确认分账
            </el-button>
            <el-button v-if="row.status === 'pending'" type="danger" link @click="handleReject(row)">
              <el-icon><Close /></el-icon>驳回
            </el-button>
            <el-button v-if="row.status === 'pending'" type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button v-if="row.status === 'pending'" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
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

    <el-dialog v-model="formVisible" :title="formMode === 'create' ? '上传对公转账水单' : '编辑水单'" width="820px" :close-on-click-modal="false">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="130px" class="dialog-form">
        <div class="section-title">
          <el-icon><OfficeBuilding /></el-icon>基本信息
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合伙人姓名" prop="partnerName">
              <el-input v-model="formData.partnerName" placeholder="请输入合伙人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合伙人电话" prop="partnerPhone">
              <el-input v-model="formData.partnerPhone" placeholder="请输入合伙人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="门店名称" prop="storeName">
              <el-input v-model="formData.storeName" placeholder="请输入门店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="门店编号" prop="storeNo">
              <el-input v-model="formData.storeNo" placeholder="请输入门店编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="formData.contractNo" placeholder="请输入合同编号" />
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

        <div class="section-title">
          <el-icon><Coin /></el-icon>转账信息
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="转账金额(元)" prop="transferAmount">
              <el-input-number v-model="formData.transferAmount" :min="0" :precision="2" style="width: 100%" placeholder="请输入转账金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转账日期" prop="transferDate">
              <el-date-picker
                v-model="formData.transferDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择转账日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="付款方银行" prop="payerBank">
              <el-input v-model="formData.payerBank" placeholder="如：中国工商银行深圳南山支行" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款方账号" prop="payerAccount">
              <el-input v-model="formData.payerAccount" placeholder="请输入付款方银行账号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收款方银行" prop="payeeBank">
              <el-input v-model="formData.payeeBank" placeholder="如：中国农业银行总行营业部" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款方账号" prop="payeeAccount">
              <el-input v-model="formData.payeeAccount" placeholder="请输入收款方银行账号" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">
          <el-icon><Picture /></el-icon>水单凭证
        </div>
        <el-form-item label="上传水单" prop="receiptUrl">
          <el-upload
            class="receipt-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/*,.pdf"
          >
            <div v-if="formData.receiptUrl" class="receipt-preview">
              <el-image :src="formData.receiptUrl" fit="contain" class="receipt-image" />
              <div class="receipt-overlay">
                <el-icon><Refresh /></el-icon>
                <span>更换</span>
              </div>
            </div>
            <div v-else class="receipt-upload-placeholder">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">点击上传水单</div>
              <div class="upload-tip">支持 JPG / PNG / PDF 格式</div>
            </div>
          </el-upload>
        </el-form-item>

        <div class="section-title">
          <el-icon><Wallet /></el-icon>微信零钱包（分账到账）
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信零钱包号" prop="wechatWalletNo">
              <el-input v-model="formData.wechatWalletNo" placeholder="请输入微信零钱包号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信零钱包户名" prop="wechatWalletName">
              <el-input v-model="formData.wechatWalletName" placeholder="请输入户名（真实姓名）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="选填，备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitForm">{{ formMode === 'create' ? '确认上传' : '保存修改' }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveVisible" title="审核确认 - 自动分账到微信零钱包" width="680px" :close-on-click-modal="false">
      <div v-if="approveRow" class="approve-info">
        <el-alert
          title="审核通过后将自动按该加盟商等级对应的分账规则执行分账，并将款项划转至该微信零钱包"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        />
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="水单号"><span class="mono-text">{{ approveRow.transferNo }}</span></el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ approveRow.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ approveRow.storeName }}</el-descriptions-item>
          <el-descriptions-item label="加盟等级">{{ approveRow.levelName }}</el-descriptions-item>
          <el-descriptions-item label="转账金额">
            <span style="color: #f56c6c; font-weight: 700">¥{{ Number(approveRow.transferAmount).toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="微信零钱包">
            <el-icon style="color: #07c160"><Wallet /></el-icon>
            <span class="mono-text" style="margin-left: 4px">{{ approveRow.wechatWalletNo }}</span>
            <span style="color: #909399; margin-left: 6px">{{ approveRow.wechatWalletName }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="approveForm" :rules="approveRules" ref="approveFormRef" label-width="100px" class="dialog-form" style="margin-top: 16px">
        <el-form-item label="审核人" prop="auditor">
          <el-input v-model="approveForm.auditor" placeholder="请输入审核人姓名" />
        </el-form-item>
        <el-form-item label="审核意见" prop="auditOpinion">
          <el-input v-model="approveForm.auditOpinion" type="textarea" :rows="3" placeholder="请输入审核意见（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="success" :loading="submitting" @click="handleSubmitApprove">
          <el-icon><Check /></el-icon>确认审核并自动分账
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="驳回水单" width="560px" :close-on-click-modal="false">
      <div v-if="rejectRow" class="reject-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="水单号"><span class="mono-text">{{ rejectRow.transferNo }}</span></el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ rejectRow.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="转账金额">¥{{ Number(rejectRow.transferAmount).toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="门店">{{ rejectRow.storeName }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="100px" class="dialog-form" style="margin-top: 16px">
        <el-form-item label="驳回人" prop="auditor">
          <el-input v-model="rejectForm.auditor" placeholder="请输入驳回人姓名" />
        </el-form-item>
        <el-form-item label="驳回原因" prop="auditOpinion">
          <el-input v-model="rejectForm.auditOpinion" type="textarea" :rows="3" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="handleSubmitReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="水单详情" width="820px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="水单编号"><span class="mono-text">{{ currentDetail.transferNo }}</span></el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="currentDetail.status === 'pending'" type="warning" effect="light">待审核</el-tag>
            <el-tag v-else-if="currentDetail.status === 'approved'" type="success" effect="light">已确认</el-tag>
            <el-tag v-else-if="currentDetail.status === 'rejected'" type="danger" effect="light">已驳回</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="合伙人">{{ currentDetail.partnerName }}</el-descriptions-item>
          <el-descriptions-item label="合伙人电话">{{ currentDetail.partnerPhone }}</el-descriptions-item>
          <el-descriptions-item label="门店名称">{{ currentDetail.storeName }}</el-descriptions-item>
          <el-descriptions-item label="门店编号"><span class="mono-text">{{ currentDetail.storeNo }}</span></el-descriptions-item>
          <el-descriptions-item label="合同编号"><span class="mono-text">{{ currentDetail.contractNo }}</span></el-descriptions-item>
          <el-descriptions-item label="加盟等级">{{ currentDetail.levelName }}</el-descriptions-item>
          <el-descriptions-item label="转账金额">
            <span style="font-size: 18px; font-weight: 700; color: #303133">¥{{ Number(currentDetail.transferAmount).toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="转账日期">{{ currentDetail.transferDate }}</el-descriptions-item>
          <el-descriptions-item label="付款方银行" :span="2">{{ currentDetail.payerBank }}</el-descriptions-item>
          <el-descriptions-item label="付款方账号"><span class="mono-text">{{ currentDetail.payerAccount }}</span></el-descriptions-item>
          <el-descriptions-item label="收款方银行">{{ currentDetail.payeeBank }}</el-descriptions-item>
          <el-descriptions-item label="收款方账号"><span class="mono-text">{{ currentDetail.payeeAccount }}</span></el-descriptions-item>
          <el-descriptions-item label="微信零钱包号" :span="2">
            <el-icon style="color: #07c160"><Wallet /></el-icon>
            <span class="mono-text" style="margin-left: 4px">{{ currentDetail.wechatWalletNo }}</span>
            <span style="color: #909399; margin-left: 8px">户名：{{ currentDetail.wechatWalletName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="水单凭证" :span="2">
            <el-image
              v-if="currentDetail.receiptUrl"
              :src="currentDetail.receiptUrl"
              fit="contain"
              style="max-width: 360px; max-height: 220px; border-radius: 6px; border: 1px solid #ebeef5"
              :preview-src-list="[currentDetail.receiptUrl]"
              :initial-index="0"
            />
            <span v-else style="color: #c0c4cc">暂无</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'approved'" label="审核人">{{ currentDetail.auditor }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'approved'" label="审核时间">{{ currentDetail.auditTime }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'approved'" label="分账流水号" :span="2">
            <span class="mono-text link-text" @click="goSettlement(currentDetail)">{{ currentDetail.settlementRecordNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'approved'" label="审核意见" :span="2">{{ currentDetail.auditOpinion || '无' }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'rejected'" label="驳回人">{{ currentDetail.auditor }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'rejected'" label="驳回时间">{{ currentDetail.auditTime }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.status === 'rejected'" label="驳回原因" :span="2">
            <span style="color: #f56c6c">{{ currentDetail.auditOpinion }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentDetail.status === 'approved'" class="settlement-flow">
          <div class="flow-title">
            <el-icon><Share /></el-icon>
            分账流向（自动分账至微信零钱包）
          </div>
          <div class="flow-steps">
            <div class="flow-step">
              <div class="step-icon bank"><el-icon><OfficeBuilding /></el-icon></div>
              <div class="step-info">
                <div class="step-label">对公转账</div>
                <div class="step-value">¥{{ Number(currentDetail.transferAmount).toLocaleString() }}</div>
              </div>
            </div>
            <div class="flow-arrow"><el-icon><ArrowRight /></el-icon></div>
            <div class="flow-step">
              <div class="step-icon confirm"><el-icon><CircleCheck /></el-icon></div>
              <div class="step-info">
                <div class="step-label">审核确认</div>
                <div class="step-value">{{ currentDetail.auditTime }}</div>
              </div>
            </div>
            <div class="flow-arrow"><el-icon><ArrowRight /></el-icon></div>
            <div class="flow-step">
              <div class="step-icon wechat"><el-icon><Wallet /></el-icon></div>
              <div class="step-info">
                <div class="step-label">微信零钱包</div>
                <div class="step-value wechat-amount">自动分账到账</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Document, Clock, CircleCheck, Coin, Wallet, Search, Refresh, Upload,
  Tickets, View, Close, Edit, Delete, Picture, Check, ArrowRight, OfficeBuilding, Share
} from '@element-plus/icons-vue';
import {
  getBankTransferList,
  getBankTransferStatistics,
  getBankTransferDetail,
  createBankTransfer,
  updateBankTransfer,
  deleteBankTransfer,
  approveBankTransfer,
  rejectBankTransfer
} from '../api/bankTransfer.js';

const router = useRouter();

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const stats = ref({
  total: 0, pending: 0, approved: 0, rejected: 0,
  totalAmount: 0, approvedAmount: 0, pendingAmount: 0
});

const filterForm = reactive({
  status: '',
  keyword: '',
  dateRange: []
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const formVisible = ref(false);
const approveVisible = ref(false);
const rejectVisible = ref(false);
const detailVisible = ref(false);
const formMode = ref('create');
const currentEditId = ref(null);

const formRef = ref(null);
const approveFormRef = ref(null);
const rejectFormRef = ref(null);

const approveRow = ref(null);
const rejectRow = ref(null);
const currentDetail = ref(null);

const getDefaultForm = () => ({
  partnerName: '',
  partnerPhone: '',
  storeName: '',
  storeNo: '',
  contractNo: '',
  levelName: '',
  transferAmount: null,
  transferDate: '',
  payerBank: '',
  payerAccount: '',
  payeeBank: '',
  payeeAccount: '',
  receiptUrl: '',
  wechatWalletNo: '',
  wechatWalletName: '',
  remark: ''
});

const formData = reactive(getDefaultForm());

const formRules = {
  partnerName: [{ required: true, message: '请输入合伙人姓名', trigger: 'blur' }],
  storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
  contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
  levelName: [{ required: true, message: '请选择加盟等级', trigger: 'change' }],
  transferAmount: [{ required: true, message: '请输入转账金额', trigger: 'blur' }],
  transferDate: [{ required: true, message: '请选择转账日期', trigger: 'change' }],
  payerBank: [{ required: true, message: '请输入付款方银行', trigger: 'blur' }],
  payerAccount: [{ required: true, message: '请输入付款方账号', trigger: 'blur' }],
  receiptUrl: [{ required: true, message: '请上传水单凭证', trigger: 'change' }],
  wechatWalletNo: [{ required: true, message: '请输入微信零钱包号', trigger: 'blur' }],
  wechatWalletName: [{ required: true, message: '请输入微信零钱包户名', trigger: 'blur' }]
};

const approveForm = reactive({ auditor: '', auditOpinion: '' });
const approveRules = {
  auditor: [{ required: true, message: '请输入审核人', trigger: 'blur' }]
};

const rejectForm = reactive({ auditor: '', auditOpinion: '' });
const rejectRules = {
  auditor: [{ required: true, message: '请输入驳回人', trigger: 'blur' }],
  auditOpinion: [{ required: true, message: '请输入驳回原因', trigger: 'blur' }]
};

const loadStats = async () => {
  try {
    stats.value = await getBankTransferStatistics();
  } catch (e) {
    console.error('加载统计失败', e);
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
    if (filterForm.keyword) params.keyword = filterForm.keyword;
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startDate = filterForm.dateRange[0];
      params.endDate = filterForm.dateRange[1];
    }
    const result = await getBankTransferList(params);
    tableData.value = result.list;
    pagination.total = result.total;
  } catch (e) {
    ElMessage.error(e.message || '加载水单列表失败');
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

const handleFileChange = (file) => {
  if (file && file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.receiptUrl = e.target.result;
    };
    reader.readAsDataURL(file.raw);
  }
};

const handleCreate = () => {
  formMode.value = 'create';
  currentEditId.value = null;
  Object.assign(formData, getDefaultForm());
  formVisible.value = true;
};

const handleEdit = (row) => {
  formMode.value = 'edit';
  currentEditId.value = row.id;
  Object.assign(formData, getDefaultForm());
  Object.assign(formData, {
    partnerName: row.partnerName,
    partnerPhone: row.partnerPhone,
    storeName: row.storeName,
    storeNo: row.storeNo,
    contractNo: row.contractNo,
    levelName: row.levelName,
    transferAmount: row.transferAmount,
    transferDate: row.transferDate,
    payerBank: row.payerBank,
    payerAccount: row.payerAccount,
    payeeBank: row.payeeBank,
    payeeAccount: row.payeeAccount,
    receiptUrl: row.receiptUrl,
    wechatWalletNo: row.wechatWalletNo,
    wechatWalletName: row.wechatWalletName,
    remark: row.remark
  });
  formVisible.value = true;
};

const handleSubmitForm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    if (formMode.value === 'create') {
      await createBankTransfer({ ...formData });
      ElMessage.success('水单上传成功，等待财务审核');
    } else {
      await updateBankTransfer(currentEditId.value, { ...formData });
      ElMessage.success('水单修改成功');
    }
    formVisible.value = false;
    loadList();
    loadStats();
  } catch (e) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除水单 ${row.transferNo}？该操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    );
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await deleteBankTransfer(row.id);
    ElMessage.success('删除成功');
    loadList();
    loadStats();
  } catch (e) {
    ElMessage.error(e.message || '删除失败');
  } finally {
    submitting.value = false;
  }
};

const handleApprove = (row) => {
  approveRow.value = row;
  approveForm.auditor = '';
  approveForm.auditOpinion = '';
  approveVisible.value = true;
};

const handleSubmitApprove = async () => {
  if (!approveFormRef.value) return;
  try {
    await approveFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    const result = await approveBankTransfer(approveRow.value.id, { ...approveForm });
    ElMessage.success(`审核通过，已自动分账至微信零钱包（分账流水号：${result.settlement.recordNo}）`);
    approveVisible.value = false;
    loadList();
    loadStats();
  } catch (e) {
    ElMessage.error(e.message || '审核失败');
  } finally {
    submitting.value = false;
  }
};

const handleReject = (row) => {
  rejectRow.value = row;
  rejectForm.auditor = '';
  rejectForm.auditOpinion = '';
  rejectVisible.value = true;
};

const handleSubmitReject = async () => {
  if (!rejectFormRef.value) return;
  try {
    await rejectFormRef.value.validate();
  } catch (e) {
    return;
  }
  submitting.value = true;
  try {
    await rejectBankTransfer(rejectRow.value.id, { ...rejectForm });
    ElMessage.success('水单已驳回');
    rejectVisible.value = false;
    loadList();
    loadStats();
  } catch (e) {
    ElMessage.error(e.message || '驳回失败');
  } finally {
    submitting.value = false;
  }
};

const handleView = async (row) => {
  try {
    currentDetail.value = await getBankTransferDetail(row.id);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error(e.message || '加载详情失败');
  }
};

const goSettlement = (row) => {
  router.push('/settlement');
};

onMounted(() => {
  loadStats();
  loadList();
});
</script>

<style scoped>
.bank-transfer-manage {
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
.stat-card.approved .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-card.amount .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

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
  font-size: 13px;
  font-weight: 600;
  color: #f56c6c;
}

.wechat-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wechat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wechat-name {
  font-size: 11px;
  color: #909399;
}

.link-text {
  color: #3b82f6;
  cursor: pointer;
  font-weight: 600;
}

.link-text:hover {
  text-decoration: underline;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-form { padding: 4px 8px; }

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #ebeef5;
}

.section-title:first-of-type {
  margin-top: 0;
}

.receipt-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.receipt-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.receipt-upload-placeholder {
  width: 260px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8c939d;
}

.upload-icon { font-size: 32px; color: #c0c4cc; }
.upload-text { font-size: 14px; }
.upload-tip { font-size: 12px; color: #c0c4cc; }

.receipt-preview {
  width: 260px;
  height: 160px;
  position: relative;
}

.receipt-image {
  width: 100%;
  height: 100%;
}

.receipt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
}

.receipt-preview:hover .receipt-overlay {
  opacity: 1;
}

.approve-info, .reject-info { padding: 0 8px; }

.detail-content { padding: 4px 0; }

.settlement-flow {
  margin-top: 20px;
  padding: 16px 20px;
  background: #f0f9eb;
  border-radius: 10px;
  border: 1px solid #e1f3d8;
}

.flow-title {
  font-size: 14px;
  font-weight: 600;
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.flow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.step-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.step-icon.bank { background: linear-gradient(135deg, #3b82f6, #1e3a8a); }
.step-icon.confirm { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.step-icon.wechat { background: linear-gradient(135deg, #07c160, #2aae67); }

.step-info {
  text-align: center;
}

.step-label {
  font-size: 12px;
  color: #909399;
}

.step-value {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.step-value.wechat-amount {
  color: #07c160;
  font-size: 14px;
}

.flow-arrow {
  font-size: 20px;
  color: #c0c4cc;
}

@media (max-width: 768px) {
  .flow-steps {
    flex-direction: column;
  }
  .flow-arrow {
    transform: rotate(90deg);
  }
}
</style>
