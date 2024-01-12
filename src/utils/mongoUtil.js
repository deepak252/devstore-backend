import mongoose from 'mongoose';

export const isMongoId = (val) => {
  return val && mongoose.Types.ObjectId.isValid(val);
};

export const isMongooseError = (e) => {
  return e instanceof mongoose.Error;
};

export const paginateQuery = async (query, pageNumber, pageSize) => {
  const skip = (pageNumber - 1) * pageSize;
  return query.skip(skip).limit(pageSize);
};
