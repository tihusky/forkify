import { TIMEOUT_SEC } from './config.js';
import TimeoutError from './timeoutError.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(
        new TimeoutError(`Request took too long! Timeout after ${s} second(s)`)
      );
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  let res;

  if (!uploadData) {
    res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
  } else {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    };

    res = await Promise.race([fetch(url, options), timeout(TIMEOUT_SEC)]);
  }

  const data = await res.json();

  if (!res.ok) throw new Error(`${data.message} (${res.status})`);

  return data;
};
