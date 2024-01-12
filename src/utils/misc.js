export const currentDateISOString = () => {
  return new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '_')
    .substring(0, 23);
};
export const generateRandomNumber = () => {
  return Math.round(Math.random() * 1e9);
};

export const uniqueRandomString = () => {
  return `${currentDateISOString()}_${generateRandomNumber()}`;
};

export const jsonTryParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};
