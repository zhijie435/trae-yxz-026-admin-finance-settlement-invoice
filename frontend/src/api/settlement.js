import request from '../utils/request'

export function getSettlementRuleList(params) {
  return request({ url: '/settlement-rules', method: 'get', params })
}

export function getSettlementRuleStatistics() {
  return request({ url: '/settlement-rules/statistics', method: 'get' })
}

export function getSettlementRuleDetail(id) {
  return request({ url: `/settlement-rules/${id}`, method: 'get' })
}

export function addSettlementRule(data) {
  return request({ url: '/settlement-rules', method: 'post', data })
}

export function updateSettlementRule(id, data) {
  return request({ url: `/settlement-rules/${id}`, method: 'put', data })
}

export function updateSettlementRuleStatus(id, status) {
  return request({ url: `/settlement-rules/${id}/status`, method: 'put', data: { status } })
}

export function deleteSettlementRule(id) {
  return request({ url: `/settlement-rules/${id}`, method: 'delete' })
}

export function getSettlementRecordList(params) {
  return request({ url: '/settlement-records', method: 'get', params })
}

export function getSettlementRecordStatistics() {
  return request({ url: '/settlement-records/statistics', method: 'get' })
}

export function getSettlementRecordDetail(id) {
  return request({ url: `/settlement-records/${id}`, method: 'get' })
}

export function addSettlementRecord(data) {
  return request({ url: '/settlement-records', method: 'post', data })
}

export function executeSettlement(id) {
  return request({ url: `/settlement-records/${id}/execute`, method: 'put' })
}

export function retrySettlement(id) {
  return request({ url: `/settlement-records/${id}/retry`, method: 'put' })
}

export function getSettlementExceptionList(params) {
  return request({ url: '/settlement-exceptions', method: 'get', params })
}

export function getSettlementExceptionStatistics() {
  return request({ url: '/settlement-exceptions/statistics', method: 'get' })
}

export function getSettlementExceptionDetail(id) {
  return request({ url: `/settlement-exceptions/${id}`, method: 'get' })
}

export function addSettlementException(data) {
  return request({ url: '/settlement-exceptions', method: 'post', data })
}

export function resolveSettlementException(id, data) {
  return request({ url: `/settlement-exceptions/${id}/resolve`, method: 'put', data })
}

export function ignoreSettlementException(id, data) {
  return request({ url: `/settlement-exceptions/${id}/ignore`, method: 'put', data })
}
