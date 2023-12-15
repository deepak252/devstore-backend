const { App } = require('../models');
const { paginateQuery } = require('../utils/mongoUtil');
const { success, failure } = require('../utils/responseUtil');
const util = require('util')
const ApkReader = require('adbkit-apkreader')

exports.getAllApps = async (req, res)=>{
  try{
    const {pageSize=2, pageNumber=1} = req.query;
    const filter = {};

    const apps = await paginateQuery(App.find(filter), pageNumber, pageSize);
    const totalResults = await App.countDocuments(filter);
   
    res.json(success(undefined,{apps, pageNumber, pageSize, totalResults}));
  }catch(e){
    console.error('Error:getAllApps, ', e);
    res.status(400).json(failure(e.message || e));
  }
}

exports.getAppById = async (req, res)=>{
  try{
    res.json(success('Success'));
  }catch(e){
    console.error('Error: getAppById');
  }
}

exports.createApp = async (req, res)=>{
  try{
    const {name, description, icon} = req.body;
    let app = new App({
      name,
      description,
      icon
    })

    ApkReader.open('just-note.apk')
      .then(reader => reader.readManifest())
      .then(manifest => console.log(util.inspect(manifest, { depth: null })));

    // const error = app.validateSync();
    // if(error){
    //   throw error;
    // }
    // app = await app.save()
    res.json(success('App created successfully', {app}));
  }catch(e){
    console.error('Error: createApp, ', e);
    res.status(400).json(failure(e.message || e));
  }
}