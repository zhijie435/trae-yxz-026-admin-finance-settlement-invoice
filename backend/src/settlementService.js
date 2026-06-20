const { formatNow, paginateList, generateId, generateBusinessNo } = require('./utils');

const SETTLEMENT_RULE_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
};

const SETTLEMENT_RECORD_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  PARTIAL: 'partial'
};

const SETTLEMENT_EXCEPTION_STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  IGNORED: 'ignored'
};

const SETTLEMENT_EXCEPTION_TYPE = {
  AMOUNT_MISMATCH: 'amount_mismatch',
  RULE_NOT_FOUND: 'rule_not_found',
  DUPLICATE_RECORD: 'duplicate_record',
  PAYMENT_FAILED: 'payment_failed',
  OTHER: 'other'
};

const RULE_STATUS_MAP = {
  [SETTLEMENT_RULE_STATUS.ENABLED]: { label: '启用', type: 'success' },
  [SETTLEMENT_RULE_STATUS.DISABLED]: { label: '停用', type: 'info' }
};

const RECORD_STATUS_MAP = {
  [SETTLEMENT_RECORD_STATUS.PENDING]: { label: '待分账', type: 'warning' },
  [SETTLEMENT_RECORD_STATUS.SUCCESS]: { label: '分账成功', type: 'success' },
  [SETTLEMENT_RECORD_STATUS.FAILED]: { label: '分账失败', type: 'danger' },
  [SETTLEMENT_RECORD_STATUS.PARTIAL]: { label: '部分分账', type: 'warning' }
};

const EXCEPTION_STATUS_MAP = {
  [SETTLEMENT_EXCEPTION_STATUS.OPEN]: { label: '待处理', type: 'danger' },
  [SETTLEMENT_EXCEPTION_STATUS.RESOLVED]: { label: '已解决', type: 'success' },
  [SETTLEMENT_EXCEPTION_STATUS.IGNORED]: { label: '已忽略', type: 'info' }
};

const EXCEPTION_TYPE_MAP = {
  [SETTLEMENT_EXCEPTION_TYPE.AMOUNT_MISMATCH]: { label: '金额不符', type: 'warning' },
  [SETTLEMENT_EXCEPTION_TYPE.RULE_NOT_FOUND]: { label: '规则缺失', type: 'danger' },
  [SETTLEMENT_EXCEPTION_TYPE.DUPLICATE_RECORD]: { label: '重复记录', type: 'warning' },
  [SETTLEMENT_EXCEPTION_TYPE.PAYMENT_FAILED]: { label: '支付失败', type: 'danger' },
  [SETTLEMENT_EXCEPTION_TYPE.OTHER]: { label: '其他异常', type: 'info' }
};

const mockSettlementRules = [
  {
    id: 'SR001',
    ruleNo: 'FZ2026010001',
    ruleName: '金牌加盟商标准分账规则',
    levelName: '金牌加盟商',
    platformRate: 3,
    franchiseeRate: 85,
    storeRate: 12,
    settlementCycle: 'monthly',
    minAmount: 100,
    maxAmount: 1000000,
    effectiveDate: '2026-01-01',
    expiryDate: '2027-12-31',
    status: SETTLEMENT_RULE_STATUS.ENABLED,
    description: '适用于金牌加盟商的标准分账比例：平台3%，加盟商85%，门店12%',
    createTime: '2026-01-01 10:00:00',
    updateTime: '2026-01-01 10:00:00'
  },
  {
    id: 'SR002',
    ruleNo: 'FZ2026010002',
    ruleName: '银牌加盟商标准分账规则',
    levelName: '银牌加盟商',
    platformRate: 4,
    franchiseeRate: 82,
    storeRate: 14,
    settlementCycle: 'monthly',
    minAmount: 100,
    maxAmount: 500000,
    effectiveDate: '2026-01-01',
    expiryDate: '2027-12-31',
    status: SETTLEMENT_RULE_STATUS.ENABLED,
    description: '适用于银牌加盟商的标准分账比例',
    createTime: '2026-01-01 10:05:00',
    updateTime: '2026-01-01 10:05:00'
  },
  {
    id: 'SR003',
    ruleNo: 'FZ2026010003',
    ruleName: '标准加盟商分账规则',
    levelName: '标准加盟商',
    platformRate: 5,
    franchiseeRate: 80,
    storeRate: 15,
    settlementCycle: 'monthly',
    minAmount: 50,
    maxAmount: 300000,
    effectiveDate: '2026-01-01',
    expiryDate: '2027-12-31',
    status: SETTLEMENT_RULE_STATUS.ENABLED,
    description: '适用于标准加盟商的分账比例',
    createTime: '2026-01-01 10:10:00',
    updateTime: '2026-01-01 10:10:00'
  },
  {
    id: 'SR004',
    ruleNo: 'FZ2026020004',
    ruleName: '节假日促销分账规则',
    levelName: '全等级',
    platformRate: 2,
    franchiseeRate: 88,
    storeRate: 10,
    settlementCycle: 'weekly',
    minAmount: 50,
    maxAmount: 2000000,
    effectiveDate: '2026-05-01',
    expiryDate: '2026-10-31',
    status: SETTLEMENT_RULE_STATUS.DISABLED,
    description: '节假日促销期间的临时分账规则，降低平台分成',
    createTime: '2026-04-20 15:30:00',
    updateTime: '2026-05-02 09:00:00'
  }
];

const mockSettlementRecords = [
  {
    id: 'SC001',
    recordNo: 'LZ2026060001',
    ruleNo: 'FZ2026010001',
    ruleName: '金牌加盟商标准分账规则',
    orderNo: 'DD2026060100001',
    contractNo: 'HT2026060004',
    partnerName: '赵六',
    storeName: '深圳南山旗舰店',
    storeNo: 'MD2026060004',
    levelName: '金牌加盟商',
    totalAmount: 58000,
    platformAmount: 1740,
    franchiseeAmount: 49300,
    storeAmount: 6960,
    platformRate: 3,
    franchiseeRate: 85,
    storeRate: 12,
    period: '2026-06',
    settlementDate: '2026-06-15',
    status: SETTLEMENT_RECORD_STATUS.SUCCESS,
    remark: '6月上半月分账',
    createTime: '2026-06-15 10:00:00'
  },
  {
    id: 'SC002',
    recordNo: 'LZ2026060002',
    ruleNo: 'FZ2026010002',
    ruleName: '银牌加盟商标准分账规则',
    orderNo: 'DD2026060100002',
    contractNo: 'HT2026060002',
    partnerName: '李四',
    storeName: '上海浦东体验店',
    storeNo: 'MD2026010002',
    levelName: '银牌加盟商',
    totalAmount: 42000,
    platformAmount: 1680,
    franchiseeAmount: 34440,
    storeAmount: 5880,
    platformRate: 4,
    franchiseeRate: 82,
    storeRate: 14,
    period: '2026-06',
    settlementDate: '2026-06-15',
    status: SETTLEMENT_RECORD_STATUS.SUCCESS,
    remark: '',
    createTime: '2026-06-15 10:05:00'
  },
  {
    id: 'SC003',
    recordNo: 'LZ2026060003',
    ruleNo: 'FZ2026010003',
    ruleName: '标准加盟商分账规则',
    orderNo: 'DD2026060100003',
    contractNo: 'HT2026060007',
    partnerName: '周九',
    storeName: '武汉江汉标准店',
    storeNo: 'MD2026060007',
    levelName: '标准加盟商',
    totalAmount: 28000,
    platformAmount: 1400,
    franchiseeAmount: 22400,
    storeAmount: 4200,
    platformRate: 5,
    franchiseeRate: 80,
    storeRate: 15,
    period: '2026-06',
    settlementDate: '2026-06-15',
    status: SETTLEMENT_RECORD_STATUS.PENDING,
    remark: '等待财务审核',
    createTime: '2026-06-15 10:10:00'
  },
  {
    id: 'SC004',
    recordNo: 'LZ2026060004',
    ruleNo: 'FZ2026010003',
    ruleName: '标准加盟商分账规则',
    orderNo: 'DD2026060100004',
    contractNo: 'HT2026060008',
    partnerName: '吴十',
    storeName: '南京鼓楼标准店',
    storeNo: 'MD2026060008',
    levelName: '标准加盟商',
    totalAmount: 35000,
    platformAmount: 1750,
    franchiseeAmount: 28000,
    storeAmount: 5250,
    platformRate: 5,
    franchiseeRate: 80,
    storeRate: 15,
    period: '2026-06',
    settlementDate: '2026-06-15',
    status: SETTLEMENT_RECORD_STATUS.FAILED,
    remark: '银行账户信息异常，支付失败',
    createTime: '2026-06-15 10:15:00'
  },
  {
    id: 'SC005',
    recordNo: 'LZ2026060005',
    ruleNo: 'FZ2026010001',
    ruleName: '金牌加盟商标准分账规则',
    orderNo: 'DD2026060800010',
    contractNo: 'HT2026060004',
    partnerName: '赵六',
    storeName: '深圳南山旗舰店',
    storeNo: 'MD2026060004',
    levelName: '金牌加盟商',
    totalAmount: 72000,
    platformAmount: 2160,
    franchiseeAmount: 61200,
    storeAmount: 8640,
    platformRate: 3,
    franchiseeRate: 85,
    storeRate: 12,
    period: '2026-06',
    settlementDate: '',
    status: SETTLEMENT_RECORD_STATUS.PENDING,
    remark: '6月下半月分账待处理',
    createTime: '2026-06-20 09:00:00'
  },
  {
    id: 'SC006',
    recordNo: 'LZ2026060006',
    ruleNo: 'FZ2026010002',
    ruleName: '银牌加盟商标准分账规则',
    orderNo: 'DD2026060100020',
    contractNo: 'HT2026060005',
    partnerName: '钱七',
    storeName: '杭州西湖形象店',
    storeNo: 'MD2026020003',
    levelName: '银牌加盟商',
    totalAmount: 39000,
    platformAmount: 1560,
    franchiseeAmount: 31980,
    storeAmount: 5460,
    platformRate: 4,
    franchiseeRate: 82,
    storeRate: 14,
    period: '2026-06',
    settlementDate: '2026-06-18',
    status: SETTLEMENT_RECORD_STATUS.PARTIAL,
    remark: '门店部分已到账，加盟商部分待处理',
    createTime: '2026-06-18 14:30:00'
  }
];

const mockSettlementExceptions = [
  {
    id: 'SE001',
    exceptionNo: 'YC2026060001',
    recordNo: 'LZ2026060004',
    type: SETTLEMENT_EXCEPTION_TYPE.PAYMENT_FAILED,
    title: '分账支付失败',
    description: '南京鼓楼标准店分账支付失败，银行返回账户信息异常错误码：ACCOUNT_INVALID',
    amount: 35000,
    affectedParties: ['平台', '加盟商', '门店'],
    status: SETTLEMENT_EXCEPTION_STATUS.OPEN,
    handler: '',
    handleTime: '',
    handleResult: '',
    createTime: '2026-06-15 10:20:00'
  },
  {
    id: 'SE002',
    exceptionNo: 'YC2026060002',
    recordNo: 'LZ2026060001',
    type: SETTLEMENT_EXCEPTION_TYPE.AMOUNT_MISMATCH,
    title: '分账金额不一致',
    description: '系统计算分账金额58000元与订单实际金额58200元存在200元差异，需人工核对',
    amount: 200,
    affectedParties: ['平台'],
    status: SETTLEMENT_EXCEPTION_STATUS.RESOLVED,
    handler: '财务-李经理',
    handleTime: '2026-06-16 11:00:00',
    handleResult: '经核实为订单优惠金额未计入，已调整分账金额并重新计算',
    createTime: '2026-06-15 15:30:00'
  },
  {
    id: 'SE003',
    exceptionNo: 'YC2026060003',
    recordNo: '',
    type: SETTLEMENT_EXCEPTION_TYPE.RULE_NOT_FOUND,
    title: '缺少分账规则',
    description: '订单DD2026062000008关联的加盟商等级"钻石加盟商"未配置分账规则',
    amount: 0,
    affectedParties: ['平台', '加盟商'],
    status: SETTLEMENT_EXCEPTION_STATUS.OPEN,
    handler: '',
    handleTime: '',
    handleResult: '',
    createTime: '2026-06-19 09:10:00'
  },
  {
    id: 'SE004',
    exceptionNo: 'YC2026060004',
    recordNo: 'LZ2026060002',
    type: SETTLEMENT_EXCEPTION_TYPE.DUPLICATE_RECORD,
    title: '疑似重复分账记录',
    description: '上海浦东体验店在同一账期存在两条分账记录，订单号相近，请确认是否重复',
    amount: 42000,
    affectedParties: ['加盟商', '门店'],
    status: SETTLEMENT_EXCEPTION_STATUS.IGNORED,
    handler: '运营-王主管',
    handleTime: '2026-06-17 16:20:00',
    handleResult: '核实为两笔不同订单的分账，非重复记录，已标记忽略',
    createTime: '2026-06-16 10:45:00'
  },
  {
    id: 'SE005',
    exceptionNo: 'YC2026060005',
    recordNo: 'LZ2026060006',
    type: SETTLEMENT_EXCEPTION_TYPE.OTHER,
    title: '部分分账未完成',
    description: '杭州西湖形象店分账仅门店部分到账，加盟商部分31980元未到账',
    amount: 31980,
    affectedParties: ['加盟商'],
    status: SETTLEMENT_EXCEPTION_STATUS.OPEN,
    handler: '',
    handleTime: '',
    handleResult: '',
    createTime: '2026-06-19 13:50:00'
  }
];

let settlementRules = JSON.parse(JSON.stringify(mockSettlementRules));
let settlementRecords = JSON.parse(JSON.stringify(mockSettlementRecords));
let settlementExceptions = JSON.parse(JSON.stringify(mockSettlementExceptions));

let nextRuleCounter = 5;
let nextRecordCounter = 7;
let nextExceptionCounter = 6;

const formatRule = (rule) => ({
  ...rule,
  statusText: (RULE_STATUS_MAP[rule.status] || {}).label || '未知'
});

const formatRecord = (record) => ({
  ...record,
  statusText: (RECORD_STATUS_MAP[record.status] || {}).label || '未知'
});

const formatException = (exception) => ({
  ...exception,
  statusText: (EXCEPTION_STATUS_MAP[exception.status] || {}).label || '未知',
  typeText: (EXCEPTION_TYPE_MAP[exception.type] || {}).label || '未知'
});

const getSettlementRuleList = ({ page = 1, pageSize = 10, status, keyword, levelName } = {}) => {
  let result = [...settlementRules];

  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }

  if (levelName && levelName !== 'all') {
    result = result.filter(r => r.levelName === levelName || r.levelName === '全等级');
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(r =>
      r.ruleNo.toLowerCase().includes(kw) ||
      r.ruleName.toLowerCase().includes(kw) ||
      r.levelName.toLowerCase().includes(kw)
    );
  }

  result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = result.length;
  return {
    ...paginateList({ list: result, page, pageSize, total }),
    list: paginateList({ list: result, page, pageSize, total }).list.map(formatRule)
  };
};

const getSettlementRuleById = (id) => {
  const rule = settlementRules.find(r => r.id === String(id));
  return rule ? formatRule(rule) : null;
};

const getSettlementRuleByLevel = (levelName) => {
  const rule = settlementRules.find(r =>
    r.status === SETTLEMENT_RULE_STATUS.ENABLED &&
    (r.levelName === levelName || r.levelName === '全等级')
  );
  return rule ? formatRule(rule) : null;
};

const createSettlementRule = (payload) => {
  const {
    ruleName, levelName, platformRate, franchiseeRate, storeRate,
    settlementCycle, minAmount, maxAmount, effectiveDate, expiryDate, description
  } = payload;

  if (!ruleName || !levelName || platformRate == null || franchiseeRate == null || storeRate == null) {
    throw new Error('必填项不能为空');
  }

  const totalRate = Number(platformRate) + Number(franchiseeRate) + Number(storeRate);
  if (Math.abs(totalRate - 100) > 0.001) {
    throw new Error('三方分账比例之和必须等于100%');
  }

  if (Number(platformRate) < 0 || Number(franchiseeRate) < 0 || Number(storeRate) < 0) {
    throw new Error('分账比例不能为负数');
  }

  const newId = 'SR' + String(nextRuleCounter++).padStart(3, '0');
  const now = formatNow();
  const ruleNo = generateBusinessNo('FZ', nextRuleCounter - 1);

  const rule = {
    id: newId,
    ruleNo,
    ruleName,
    levelName,
    platformRate: Number(platformRate),
    franchiseeRate: Number(franchiseeRate),
    storeRate: Number(storeRate),
    settlementCycle: settlementCycle || 'monthly',
    minAmount: Number(minAmount) || 0,
    maxAmount: Number(maxAmount) || 0,
    effectiveDate: effectiveDate || '',
    expiryDate: expiryDate || '',
    status: SETTLEMENT_RULE_STATUS.ENABLED,
    description: description || '',
    createTime: now,
    updateTime: now
  };

  settlementRules.unshift(rule);
  return formatRule(rule);
};

const updateSettlementRule = (id, payload) => {
  const rule = settlementRules.find(r => r.id === String(id));
  if (!rule) throw new Error('分账规则不存在');

  const allowedFields = [
    'ruleName', 'levelName', 'platformRate', 'franchiseeRate', 'storeRate',
    'settlementCycle', 'minAmount', 'maxAmount', 'effectiveDate', 'expiryDate', 'description'
  ];

  allowedFields.forEach(field => {
    if (payload[field] !== undefined) {
      rule[field] = payload[field];
    }
  });

  if (payload.platformRate != null || payload.franchiseeRate != null || payload.storeRate != null) {
    const totalRate = Number(rule.platformRate) + Number(rule.franchiseeRate) + Number(rule.storeRate);
    if (Math.abs(totalRate - 100) > 0.001) {
      throw new Error('三方分账比例之和必须等于100%');
    }
  }

  rule.updateTime = formatNow();
  return formatRule(rule);
};

const updateSettlementRuleStatus = (id, status) => {
  const rule = settlementRules.find(r => r.id === String(id));
  if (!rule) throw new Error('分账规则不存在');

  if (![SETTLEMENT_RULE_STATUS.ENABLED, SETTLEMENT_RULE_STATUS.DISABLED].includes(status)) {
    throw new Error('无效的状态值');
  }

  rule.status = status;
  rule.updateTime = formatNow();
  return formatRule(rule);
};

const removeSettlementRule = (id) => {
  const index = settlementRules.findIndex(r => r.id === String(id));
  if (index === -1) throw new Error('分账规则不存在');
  settlementRules.splice(index, 1);
};

const getSettlementRuleStatistics = () => {
  const total = settlementRules.length;
  const enabled = settlementRules.filter(r => r.status === SETTLEMENT_RULE_STATUS.ENABLED).length;
  const disabled = settlementRules.filter(r => r.status === SETTLEMENT_RULE_STATUS.DISABLED).length;
  return { total, enabled, disabled };
};

const getSettlementRecordList = ({ page = 1, pageSize = 10, status, keyword, period, levelName } = {}) => {
  let result = [...settlementRecords];

  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }

  if (period) {
    result = result.filter(r => r.period === period);
  }

  if (levelName && levelName !== 'all') {
    result = result.filter(r => r.levelName === levelName);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(r =>
      r.recordNo.toLowerCase().includes(kw) ||
      r.orderNo.toLowerCase().includes(kw) ||
      r.partnerName.toLowerCase().includes(kw) ||
      r.storeName.toLowerCase().includes(kw) ||
      r.contractNo.toLowerCase().includes(kw)
    );
  }

  result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = result.length;
  return {
    ...paginateList({ list: result, page, pageSize, total }),
    list: paginateList({ list: result, page, pageSize, total }).list.map(formatRecord)
  };
};

const getSettlementRecordById = (id) => {
  const record = settlementRecords.find(r => r.id === String(id));
  return record ? formatRecord(record) : null;
};

const createSettlementRecord = (payload) => {
  const {
    ruleNo, ruleName, orderNo, contractNo, partnerName, storeName, storeNo,
    levelName, totalAmount, period, remark
  } = payload;

  if (!orderNo || !totalAmount || !partnerName) {
    throw new Error('订单号、分账金额、合伙人姓名不能为空');
  }

  let rule = null;
  if (ruleNo) {
    rule = settlementRules.find(r => r.ruleNo === ruleNo && r.status === SETTLEMENT_RULE_STATUS.ENABLED);
  }
  if (!rule && levelName) {
    rule = settlementRules.find(r =>
      r.status === SETTLEMENT_RULE_STATUS.ENABLED &&
      (r.levelName === levelName || r.levelName === '全等级')
    );
  }

  if (!rule) {
    throw new Error('未找到有效的分账规则，请先配置分账规则');
  }

  const amount = Number(totalAmount);
  if (rule.minAmount && amount < rule.minAmount) {
    throw new Error(`分账金额低于规则最低限额${rule.minAmount}元`);
  }
  if (rule.maxAmount && amount > rule.maxAmount) {
    throw new Error(`分账金额高于规则最高限额${rule.maxAmount}元`);
  }

  const platformAmount = Math.round(amount * rule.platformRate) / 100;
  const franchiseeAmount = Math.round(amount * rule.franchiseeRate) / 100;
  const storeAmount = Math.round(amount * rule.storeRate) / 100;

  const newId = 'SC' + String(nextRecordCounter++).padStart(3, '0');
  const now = formatNow();
  const recordNo = generateBusinessNo('LZ', nextRecordCounter - 1);

  const record = {
    id: newId,
    recordNo,
    ruleNo: rule.ruleNo,
    ruleName: rule.ruleName,
    orderNo,
    contractNo: contractNo || '',
    partnerName,
    storeName: storeName || '',
    storeNo: storeNo || '',
    levelName: levelName || rule.levelName,
    totalAmount: amount,
    platformAmount,
    franchiseeAmount,
    storeAmount,
    platformRate: rule.platformRate,
    franchiseeRate: rule.franchiseeRate,
    storeRate: rule.storeRate,
    period: period || now.substring(0, 7),
    settlementDate: '',
    status: SETTLEMENT_RECORD_STATUS.PENDING,
    remark: remark || '',
    createTime: now
  };

  settlementRecords.unshift(record);
  return formatRecord(record);
};

const executeSettlement = (id) => {
  const record = settlementRecords.find(r => r.id === String(id));
  if (!record) throw new Error('分账记录不存在');

  if (record.status === SETTLEMENT_RECORD_STATUS.SUCCESS) {
    throw new Error('该记录已分账成功，无需重复操作');
  }

  try {
    const success = Math.random() > 0.2;

    if (success) {
      record.status = SETTLEMENT_RECORD_STATUS.SUCCESS;
      record.settlementDate = formatNow().substring(0, 10);
    } else {
      record.status = SETTLEMENT_RECORD_STATUS.FAILED;
      createSettlementException({
        recordNo: record.recordNo,
        type: SETTLEMENT_EXCEPTION_TYPE.PAYMENT_FAILED,
        title: '分账执行失败',
        description: `分账记录${record.recordNo}自动执行失败，请人工介入处理`,
        amount: record.totalAmount,
        affectedParties: ['平台', '加盟商', '门店']
      });
    }
  } catch (e) {
    record.status = SETTLEMENT_RECORD_STATUS.FAILED;
  }

  return formatRecord(record);
};

const retrySettlement = (id) => {
  const record = settlementRecords.find(r => r.id === String(id));
  if (!record) throw new Error('分账记录不存在');

  record.status = SETTLEMENT_RECORD_STATUS.PENDING;
  record.settlementDate = '';
  return executeSettlement(id);
};

const getSettlementRecordStatistics = () => {
  const total = settlementRecords.length;
  const pending = settlementRecords.filter(r => r.status === SETTLEMENT_RECORD_STATUS.PENDING).length;
  const success = settlementRecords.filter(r => r.status === SETTLEMENT_RECORD_STATUS.SUCCESS).length;
  const failed = settlementRecords.filter(r => r.status === SETTLEMENT_RECORD_STATUS.FAILED).length;
  const partial = settlementRecords.filter(r => r.status === SETTLEMENT_RECORD_STATUS.PARTIAL).length;
  const totalAmount = settlementRecords.reduce((sum, r) => sum + r.totalAmount, 0);
  const platformTotal = settlementRecords.reduce((sum, r) => sum + r.platformAmount, 0);
  const franchiseeTotal = settlementRecords.reduce((sum, r) => sum + r.franchiseeAmount, 0);
  const storeTotal = settlementRecords.reduce((sum, r) => sum + r.storeAmount, 0);
  const successAmount = settlementRecords
    .filter(r => r.status === SETTLEMENT_RECORD_STATUS.SUCCESS)
    .reduce((sum, r) => sum + r.totalAmount, 0);
  return {
    total, pending, success, failed, partial,
    totalAmount, platformTotal, franchiseeTotal, storeTotal, successAmount
  };
};

const getSettlementExceptionList = ({ page = 1, pageSize = 10, status, type, keyword } = {}) => {
  let result = [...settlementExceptions];

  if (status && status !== 'all') {
    result = result.filter(e => e.status === status);
  }

  if (type && type !== 'all') {
    result = result.filter(e => e.type === type);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(e =>
      e.exceptionNo.toLowerCase().includes(kw) ||
      e.recordNo.toLowerCase().includes(kw) ||
      e.title.toLowerCase().includes(kw) ||
      e.description.toLowerCase().includes(kw)
    );
  }

  result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = result.length;
  return {
    ...paginateList({ list: result, page, pageSize, total }),
    list: paginateList({ list: result, page, pageSize, total }).list.map(formatException)
  };
};

const getSettlementExceptionById = (id) => {
  const exception = settlementExceptions.find(e => e.id === String(id));
  return exception ? formatException(exception) : null;
};

const createSettlementException = (payload) => {
  const { recordNo, type, title, description, amount, affectedParties } = payload;

  if (!type || !title) {
    throw new Error('异常类型和标题不能为空');
  }

  const newId = 'SE' + String(nextExceptionCounter++).padStart(3, '0');
  const now = formatNow();
  const exceptionNo = generateBusinessNo('YC', nextExceptionCounter - 1);

  const exception = {
    id: newId,
    exceptionNo,
    recordNo: recordNo || '',
    type,
    title,
    description: description || '',
    amount: Number(amount) || 0,
    affectedParties: affectedParties || [],
    status: SETTLEMENT_EXCEPTION_STATUS.OPEN,
    handler: '',
    handleTime: '',
    handleResult: '',
    createTime: now
  };

  settlementExceptions.unshift(exception);
  return formatException(exception);
};

const resolveSettlementException = (id, payload) => {
  const exception = settlementExceptions.find(e => e.id === String(id));
  if (!exception) throw new Error('异常记录不存在');

  const { handler, handleResult } = payload;
  if (!handleResult) {
    throw new Error('处理结果不能为空');
  }

  exception.status = SETTLEMENT_EXCEPTION_STATUS.RESOLVED;
  exception.handler = handler || '';
  exception.handleTime = formatNow();
  exception.handleResult = handleResult;

  return formatException(exception);
};

const ignoreSettlementException = (id, payload) => {
  const exception = settlementExceptions.find(e => e.id === String(id));
  if (!exception) throw new Error('异常记录不存在');

  const { handler, handleResult } = payload;

  exception.status = SETTLEMENT_EXCEPTION_STATUS.IGNORED;
  exception.handler = handler || '';
  exception.handleTime = formatNow();
  exception.handleResult = handleResult || '标记为忽略';

  return formatException(exception);
};

const getSettlementExceptionStatistics = () => {
  const total = settlementExceptions.length;
  const open = settlementExceptions.filter(e => e.status === SETTLEMENT_EXCEPTION_STATUS.OPEN).length;
  const resolved = settlementExceptions.filter(e => e.status === SETTLEMENT_EXCEPTION_STATUS.RESOLVED).length;
  const ignored = settlementExceptions.filter(e => e.status === SETTLEMENT_EXCEPTION_STATUS.IGNORED).length;
  const totalAmount = settlementExceptions.reduce((sum, e) => sum + e.amount, 0);
  const openAmount = settlementExceptions
    .filter(e => e.status === SETTLEMENT_EXCEPTION_STATUS.OPEN)
    .reduce((sum, e) => sum + e.amount, 0);
  return { total, open, resolved, ignored, totalAmount, openAmount };
};

module.exports = {
  SETTLEMENT_RULE_STATUS,
  SETTLEMENT_RECORD_STATUS,
  SETTLEMENT_EXCEPTION_STATUS,
  SETTLEMENT_EXCEPTION_TYPE,
  getSettlementRuleList,
  getSettlementRuleById,
  getSettlementRuleByLevel,
  createSettlementRule,
  updateSettlementRule,
  updateSettlementRuleStatus,
  removeSettlementRule,
  getSettlementRuleStatistics,
  getSettlementRecordList,
  getSettlementRecordById,
  createSettlementRecord,
  executeSettlement,
  retrySettlement,
  getSettlementRecordStatistics,
  getSettlementExceptionList,
  getSettlementExceptionById,
  createSettlementException,
  resolveSettlementException,
  ignoreSettlementException,
  getSettlementExceptionStatistics
};
