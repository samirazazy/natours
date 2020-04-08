const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatuers');
const CatchAsync = require('./../utils/catchAsync');

exports.aslisTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAvarage,price';
  req.query.fields = 'name, price, ratingAvarage, summary, difficulty';
  next();
};

exports.getAllTours = CatchAsync(async (req, res, next) => {
  const featuers = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitFielsd()
    .pagination();

  const tours = await featuers.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = CatchAsync(async (req, res, next) => {
  const tours = await Tour.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      tours
    }
  });
});

exports.createTour = CatchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: { tour }
  });
});

exports.deleteTour = CatchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = CatchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantaty' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

exports.getMonthelyPlan = CatchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStart: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});
