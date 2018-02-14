const promisify = fun => (...args) =>
  new Promise((resolve, reject) => {
    try {
      fun(...args, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });

export default promisify;
