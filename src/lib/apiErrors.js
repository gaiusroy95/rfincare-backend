/** Map axios / network failures to user-friendly messages. */
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const serverMsg = err?.response?.data?.error;
  if (typeof serverMsg === 'string' && serverMsg.trim()) {
    return serverMsg;
  }

  const code = err?.code;
  const msg = String(err?.message || '');

  if (code === 'ECONNABORTED' || /timeout/i.test(msg)) {
    return 'Request timed out. The server may be waking up or OTP delivery is slow — please wait a moment and try again.';
  }
  if (code === 'ERR_NETWORK' || /network error/i.test(msg)) {
    return 'Could not reach the server. Check your internet connection and try again.';
  }

  return msg || fallback;
}
