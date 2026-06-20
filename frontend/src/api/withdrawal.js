import request from '../utils/request'

export function getWithdrawalList(params) {
  return request({ url: '/withdrawals', method: 'get', params })
}

export function getWithdrawalStatistics(params) {
  return request({ url: '/withdrawals/statistics', method: 'get', params })
}

export function getWithdrawalDetail(id) {
  return request({ url: `/withdrawals/${id}`, method: 'get' })
}

export function applyWithdrawal(data) {
  return request({ url: '/withdrawals', method: 'post', data })
}

export function auditWithdrawal(id, data) {
  return request({ url: `/withdrawals/${id}/audit`, method: 'put', data })
}

export function executePay(id) {
  return request({ url: `/withdrawals/${id}/pay`, method: 'put' })
}

export function retryPay(id) {
  return request({ url: `/withdrawals/${id}/retry-pay`, method: 'put' })
}

export function cancelWithdrawal(id) {
  return request({ url: `/withdrawals/${id}/cancel`, method: 'put' })
}

export function getStoreBalance(storeId) {
  return request({ url: `/stores/${storeId}/balance`, method: 'get' })
}

export function updateBankInfo(storeId, data) {
  return request({ url: `/stores/${storeId}/bank-info`, method: 'put', data })
}

export function getAutoWithdrawalConfig() {
  return request({ url: '/withdrawal-auto-config', method: 'get' })
}

export function updateAutoWithdrawalConfig(data) {
  return request({ url: '/withdrawal-auto-config', method: 'put', data })
}
