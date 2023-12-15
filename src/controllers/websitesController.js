const { Website } = require('../models');
const { paginateQuery } = require('../utils/mongoUtil');
const { success, failure } = require('../utils/responseUtil');

exports.getAllWebsites = async (req, res)=>{
  try{
    const {pageSize=2, pageNumber=1} = req.query;
    const filter = {};

    const websites = await paginateQuery(Website.find(filter), pageNumber, pageSize);
    const totalResults = await Website.countDocuments(filter);
   
    res.json(success(undefined,{websites, pageNumber, pageSize, totalResults}));
  }catch(e){
    console.error('Error:getAllWebsites, ', e);
    res.status(400).json(failure(e.message || e));
  }
}