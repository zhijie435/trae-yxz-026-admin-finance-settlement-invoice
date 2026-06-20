const { formatNow, generateId, generateBusinessNo, paginateList } = require('./utils');
const {
  createSettlementRecord,
  executeSettlement,
  getSettlementRuleByLevel,
  SETTLEMENT_RECORD_STATUS
} = require('./settlementService');

const TRANSFER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const TRANSFER_STATUS_MAP = {
  [TRANSFER_STATUS.PENDING]: { label: '待审核', type: 'warning' },
  [TRANSFER_STATUS.APPROVED]: { label: '已确认', type: 'success' },
  [TRANSFER_STATUS.REJECTED]: { label: '已驳回', type: 'danger' }
};

let bankTransferCounter = 6;
const mockBankTransfers = [
  {
    id: 'BT001',
    transferNo: 'SD2026060001',
    contractNo: 'HT2026060004',
    storeNo: 'MD2026060004',
    storeName: '深圳南山旗舰店',
    partnerName: '赵六',
    partnerPhone: '13600136004',
    levelName: '金牌加盟商',
    transferAmount: 58000,
    transferDate: '2026-06-15',
    payerAccount: '622202********1234',
    payerBank: '中国工商银行深圳南山支行',
    payeeAccount: '622848********5678',
    payeeBank: '中国农业银行总行营业部',
    receiptUrl: '/uploads/receipts/sd2026060001.jpg',
    wechatWalletNo: 'oABC1234567890',
    wechatWalletName: '赵六',
    settlementRecordNo: 'LZ2026060001',
    status: TRANSFER_STATUS.APPROVED,
    remark: '6月上半月对公转账',
    auditor: '财务-李经理',
    auditTime: '2026-06-15 14:30:00',
    auditOpinion: '水单信息核对无误，已自动分账至微信零钱包',
    createTime: '2026-06-15 10:00:00',
    updateTime: '2026-06-15 14:30:00'
  },
  {
    id: 'BT002',
    transferNo: 'SD2026060002',
    contractNo: 'HT2026060002',
    storeNo: 'MD2026010002',
    storeName: '上海浦东体验店',
    partnerName: '李四',
    partnerPhone: '13900139002',
    levelName: '银牌加盟商',
    transferAmount: 42000,
    transferDate: '2026-06-15',
    payerAccount: '621700********8765',
    payerBank: '中国建设银行上海浦东分行',
    payeeAccount: '622848********5678',
    payeeBank: '中国农业银行总行营业部',
    receiptUrl: '/uploads/receipts/sd2026060002.jpg',
    wechatWalletNo: 'oDEF0987654321',
    wechatWalletName: '李四',
    settlementRecordNo: 'LZ2026060002',
    status: TRANSFER_STATUS.APPROVED,
    remark: '',
    auditor: '财务-王会计',
    auditTime: '2026-06-15 15:20:00',
    auditOpinion: '审核通过，已完成分账',
    createTime: '2026-06-15 11:30:00',
    updateTime: '2026-06-15 15:20:00'
  },
  {
    id: 'BT003',
    transferNo: 'SD2026060003',
    contractNo: 'HT2026060007',
    storeNo: 'MD2026060007',
    storeName: '武汉江汉标准店',
    partnerName: '周九',
    partnerPhone: '13300133007',
    levelName: '标准加盟商',
    transferAmount: 28000,
    transferDate: '2026-06-18',
    payerAccount: '622588********4321',
    payerBank: '招商银行武汉江汉支行',
    payeeAccount: '622848********5678',
    payeeBank: '中国农业银行总行营业部',
    receiptUrl: '/uploads/receipts/sd2026060003.jpg',
    wechatWalletNo: 'oGHI1122334455',
    wechatWalletName: '周九',
    settlementRecordNo: '',
    status: TRANSFER_STATUS.PENDING,
    remark: '6月中旬转账，水单已上传',
    auditor: '',
    auditTime: '',
    auditOpinion: '',
    createTime: '2026-06-18 09:45:00',
    updateTime: '2026-06-18 09:45:00'
  },
  {
    id: 'BT004',
    transferNo: 'SD2026060004',
    contractNo: 'HT2026060008',
    storeNo: 'MD2026060008',
    storeName: '南京鼓楼标准店',
    partnerName: '吴十',
    partnerPhone: '13200132008',
    levelName: '标准加盟商',
    transferAmount: 35000,
    transferDate: '2026-06-19',
    payerAccount: '622622********9876',
    payerBank: '民生银行南京鼓楼支行',
    payeeAccount: '622848********5678',
    payeeBank: '中国农业银行总行营业部',
    receiptUrl: '/uploads/receipts/sd2026060004.jpg',
    wechatWalletNo: 'oJKL6677889900',
    wechatWalletName: '吴十',
    settlementRecordNo: '',
    status: TRANSFER_STATUS.REJECTED,
    remark: '',
    auditor: '财务-张总监',
    auditTime: '2026-06-19 16:00:00',
    auditOpinion: '水单图片模糊，无法核实转账信息，请重新上传清晰凭证',
    createTime: '2026-06-19 08:20:00',
    updateTime: '2026-06-19 16:00:00'
  },
  {
    id: 'BT005',
    transferNo: 'SD2026060005',
    contractNo: 'HT2026060005',
    storeNo: 'MD2026020003',
    storeName: '杭州西湖形象店',
    partnerName: '钱七',
    partnerPhone: '13500135005',
    levelName: '银牌加盟商',
    transferAmount: 39000,
    transferDate: '2026-06-20',
    payerAccount: '622908********5432',
    payerBank: '兴业银行杭州西湖支行',
    payeeAccount: '622848********5678',
    payeeBank: '中国农业银行总行营业部',
    receiptUrl: '/uploads/receipts/sd2026060005.jpg',
    wechatWalletNo: 'oMNO2233445566',
    wechatWalletName: '钱七',
    settlementRecordNo: 'LZ202606200007',
    status: TRANSFER_STATUS.APPROVED,
    remark: '',
    auditor: '测试-财务',
    auditTime: '2026-06-20 23:14:38',
    auditOpinion: '功能测试：审核确认水单并自动分账',
    createTime: '2026-06-20 10:15:00',
    updateTime: '2026-06-20 23:14:38'
  }
];

const formatTransfer = (transfer) => ({
  ...transfer,
  statusText: TRANSFER_STATUS_MAP[transfer.status]?.label || transfer.status
});

const getBankTransferList = ({ page = 1, pageSize = 10, status, keyword, startDate, endDate } = {}) => {
  let list = [...mockBankTransfers];

  if (status) {
    list = list.filter(t => t.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(t =>
      t.transferNo.toLowerCase().includes(kw) ||
      t.contractNo.toLowerCase().includes(kw) ||
      t.partnerName.toLowerCase().includes(kw) ||
      t.storeName.toLowerCase().includes(kw)
    );
  }

  if (startDate) {
    list = list.filter(t => t.transferDate >= startDate);
  }
  if (endDate) {
    list = list.filter(t => t.transferDate <= endDate);
  }

  list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  const total = list.length;
  const formatted = list.map(formatTransfer);
  const paginated = paginateList({ list: formatted, page, pageSize, total });

  return paginated;
};

const getBankTransferById = (id) => {
  const transfer = mockBankTransfers.find(t => t.id === id);
  return transfer ? formatTransfer(transfer) : null;
};

const createBankTransfer = (payload) => {
  const now = formatNow();
  const id = generateId('BT', bankTransferCounter);
  bankTransferCounter++;
  const transferNo = generateBusinessNo('SD', bankTransferCounter - 1);

  const newTransfer = {
    id,
    transferNo,
    contractNo: payload.contractNo || '',
    storeNo: payload.storeNo || '',
    storeName: payload.storeName || '',
    partnerName: payload.partnerName || '',
    partnerPhone: payload.partnerPhone || '',
    levelName: payload.levelName || '',
    transferAmount: Number(payload.transferAmount) || 0,
    transferDate: payload.transferDate || now.slice(0, 10),
    payerAccount: payload.payerAccount || '',
    payerBank: payload.payerBank || '',
    payeeAccount: payload.payeeAccount || '',
    payeeBank: payload.payeeBank || '',
    receiptUrl: payload.receiptUrl || '',
    wechatWalletNo: payload.wechatWalletNo || '',
    wechatWalletName: payload.wechatWalletName || '',
    settlementRecordNo: '',
    status: TRANSFER_STATUS.PENDING,
    remark: payload.remark || '',
    auditor: '',
    auditTime: '',
    auditOpinion: '',
    createTime: now,
    updateTime: now
  };

  mockBankTransfers.unshift(newTransfer);
  return formatTransfer(newTransfer);
};

const updateBankTransfer = (id, payload) => {
  const index = mockBankTransfers.findIndex(t => t.id === id);
  if (index === -1) throw new Error('水单记录不存在');

  const transfer = mockBankTransfers[index];
  if (transfer.status !== TRANSFER_STATUS.PENDING) {
    throw new Error('仅待审核状态的水单可修改');
  }

  const now = formatNow();
  const updatable = [
    'contractNo', 'storeNo', 'storeName', 'partnerName', 'partnerPhone',
    'levelName', 'transferAmount', 'transferDate',
    'payerAccount', 'payerBank', 'payeeAccount', 'payeeBank',
    'receiptUrl', 'wechatWalletNo', 'wechatWalletName', 'remark'
  ];

  updatable.forEach(key => {
    if (payload[key] !== undefined) {
      transfer[key] = key === 'transferAmount' ? Number(payload[key]) : payload[key];
    }
  });

  transfer.updateTime = now;
  mockBankTransfers[index] = transfer;
  return formatTransfer(transfer);
};

const removeBankTransfer = (id) => {
  const index = mockBankTransfers.findIndex(t => t.id === id);
  if (index === -1) throw new Error('水单记录不存在');

  const transfer = mockBankTransfers[index];
  if (transfer.status === TRANSFER_STATUS.APPROVED) {
    throw new Error('已确认的水单不可删除');
  }

  mockBankTransfers.splice(index, 1);
  return true;
};

const approveBankTransfer = (id, { auditor, auditOpinion = '', orderNo = '' } = {}) => {
  const index = mockBankTransfers.findIndex(t => t.id === id);
  if (index === -1) throw new Error('水单记录不存在');

  const transfer = mockBankTransfers[index];
  if (transfer.status !== TRANSFER_STATUS.PENDING) {
    throw new Error('仅待审核状态的水单可确认');
  }

  if (!transfer.wechatWalletNo) {
    throw new Error('该水单未绑定微信零钱包，无法分账');
  }
  if (!transfer.wechatWalletName) {
    throw new Error('该水单缺少微信零钱包户名');
  }

  const rule = getSettlementRuleByLevel(transfer.levelName);
  if (!rule) {
    throw new Error(`未找到"${transfer.levelName}"对应的启用中分账规则，请先在分账规则中配置`);
  }

  const now = formatNow();

  try {
    const record = createSettlementRecord({
      ruleNo: rule.ruleNo,
      ruleName: rule.ruleName,
      orderNo: orderNo || transfer.transferNo,
      contractNo: transfer.contractNo,
      partnerName: transfer.partnerName,
      storeName: transfer.storeName,
      storeNo: transfer.storeNo,
      levelName: transfer.levelName,
      totalAmount: transfer.transferAmount,
      period: transfer.transferDate.slice(0, 7),
      settlementDate: now.slice(0, 10),
      remark: `由水单${transfer.transferNo}确认后自动分账至微信零钱包(${transfer.wechatWalletNo})`
    });

    const executedRecord = executeSettlement(record.id);

    transfer.status = TRANSFER_STATUS.APPROVED;
    transfer.settlementRecordNo = executedRecord.recordNo;
    transfer.auditor = auditor || '系统';
    transfer.auditTime = now;
    transfer.auditOpinion = auditOpinion;
    transfer.updateTime = now;

    mockBankTransfers[index] = transfer;

    return {
      transfer: formatTransfer(transfer),
      settlement: executedRecord
    };
  } catch (e) {
    throw new Error(`自动分账失败：${e.message}`);
  }
};

const rejectBankTransfer = (id, { auditor, auditOpinion = '' } = {}) => {
  const index = mockBankTransfers.findIndex(t => t.id === id);
  if (index === -1) throw new Error('水单记录不存在');

  const transfer = mockBankTransfers[index];
  if (transfer.status !== TRANSFER_STATUS.PENDING) {
    throw new Error('仅待审核状态的水单可驳回');
  }

  if (!auditOpinion) {
    throw new Error('请填写驳回原因');
  }

  const now = formatNow();
  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.auditor = auditor || '系统';
  transfer.auditTime = now;
  transfer.auditOpinion = auditOpinion;
  transfer.updateTime = now;

  mockBankTransfers[index] = transfer;
  return formatTransfer(transfer);
};

const getBankTransferStatistics = () => {
  const total = mockBankTransfers.length;
  const pending = mockBankTransfers.filter(t => t.status === TRANSFER_STATUS.PENDING).length;
  const approved = mockBankTransfers.filter(t => t.status === TRANSFER_STATUS.APPROVED).length;
  const rejected = mockBankTransfers.filter(t => t.status === TRANSFER_STATUS.REJECTED).length;

  const totalAmount = mockBankTransfers.reduce((sum, t) => sum + Number(t.transferAmount), 0);
  const approvedAmount = mockBankTransfers
    .filter(t => t.status === TRANSFER_STATUS.APPROVED)
    .reduce((sum, t) => sum + Number(t.transferAmount), 0);
  const pendingAmount = mockBankTransfers
    .filter(t => t.status === TRANSFER_STATUS.PENDING)
    .reduce((sum, t) => sum + Number(t.transferAmount), 0);
  const rejectedAmount = mockBankTransfers
    .filter(t => t.status === TRANSFER_STATUS.REJECTED)
    .reduce((sum, t) => sum + Number(t.transferAmount), 0);

  return {
    total, pending, approved, rejected,
    totalAmount, approvedAmount, pendingAmount, rejectedAmount
  };
};

module.exports = {
  TRANSFER_STATUS,
  TRANSFER_STATUS_MAP,
  getBankTransferList,
  getBankTransferById,
  createBankTransfer,
  updateBankTransfer,
  removeBankTransfer,
  approveBankTransfer,
  rejectBankTransfer,
  getBankTransferStatistics
};
