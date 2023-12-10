const { successMessage } = require('../utils/responseUtil');

exports.getAllApps = async (req, res)=>{
  try{
    res.json(successMessage('Success'));
  }catch(e){
    console.error('Error: getAllApps');
  }
}

exports.getAppById = async (req, res)=>{
  try{
    res.json(successMessage('Success'));
  }catch(e){
    console.error('Error: getAppById');
  }
}
