export const delay = async (req, res, next) => {
  await wait(1000);
  next();
};

const wait = async (ms) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, ms)
  );
