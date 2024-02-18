import Project from '../models/project.model.js';
import Banner from '../models/banner.model.js';
import { paginateQuery } from '../utils/mongoUtil.js';
import { handleError } from '../utils/responseUtil.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Logger from '../utils/logger.js';
import { BANNER_CATEGORY } from '../constants.js';
import { SELECTED_FIELDS, POPULATE_OWNER } from '../config/queryFilters.js';

const logger = new Logger('FeaturedController');

export const featuredProjects = async (req, res) => {
  try {
    const pageNumber = 1,
      pageSize = 8;
    // const filter = { isPrivate: false, 'images.0': { $exists: true } }; //images.length>0
    const filter = { isPrivate: false, featureGraphic: { $exists: true } };
    let selectedFields = SELECTED_FIELDS + '  featureGraphic';
    const [apps, websites, games] = await Promise.all([
      paginateQuery(
        Project.find(filter).populate(POPULATE_OWNER).select(selectedFields),
        pageNumber,
        pageSize
      )
      // paginateQuery(
      //   Website.find(filter).populate(POPULATE_OWNER).select(selectedFields),
      //   pageNumber,
      //   pageSize
      // ),
      // paginateQuery(
      //   Game.find(filter).populate(POPULATE_OWNER).select(selectedFields),
      //   pageNumber,
      //   pageSize
      // )
    ]);
    return res.json(new ApiResponse(undefined, { apps, websites, games }));
  } catch (e) {
    logger.error(e, 'featuredProjects');
    return handleError(e, res);
  }
};

export const getBanners = async (req, res) => {
  try {
    const { category = BANNER_CATEGORY.HOME } = req.query;
    const result = await Banner.find({ category });
    return res.json(new ApiResponse(undefined, result));
  } catch (e) {
    logger.error(e, 'getBanners');
    return handleError(e, res);
  }
};

export const createBanner = async (req, res) => {
  try {
    const { image, redirectUrl, redirectPath, category } = req.body;
    let banner = new Banner({
      image,
      redirectUrl,
      redirectPath,
      category
    });
    const error = banner.validateSync();
    if (error) {
      throw new ApiError(error.message);
    }
    banner = await banner.save();
    res.json(new ApiResponse('Banner created successfully', banner));
  } catch (e) {
    logger.error(e, 'createBanner');
    return handleError(e, res);
  }
};
