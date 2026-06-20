const { APPLICATION_STATUS } = require('./constants');
const { mockApplications } = require('./mockData');
const { formatNow, generateId, generateBusinessNo, paginateList } = require('./utils');

const mockStores = [
  {
    id: 'ST001',
    storeNo: 'MD2026010001',
    storeName: '北京朝阳旗舰店',
    partnerName: '张伟',
    partnerPhone: '13800138001',
    companyName: '上海佳和餐饮管理有限公司',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '朝阳区建国路88号SOHO现代城A座1层',
    storeArea: '280平米',
    account: 'bj_chaoyang_001',
    openDate: '2026-03-15',
    status: 'enabled',
    balance: 128600,
    frozenBalance: 0,
    bankName: '中国工商银行',
    bankAccount: '6222 **** **** 8888',
    bankAccountName: '张伟',
    createTime: '2026-02-20 10:00:00',
    applicationId: '',
    remark: '北京地区核心旗舰店'
  },
  {
    id: 'ST002',
    storeNo: 'MD2026010002',
    storeName: '上海浦东体验店',
    partnerName: '李娜',
    partnerPhone: '13900139002',
    companyName: '北京优品零售有限公司',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    address: '浦东新区世纪大道100号环球金融中心B1层',
    storeArea: '350平米',
    account: 'sh_pudong_002',
    openDate: '2026-04-01',
    status: 'enabled',
    balance: 85400,
    frozenBalance: 0,
    bankName: '中国建设银行',
    bankAccount: '6227 **** **** 6666',
    bankAccountName: '李娜',
    createTime: '2026-03-10 14:30:00',
    applicationId: '',
    remark: '华东地区旗舰体验店'
  },
  {
    id: 'ST003',
    storeNo: 'MD2026020003',
    storeName: '杭州西湖形象店',
    partnerName: '陈静',
    partnerPhone: '13400134006',
    companyName: '杭州美味餐饮管理有限公司',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    address: '西湖区文三路259号昌地火炬大厦1层',
    storeArea: '220平米',
    account: 'hz_xihu_003',
    openDate: '2026-05-10',
    status: 'enabled',
    balance: 56800,
    frozenBalance: 5000,
    bankName: '招商银行',
    bankAccount: '6225 **** **** 3333',
    bankAccountName: '陈静',
    createTime: '2026-04-15 09:20:00',
    applicationId: '',
    remark: ''
  },
  {
    id: 'ST004',
    storeNo: 'MD2026020004',
    storeName: '广州天河标准店',
    partnerName: '王强',
    partnerPhone: '13700137003',
    companyName: '广州恒信服务有限公司',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    address: '天河区体育西路103号维多利广场1层',
    storeArea: '180平米',
    account: 'gz_tianhe_004',
    openDate: '2026-05-20',
    status: 'disabled',
    balance: 32000,
    frozenBalance: 0,
    bankName: '中国农业银行',
    bankAccount: '6228 **** **** 9999',
    bankAccountName: '王强',
    createTime: '2026-04-28 16:00:00',
    applicationId: '',
    remark: '因违规操作被暂停账号'
  },
  {
    id: 'ST005',
    storeNo: 'MD2026030005',
    storeName: '深圳南山社区店',
    partnerName: '赵敏',
    partnerPhone: '13600136004',
    companyName: '成都智学教育咨询有限公司',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '南山区科技园南区高新南一道飞亚达大厦1层',
    storeArea: '150平米',
    account: 'sz_nanshan_005',
    openDate: '2026-06-01',
    status: 'enabled',
    balance: 12500,
    frozenBalance: 0,
    bankName: '交通银行',
    bankAccount: '6222 **** **** 7777',
    bankAccountName: '赵敏',
    createTime: '2026-05-10 11:15:00',
    applicationId: '',
    remark: ''
  },
  {
    id: 'ST006',
    storeNo: 'MD2026060004',
    storeName: '深圳南山旗舰店',
    partnerName: '赵六',
    partnerPhone: '13600136004',
    companyName: '深圳市创新科技有限公司',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '南山区科技园南区高新南一道飞亚达大厦10层',
    storeArea: '500平米',
    account: 'shenzhen_cx01',
    openDate: '2026-06-19',
    status: 'enabled',
    balance: 156000,
    frozenBalance: 0,
    bankName: '招商银行深圳分行',
    bankAccount: '6225 **** **** 1234',
    bankAccountName: '赵六',
    createTime: '2026-06-15 10:00:00',
    applicationId: '4',
    remark: '深圳地区旗舰门店'
  },
  {
    id: 'ST007',
    storeNo: 'MD2026060007',
    storeName: '武汉江汉标准店',
    partnerName: '周九',
    partnerPhone: '13300133007',
    companyName: '武汉市江城商业有限公司',
    province: '湖北省',
    city: '武汉市',
    district: '江汉区',
    address: '江汉区解放大道128号',
    storeArea: '160平米',
    account: 'wuhan_jc01',
    openDate: '',
    status: 'enabled',
    balance: 4200,
    frozenBalance: 0,
    bankName: '中国工商银行武汉分行',
    bankAccount: '6222 **** **** 5678',
    bankAccountName: '周九',
    createTime: '2026-06-12 14:30:00',
    applicationId: '7',
    remark: ''
  },
  {
    id: 'ST008',
    storeNo: 'MD2026060008',
    storeName: '南京鼓楼标准店',
    partnerName: '吴十',
    partnerPhone: '13200132008',
    companyName: '南京市金陵商贸有限公司',
    province: '江苏省',
    city: '南京市',
    district: '鼓楼区',
    address: '鼓楼区中山路88号',
    storeArea: '170平米',
    account: 'nanjing_jl01',
    openDate: '2026-06-15',
    status: 'enabled',
    balance: 8900,
    frozenBalance: 0,
    bankName: '中国银行南京分行',
    bankAccount: '6217 **** **** 4321',
    bankAccountName: '吴十',
    createTime: '2026-06-10 09:00:00',
    applicationId: '8',
    remark: ''
  }
];

let stores = JSON.parse(JSON.stringify(mockStores));
let nextStoreCounter = 6;

const STATUS_MAP = {
  enabled: { label: '已启用', type: 'success' },
  disabled: { label: '已禁用', type: 'danger' }
};

const formatStore = (store) => ({
  ...store,
  statusText: (STATUS_MAP[store.status] || {}).label || '未知'
});

const getStoreList = ({ page = 1, pageSize = 10, status, keyword, province, city } = {}) => {
  let result = [...stores];

  if (status && status !== 'all') {
    result = result.filter(s => s.status === status);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(s =>
      s.storeName.toLowerCase().includes(kw) ||
      s.storeNo.toLowerCase().includes(kw) ||
      s.partnerName.toLowerCase().includes(kw) ||
      s.partnerPhone.includes(kw) ||
      s.account.toLowerCase().includes(kw)
    );
  }

  if (province && province !== 'all') {
    result = result.filter(s => s.province === province);
  }

  if (city && city !== 'all') {
    result = result.filter(s => s.city === city);
  }

  result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  return paginateList({
    list: result.map(formatStore),
    page,
    pageSize
  });
};

const getStoreById = (id) => {
  const store = stores.find(s => s.id === String(id));
  return store ? formatStore(store) : null;
};

const getStoreByNo = (storeNo) => {
  const store = stores.find(s => s.storeNo === String(storeNo));
  return store ? formatStore(store) : null;
};

const getStoreStatistics = () => {
  const total = stores.length;
  const enabled = stores.filter(s => s.status === 'enabled').length;
  const disabled = stores.filter(s => s.status === 'disabled').length;
  const cities = [...new Set(stores.map(s => s.city))].length;
  return { total, enabled, disabled, cities };
};

const createStore = (payload) => {
  const {
    storeName, partnerName, partnerPhone, companyName,
    province, city, district, address, storeArea, account, openDate, remark = '',
    applicationId = ''
  } = payload;

  if (!storeName || !partnerName || !partnerPhone || !province || !city || !district || !address || !account) {
    throw new Error('必填项不能为空');
  }

  if (stores.find(s => s.account === account)) {
    throw new Error('账号已存在，请更换账号');
  }

  const newId = generateId('ST', nextStoreCounter++);
  const now = formatNow();
  const storeNo = generateBusinessNo('MD', nextStoreCounter - 1);

  const store = {
    id: newId,
    storeNo,
    storeName,
    partnerName,
    partnerPhone,
    companyName: companyName || '',
    province,
    city,
    district,
    address,
    storeArea: storeArea || '',
    account,
    openDate: openDate || now.substring(0, 10),
    status: 'enabled',
    balance: 0,
    frozenBalance: 0,
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    createTime: now,
    applicationId,
    remark
  };

  stores.unshift(store);
  return formatStore(store);
};

const createStoreFromApplication = (appData) => {
  const accountData = appData.stageData?.account || {};
  const contractData = appData.stageData?.contract || {};

  if (!accountData.account || !accountData.storeNo) {
    return null;
  }

  const existing = stores.find(s =>
    s.account === accountData.account || s.storeNo === accountData.storeNo
  );
  if (existing) {
    existing.applicationId = appData.id;
    return formatStore(existing);
  }

  return createStore({
    storeName: accountData.storeName || `${appData.city}门店`,
    partnerName: appData.legalPerson,
    partnerPhone: appData.phone,
    companyName: appData.companyName,
    province: appData.province,
    city: appData.city,
    district: appData.district,
    address: appData.district || '',
    storeArea: '',
    account: accountData.account,
    openDate: accountData.openDate || formatNow().substring(0, 10),
    remark: `由申请 ${appData.applyNo} 自动创建`,
    applicationId: appData.id
  });
};

const removeStore = (id) => {
  const index = stores.findIndex(s => s.id === String(id));
  if (index === -1) throw new Error('门店不存在');
  stores.splice(index, 1);
  return true;
};

const updateStoreStatus = (id, status) => {
  if (!['enabled', 'disabled'].includes(status)) {
    throw new Error('状态参数错误');
  }
  const store = stores.find(s => s.id === String(id));
  if (!store) throw new Error('门店不存在');
  store.status = status;
  return formatStore(store);
};

const updateStore = (id, payload) => {
  const store = stores.find(s => s.id === String(id));
  if (!store) throw new Error('门店不存在');

  if (payload.storeNo) {
    const duplicate = stores.find(s => s.id !== String(id) && s.storeNo === payload.storeNo);
    if (duplicate) throw new Error('门店编号已存在');
  }

  if (payload.account) {
    const duplicate = stores.find(s => s.id !== String(id) && s.account === payload.account);
    if (duplicate) throw new Error('账号已存在');
  }

  const allowedFields = [
    'storeNo', 'storeName', 'partnerName', 'partnerPhone',
    'companyName', 'province', 'city', 'district', 'address', 'storeArea',
    'account', 'openDate', 'remark', 'applicationId',
    'bankName', 'bankAccount', 'bankAccountName'
  ];
  allowedFields.forEach(field => {
    if (payload[field] !== undefined) {
      store[field] = payload[field];
    }
  });

  return formatStore(store);
};

const resetPassword = (id, newPassword) => {
  const store = stores.find(s => s.id === String(id));
  if (!store) throw new Error('门店不存在');
  if (!newPassword || newPassword.length < 6) {
    throw new Error('密码长度不能少于6位');
  }
  store.password = newPassword;
  store.passwordUpdateTime = formatNow();
  return { success: true, account: store.account, passwordUpdateTime: store.passwordUpdateTime };
};

const getStoresByCity = (city) => {
  return stores.filter(s => s.city === city).map(formatStore);
};

const getStoreBalance = (storeId) => {
  const store = stores.find(s => s.id === String(storeId));
  if (!store) throw new Error('门店不存在');
  return {
    storeNo: store.storeNo,
    storeName: store.storeName,
    balance: store.balance || 0,
    frozenBalance: store.frozenBalance || 0,
    availableBalance: (store.balance || 0) - (store.frozenBalance || 0)
  };
};

const freezeBalance = (storeId, amount) => {
  const store = stores.find(s => s.id === String(storeId));
  if (!store) throw new Error('门店不存在');
  
  const amt = Number(amount);
  if (amt <= 0) throw new Error('冻结金额必须大于0');
  
  const available = (store.balance || 0) - (store.frozenBalance || 0);
  if (amt > available) {
    throw new Error('可用余额不足');
  }
  
  store.frozenBalance = (store.frozenBalance || 0) + amt;
  return {
    balance: store.balance,
    frozenBalance: store.frozenBalance,
    availableBalance: store.balance - store.frozenBalance
  };
};

const unfreezeBalance = (storeId, amount) => {
  const store = stores.find(s => s.id === String(storeId));
  if (!store) throw new Error('门店不存在');
  
  const amt = Number(amount);
  if (amt <= 0) throw new Error('解冻金额必须大于0');
  
  if (amt > (store.frozenBalance || 0)) {
    throw new Error('解冻金额不能大于冻结余额');
  }
  
  store.frozenBalance = (store.frozenBalance || 0) - amt;
  return {
    balance: store.balance,
    frozenBalance: store.frozenBalance,
    availableBalance: store.balance - store.frozenBalance
  };
};

const deductBalance = (storeId, amount) => {
  const store = stores.find(s => s.id === String(storeId));
  if (!store) throw new Error('门店不存在');
  
  const amt = Number(amount);
  if (amt <= 0) throw new Error('扣款金额必须大于0');
  
  const available = (store.balance || 0) - (store.frozenBalance || 0);
  if (amt > available) {
    throw new Error('可用余额不足');
  }
  
  store.balance = (store.balance || 0) - amt;
  if (store.frozenBalance > 0) {
    store.frozenBalance = Math.max(0, (store.frozenBalance || 0) - amt);
  }
  
  return {
    balance: store.balance,
    frozenBalance: store.frozenBalance,
    availableBalance: store.balance - store.frozenBalance
  };
};

const addBalance = (storeId, amount, remark = '') => {
  const store = stores.find(s => s.id === String(storeId));
  if (!store) throw new Error('门店不存在');
  
  const amt = Number(amount);
  if (amt <= 0) throw new Error('充值金额必须大于0');
  
  store.balance = (store.balance || 0) + amt;
  return {
    balance: store.balance,
    frozenBalance: store.frozenBalance || 0,
    availableBalance: store.balance - (store.frozenBalance || 0)
  };
};

const updateBankInfo = (storeId, bankInfo) => {
  const store = stores.find(s => s.id === String(storeId));
  if (!store) throw new Error('门店不存在');
  
  const { bankName, bankAccount, bankAccountName } = bankInfo;
  if (bankName !== undefined) store.bankName = bankName;
  if (bankAccount !== undefined) store.bankAccount = bankAccount;
  if (bankAccountName !== undefined) store.bankAccountName = bankAccountName;
  
  return formatStore(store);
};

module.exports = {
  getStoreList,
  getStoreById,
  getStoreByNo,
  getStoreStatistics,
  createStore,
  createStoreFromApplication,
  removeStore,
  updateStoreStatus,
  updateStore,
  resetPassword,
  getStoresByCity,
  getStoreBalance,
  freezeBalance,
  unfreezeBalance,
  deductBalance,
  addBalance,
  updateBankInfo
};
