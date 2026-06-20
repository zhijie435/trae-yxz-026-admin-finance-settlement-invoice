const { formatNow, paginateList, generateId, generateBusinessNo } = require('./utils');
const { getStoreById, getStoreByNo, freezeBalance, unfreezeBalance, deductBalance } = require('./storeService');

const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const WITHDRAWAL_AUDIT_MODE = {
  AUTO: 'auto',
  MANUAL: 'manual'
};

const WITHDRAWAL_TYPE = {
  NORMAL: 'normal',
  URGENT: 'urgent'
};

const STATUS_MAP = {
  [WITHDRAWAL_STATUS.PENDING]: { label: '待审核', type: 'warning' },
  [WITHDRAWAL_STATUS.APPROVED]: { label: '审核通过', type: 'primary' },
  [WITHDRAWAL_STATUS.REJECTED]: { label: '已拒绝', type: 'danger' },
  [WITHDRAWAL_STATUS.PAID]: { label: '已打款', type: 'success' },
  [WITHDRAWAL_STATUS.FAILED]: { label: '打款失败', type: 'danger' },
  [WITHDRAWAL_STATUS.CANCELLED]: { label: '已取消', type: 'info' }
};

const AUDIT_MODE_MAP = {
  [WITHDRAWAL_AUDIT_MODE.AUTO]: { label: '自动审核', type: 'success' },
  [WITHDRAWAL_AUDIT_MODE.MANUAL]: { label: '人工审核', type: 'warning' }
};

const TYPE_MAP = {
  [WITHDRAWAL_TYPE.NORMAL]: { label: '普通提现', type: 'info' },
  [WITHDRAWAL_TYPE.URGENT]: { label: '加急提现', type: 'danger' }
};

const AUTO_WITHDRAWAL_CONFIG = {
  maxAmount: 50000,
  minAmount: 100,
  dailyLimit: 100000,
  monthlyLimit: 500000,
  enabled: true
};

const mockWithdrawals = [
  {
    id: 'WD001',
    withdrawalNo: 'TX202606150001',
    storeId: 'ST001',
    storeNo: 'MD2026010001',
    storeName: '北京朝阳旗舰店',
    partnerName: '张伟',
    partnerPhone: '13800138001',
    amount: 20000,
    fee: 0,
    actualAmount: 20000,
    type: WITHDRAWAL_TYPE.NORMAL,
    auditMode: WITHDRAWAL_AUDIT_MODE.AUTO,
    status: WITHDRAWAL_STATUS.PAID,
    bankName: '中国工商银行',
    bankAccount: '6222 **** **** 8888',
    bankAccountName: '张伟',
    applyTime: '2026-06-15 10:30:00',
    auditTime: '2026-06-15 10:30:05',
    payTime: '2026-06-15 10:32:00',
    auditor: '系统',
    auditRemark: '自动审核通过',
    payRemark: '已转账至银行卡',
    remark: '6月上半月分账提现'
  },
  {
    id: 'WD002',
    withdrawalNo: 'TX202606160002',
    storeId: 'ST002',
    storeNo: 'MD2026010002',
    storeName: '上海浦东体验店',
    partnerName: '李娜',
    partnerPhone: '13900139002',
    amount: 15000,
    fee: 0,
    actualAmount: 15000,
    type: WITHDRAWAL_TYPE.NORMAL,
    auditMode: WITHDRAWAL_AUDIT_MODE.AUTO,
    status: WITHDRAWAL_STATUS.PAID,
    bankName: '中国建设银行',
    bankAccount: '6227 **** **** 6666',
    bankAccountName: '李娜',
    applyTime: '2026-06-16 09:15:00',
    auditTime: '2026-06-16 09:15:03',
    payTime: '2026-06-16 09:20:00',
    auditor: '系统',
    auditRemark: '自动审核通过',
    payRemark: '已转账至银行卡',
    remark: ''
  },
  {
    id: 'WD003',
    withdrawalNo: 'TX202606180003',
    storeId: 'ST003',
    storeNo: 'MD2026020003',
    storeName: '杭州西湖形象店',
    partnerName: '陈静',
    partnerPhone: '13400134006',
    amount: 8000,
    fee: 10,
    actualAmount: 7990,
    type: WITHDRAWAL_TYPE.URGENT,
    auditMode: WITHDRAWAL_AUDIT_MODE.MANUAL,
    status: WITHDRAWAL_STATUS.PENDING,
    bankName: '招商银行',
    bankAccount: '6225 **** **** 3333',
    bankAccountName: '陈静',
    applyTime: '2026-06-18 14:20:00',
    auditTime: '',
    payTime: '',
    auditor: '',
    auditRemark: '',
    payRemark: '',
    remark: '加急提现，需尽快处理'
  },
  {
    id: 'WD004',
    withdrawalNo: 'TX202606190004',
    storeId: 'ST006',
    storeNo: 'MD2026060004',
    storeName: '深圳南山旗舰店',
    partnerName: '赵六',
    partnerPhone: '13600136004',
    amount: 50000,
    fee: 0,
    actualAmount: 50000,
    type: WITHDRAWAL_TYPE.NORMAL,
    auditMode: WITHDRAWAL_AUDIT_MODE.AUTO,
    status: WITHDRAWAL_STATUS.PAID,
    bankName: '招商银行深圳分行',
    bankAccount: '6225 **** **** 1234',
    bankAccountName: '赵六',
    applyTime: '2026-06-19 11:00:00',
    auditTime: '2026-06-19 11:00:08',
    payTime: '2026-06-19 11:05:00',
    auditor: '系统',
    auditRemark: '自动审核通过',
    payRemark: '已转账至银行卡',
    remark: '首次提现'
  },
  {
    id: 'WD005',
    withdrawalNo: 'TX202606200005',
    storeId: 'ST002',
    storeNo: 'MD2026010002',
    storeName: '上海浦东体验店',
    partnerName: '李娜',
    partnerPhone: '13900139002',
    amount: 30000,
    fee: 0,
    actualAmount: 30000,
    type: WITHDRAWAL_TYPE.NORMAL,
    auditMode: WITHDRAWAL_AUDIT_MODE.MANUAL,
    status: WITHDRAWAL_STATUS.PENDING,
    bankName: '中国建设银行',
    bankAccount: '6227 **** **** 6666',
    bankAccountName: '李娜',
    applyTime: '2026-06-20 08:30:00',
    auditTime: '',
    payTime: '',
    auditor: '',
    auditRemark: '',
    payRemark: '',
    remark: '月度结算提现'
  },
  {
    id: 'WD006',
    withdrawalNo: 'TX202606170006',
    storeId: 'ST005',
    storeNo: 'MD2026030005',
    storeName: '深圳南山社区店',
    partnerName: '赵敏',
    partnerPhone: '13600136004',
    amount: 5000,
    fee: 0,
    actualAmount: 5000,
    type: WITHDRAWAL_TYPE.NORMAL,
    auditMode: WITHDRAWAL_AUDIT_MODE.AUTO,
    status: WITHDRAWAL_STATUS.REJECTED,
    bankName: '交通银行',
    bankAccount: '6222 **** **** 7777',
    bankAccountName: '赵敏',
    applyTime: '2026-06-17 16:45:00',
    auditTime: '2026-06-17 17:00:00',
    payTime: '',
    auditor: '财务-王经理',
    auditRemark: '银行账户信息有误，请核对后重新申请',
    payRemark: '',
    remark: ''
  },
  {
    id: 'WD007',
    withdrawalNo: 'TX202606190007',
    storeId: 'ST007',
    storeNo: 'MD2026060007',
    storeName: '武汉江汉标准店',
    partnerName: '周九',
    partnerPhone: '13300133007',
    amount: 2000,
    fee: 0,
    actualAmount: 2000,
    type: WITHDRAWAL_TYPE.NORMAL,
    auditMode: WITHDRAWAL_AUDIT_MODE.AUTO,
    status: WITHDRAWAL_STATUS.FAILED,
    bankName: '中国工商银行武汉分行',
    bankAccount: '6222 **** **** 5678',
    bankAccountName: '周九',
    applyTime: '2026-06-19 13:20:00',
    auditTime: '2026-06-19 13:20:05',
    payTime: '2026-06-19 13:25:00',
    auditor: '系统',
    auditRemark: '自动审核通过',
    payRemark: '银行返回账户状态异常',
    remark: '打款失败，待重新处理'
  }
];

let withdrawals = JSON.parse(JSON.stringify(mockWithdrawals));
let nextWithdrawalCounter = 8;

const formatWithdrawal = (withdrawal) => ({
  ...withdrawal,
  statusText: (STATUS_MAP[withdrawal.status] || {}).label || '未知',
  statusType: (STATUS_MAP[withdrawal.status] || {}).type || 'info',
  auditModeText: (AUDIT_MODE_MAP[withdrawal.auditMode] || {}).label || '未知',
  auditModeType: (AUDIT_MODE_MAP[withdrawal.auditMode] || {}).type || 'info',
  typeText: (TYPE_MAP[withdrawal.type] || {}).label || '未知',
  typeType: (TYPE_MAP[withdrawal.type] || {}).type || 'info'
});

const getTodayWithdrawalAmount = (storeId) => {
  const today = formatNow().substring(0, 10);
  return withdrawals
    .filter(w => 
      w.storeId === String(storeId) &&
      w.applyTime.substring(0, 10) === today &&
      [WITHDRAWAL_STATUS.PENDING, WITHDRAWAL_STATUS.APPROVED, WITHDRAWAL_STATUS.PAID].includes(w.status)
    )
    .reduce((sum, w) => sum + w.amount, 0);
};

const getMonthWithdrawalAmount = (storeId) => {
  const month = formatNow().substring(0, 7);
  return withdrawals
    .filter(w => 
      w.storeId === String(storeId) &&
      w.applyTime.substring(0, 7) === month &&
      [WITHDRAWAL_STATUS.PAID].includes(w.status)
    )
    .reduce((sum, w) => sum + w.amount, 0);
};

const canAutoWithdraw = (storeId, amount) => {
  if (!AUTO_WITHDRAWAL_CONFIG.enabled) return false;
  
  const amt = Number(amount);
  if (amt < AUTO_WITHDRAWAL_CONFIG.minAmount) return false;
  if (amt > AUTO_WITHDRAWAL_CONFIG.maxAmount) return false;
  
  const todayAmount = getTodayWithdrawalAmount(storeId);
  if (todayAmount + amt > AUTO_WITHDRAWAL_CONFIG.dailyLimit) return false;
  
  const monthAmount = getMonthWithdrawalAmount(storeId);
  if (monthAmount + amt > AUTO_WITHDRAWAL_CONFIG.monthlyLimit) return false;
  
  return true;
};

const getWithdrawalList = ({ page = 1, pageSize = 10, status, keyword, storeId, auditMode, type, startDate, endDate } = {}) => {
  let result = [...withdrawals];

  if (status && status !== 'all') {
    result = result.filter(w => w.status === status);
  }

  if (auditMode && auditMode !== 'all') {
    result = result.filter(w => w.auditMode === auditMode);
  }

  if (type && type !== 'all') {
    result = result.filter(w => w.type === type);
  }

  if (storeId) {
    result = result.filter(w => w.storeId === String(storeId));
  }

  if (startDate) {
    result = result.filter(w => w.applyTime >= startDate);
  }

  if (endDate) {
    result = result.filter(w => w.applyTime <= endDate + ' 23:59:59');
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(w =>
      w.withdrawalNo.toLowerCase().includes(kw) ||
      w.storeName.toLowerCase().includes(kw) ||
      w.storeNo.toLowerCase().includes(kw) ||
      w.partnerName.toLowerCase().includes(kw) ||
      w.partnerPhone.includes(kw)
    );
  }

  result.sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime));

  const total = result.length;
  return {
    ...paginateList({ list: result, page, pageSize, total }),
    list: paginateList({ list: result, page, pageSize, total }).list.map(formatWithdrawal)
  };
};

const getWithdrawalById = (id) => {
  const withdrawal = withdrawals.find(w => w.id === String(id));
  return withdrawal ? formatWithdrawal(withdrawal) : null;
};

const getWithdrawalByNo = (withdrawalNo) => {
  const withdrawal = withdrawals.find(w => w.withdrawalNo === String(withdrawalNo));
  return withdrawal ? formatWithdrawal(withdrawal) : null;
};

const createWithdrawal = (payload) => {
  const {
    storeId, amount, type = WITHDRAWAL_TYPE.NORMAL, remark = '',
    bankName, bankAccount, bankAccountName
  } = payload;

  if (!storeId || !amount) {
    throw new Error('门店ID和提现金额不能为空');
  }

  const store = getStoreById(storeId);
  if (!store) {
    throw new Error('门店不存在');
  }

  if (store.status !== 'enabled') {
    throw new Error('门店已被禁用，无法提现');
  }

  const amt = Number(amount);
  if (amt <= 0) {
    throw new Error('提现金额必须大于0');
  }

  if (amt < 100) {
    throw new Error('最低提现金额为100元');
  }

  const availableBalance = store.balance - (store.frozenBalance || 0);
  if (amt > availableBalance) {
    throw new Error('可用余额不足');
  }

  let fee = 0;
  if (type === WITHDRAWAL_TYPE.URGENT) {
    fee = 10;
    if (amt + fee > availableBalance) {
      throw new Error('可用余额不足（含手续费）');
    }
  }

  const auditMode = canAutoWithdraw(storeId, amt) && type === WITHDRAWAL_TYPE.NORMAL
    ? WITHDRAWAL_AUDIT_MODE.AUTO
    : WITHDRAWAL_AUDIT_MODE.MANUAL;

  const newId = generateId('WD', nextWithdrawalCounter++);
  const now = formatNow();
  const withdrawalNo = generateBusinessNo('TX', nextWithdrawalCounter - 1);

  const withdrawal = {
    id: newId,
    withdrawalNo,
    storeId: store.id,
    storeNo: store.storeNo,
    storeName: store.storeName,
    partnerName: store.partnerName,
    partnerPhone: store.partnerPhone,
    amount: amt,
    fee,
    actualAmount: amt - fee,
    type,
    auditMode,
    status: WITHDRAWAL_STATUS.PENDING,
    bankName: bankName || store.bankName || '',
    bankAccount: bankAccount || store.bankAccount || '',
    bankAccountName: bankAccountName || store.bankAccountName || '',
    applyTime: now,
    auditTime: '',
    payTime: '',
    auditor: '',
    auditRemark: '',
    payRemark: '',
    remark
  };

  freezeBalance(storeId, amt);

  withdrawals.unshift(withdrawal);

  if (auditMode === WITHDRAWAL_AUDIT_MODE.AUTO) {
    autoAuditWithdrawal(newId);
  }

  return formatWithdrawal(withdrawal);
};

const autoAuditWithdrawal = (id) => {
  const withdrawal = withdrawals.find(w => w.id === String(id));
  if (!withdrawal) throw new Error('提现记录不存在');

  if (withdrawal.status !== WITHDRAWAL_STATUS.PENDING) {
    throw new Error('当前状态不允许审核');
  }

  const now = formatNow();
  withdrawal.status = WITHDRAWAL_STATUS.APPROVED;
  withdrawal.auditTime = now;
  withdrawal.auditor = '系统';
  withdrawal.auditRemark = '自动审核通过';

  const paySuccess = Math.random() > 0.1;
  if (paySuccess) {
    executePay(withdrawal.id);
  } else {
    withdrawal.status = WITHDRAWAL_STATUS.FAILED;
    withdrawal.payTime = now;
    withdrawal.payRemark = '自动打款失败，请人工处理';
    unfreezeBalance(withdrawal.storeId, withdrawal.amount);
  }

  return formatWithdrawal(withdrawal);
};

const auditWithdrawal = (id, payload) => {
  const withdrawal = withdrawals.find(w => w.id === String(id));
  if (!withdrawal) throw new Error('提现记录不存在');

  if (withdrawal.status !== WITHDRAWAL_STATUS.PENDING) {
    throw new Error('当前状态不允许审核');
  }

  const { status, auditor, auditRemark } = payload;

  if (![WITHDRAWAL_STATUS.APPROVED, WITHDRAWAL_STATUS.REJECTED].includes(status)) {
    throw new Error('无效的审核状态');
  }

  const now = formatNow();
  withdrawal.status = status;
  withdrawal.auditTime = now;
  withdrawal.auditor = auditor || '';
  withdrawal.auditRemark = auditRemark || '';

  if (status === WITHDRAWAL_STATUS.REJECTED) {
    unfreezeBalance(withdrawal.storeId, withdrawal.amount);
  }

  return formatWithdrawal(withdrawal);
};

const executePay = (id) => {
  const withdrawal = withdrawals.find(w => w.id === String(id));
  if (!withdrawal) throw new Error('提现记录不存在');

  if (![WITHDRAWAL_STATUS.APPROVED, WITHDRAWAL_STATUS.FAILED].includes(withdrawal.status)) {
    throw new Error('当前状态不允许打款');
  }

  const now = formatNow();

  try {
    deductBalance(withdrawal.storeId, withdrawal.amount);
    
    withdrawal.status = WITHDRAWAL_STATUS.PAID;
    withdrawal.payTime = now;
    withdrawal.payRemark = '已转账至银行卡';
  } catch (e) {
    withdrawal.status = WITHDRAWAL_STATUS.FAILED;
    withdrawal.payTime = now;
    withdrawal.payRemark = e.message || '打款失败';
    unfreezeBalance(withdrawal.storeId, withdrawal.amount);
  }

  return formatWithdrawal(withdrawal);
};

const retryPay = (id) => {
  const withdrawal = withdrawals.find(w => w.id === String(id));
  if (!withdrawal) throw new Error('提现记录不存在');

  if (withdrawal.status !== WITHDRAWAL_STATUS.FAILED) {
    throw new Error('只有打款失败的记录才能重试');
  }

  freezeBalance(withdrawal.storeId, withdrawal.amount);
  withdrawal.status = WITHDRAWAL_STATUS.APPROVED;

  return executePay(id);
};

const cancelWithdrawal = (id) => {
  const withdrawal = withdrawals.find(w => w.id === String(id));
  if (!withdrawal) throw new Error('提现记录不存在');

  if (![WITHDRAWAL_STATUS.PENDING, WITHDRAWAL_STATUS.FAILED].includes(withdrawal.status)) {
    throw new Error('当前状态不允许取消');
  }

  const now = formatNow();
  withdrawal.status = WITHDRAWAL_STATUS.CANCELLED;
  withdrawal.cancelTime = now;

  if ([WITHDRAWAL_STATUS.PENDING].includes(withdrawal.status)) {
    unfreezeBalance(withdrawal.storeId, withdrawal.amount);
  }

  return formatWithdrawal(withdrawal);
};

const getWithdrawalStatistics = ({ storeId } = {}) => {
  let list = withdrawals;
  
  if (storeId) {
    list = list.filter(w => w.storeId === String(storeId));
  }

  const total = list.length;
  const pending = list.filter(w => w.status === WITHDRAWAL_STATUS.PENDING).length;
  const approved = list.filter(w => w.status === WITHDRAWAL_STATUS.APPROVED).length;
  const paid = list.filter(w => w.status === WITHDRAWAL_STATUS.PAID).length;
  const rejected = list.filter(w => w.status === WITHDRAWAL_STATUS.REJECTED).length;
  const failed = list.filter(w => w.status === WITHDRAWAL_STATUS.FAILED).length;
  const cancelled = list.filter(w => w.status === WITHDRAWAL_STATUS.CANCELLED).length;
  
  const totalAmount = list.reduce((sum, w) => sum + w.amount, 0);
  const paidAmount = list
    .filter(w => w.status === WITHDRAWAL_STATUS.PAID)
    .reduce((sum, w) => sum + w.amount, 0);
  const pendingAmount = list
    .filter(w => [WITHDRAWAL_STATUS.PENDING, WITHDRAWAL_STATUS.APPROVED].includes(w.status))
    .reduce((sum, w) => sum + w.amount, 0);
  const feeTotal = list
    .filter(w => w.status === WITHDRAWAL_STATUS.PAID)
    .reduce((sum, w) => sum + w.fee, 0);

  return {
    total, pending, approved, paid, rejected, failed, cancelled,
    totalAmount, paidAmount, pendingAmount, feeTotal,
    autoConfig: AUTO_WITHDRAWAL_CONFIG
  };
};

const getAutoWithdrawalConfig = () => {
  return { ...AUTO_WITHDRAWAL_CONFIG };
};

const updateAutoWithdrawalConfig = (config) => {
  if (config.maxAmount != null) AUTO_WITHDRAWAL_CONFIG.maxAmount = Number(config.maxAmount);
  if (config.minAmount != null) AUTO_WITHDRAWAL_CONFIG.minAmount = Number(config.minAmount);
  if (config.dailyLimit != null) AUTO_WITHDRAWAL_CONFIG.dailyLimit = Number(config.dailyLimit);
  if (config.monthlyLimit != null) AUTO_WITHDRAWAL_CONFIG.monthlyLimit = Number(config.monthlyLimit);
  if (config.enabled != null) AUTO_WITHDRAWAL_CONFIG.enabled = Boolean(config.enabled);
  return { ...AUTO_WITHDRAWAL_CONFIG };
};

module.exports = {
  WITHDRAWAL_STATUS,
  WITHDRAWAL_AUDIT_MODE,
  WITHDRAWAL_TYPE,
  STATUS_MAP,
  AUDIT_MODE_MAP,
  TYPE_MAP,
  getWithdrawalList,
  getWithdrawalById,
  getWithdrawalByNo,
  createWithdrawal,
  auditWithdrawal,
  executePay,
  retryPay,
  cancelWithdrawal,
  getWithdrawalStatistics,
  getAutoWithdrawalConfig,
  updateAutoWithdrawalConfig
};