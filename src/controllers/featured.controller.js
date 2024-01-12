import App from '../models/App.js';
import Banner from '../models/Banner.js';
import { paginateQuery } from '../utils/mongoUtil.js';
import { BadRequestError } from '../utils/errors.js';
import { success, handleError } from '../utils/responseUtil.js';
import Logger from '../utils/logger.js';
import { BANNER_CATEGORY } from '../config/constants.js';
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
        App.find(filter).populate(POPULATE_OWNER).select(selectedFields),
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
    return res.json(success(undefined, { apps, websites, games }));
  } catch (e) {
    logger.error(e, 'featuredProjects');
    return handleError(e, res);
  }
};

export const getBanners = async (req, res) => {
  try {
    const { category = BANNER_CATEGORY.HOME } = req.query;
    const result = await Banner.find({ category });
    return res.json(success(undefined, result));
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
      throw new BadRequestError(error.message);
    }
    banner = await banner.save();
    res.json(success('Banner created successfully', banner));
  } catch (e) {
    logger.error(e, 'createBanner');
    return handleError(e, res);
  }
};
