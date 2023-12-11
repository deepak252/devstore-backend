const mongoose = require("mongoose");

exports.isMongoId = (val) =>{
    return val && mongoose.Types.ObjectId.isValid(val)
}

exports.paginateQuery = async (query, pageNumber, pageSize) =>{
  const skip = (pageNumber - 1) * pageSize;
  return query.skip(skip).limit(pageSize);
}
