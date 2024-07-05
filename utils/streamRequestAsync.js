export function streamRequestAsync({
  options, formData, onProgress,
}) {
  return new Promise((resolve, reject) => {
    let prevResponseLength = 0;
    const { method, url } = options;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function res() {
      if (this.readyState === 4) {
        resolve(this.responseText);
      }
    });

    xhr.addEventListener('progress', () => {
      const respText = xhr.response.substr(prevResponseLength);
      prevResponseLength = xhr.response.length;
      onProgress(respText);
    });

    xhr.addEventListener('error', (err) => {
      reject(err);
    });

    xhr.open(method, url);
    // xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    xhr.send(formData);
  })
