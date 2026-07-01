/** Map axios / network failures to user-friendly messages. */
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  const serverMsg = data?.error || data?.message;
  if (typeof serverMsg === 'string' && serverMsg.trim()) {
    return serverMsg;
  }

  const status = err?.response?.status;
  if (status === 405) {
    return 'Eligibility service is unavailable on this API host. Please refresh the page or try again in a moment.';
  }
  if (status === 503) {
    return 'Eligibility service is temporarily unavailable. Please try again shortly.';
  }

  const code = err?.code;
  const msg = String(err?.message || '');

  if (code === 'ECONNABORTED' || /timeout/i.test(msg)) {
    return 'Request timed out. The server may be waking up — please wait a moment and try again.';
  }
  if (code === 'ERR_NETWORK' || /network error/i.test(msg)) {
    return 'Could not reach the server. Check your internet connection and try again.';
  }

  return msg || fallback;
}
