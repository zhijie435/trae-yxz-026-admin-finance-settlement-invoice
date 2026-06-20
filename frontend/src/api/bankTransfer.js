import request from '../utils/request';

export function getBankTransferList(params) {
  return request({ url: '/bank-transfers', method: 'get', params });
}

export function getBankTransferStatistics() {
  return request({ url: '/bank-transfers/statistics', method: 'get' });
}

export function getBankTransferDetail(id) {
  return request({ url: `/bank-transfers/${id}`, method: 'get' });
}

export function createBankTransfer(data) {
  return request({ url: '/bank-transfers', method: 'post', data });
}

export function updateBankTransfer(id, data) {
  return request({ url: `/bank-transfers/${id}`, method: 'put', data });
}

export function deleteBankTransfer(id) {
  return request({ url: `/bank-transfers/${id}`, method: 'delete' });
}

export function approveBankTransfer(id, data) {
  return request({ url: `/bank-transfers/${id}/approve`, method: 'put', data });
}

export function rejectBankTransfer(id, data) {
  return request({ url: `/bank-transfers/${id}/reject`, method: 'put', data });
}
