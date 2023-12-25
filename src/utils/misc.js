const currentDateISOString = () => {
  return new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '_')
    .substring(0, 23);
};
const generateRandomNumber = () => {
  return Math.round(Math.random() * 1e9);
};

const uniqueRandomString = () => {
  return `${currentDateISOString()}_${generateRandomNumber()}`;
};

module.exports = {
  currentDateISOString,
  generateRandomNumber,
  uniqueRandomString,
};
