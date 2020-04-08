const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // programming or other unknown error: don't leak error details'
  } else {
    // 1) log error
    console.log('Error...', err);

    // 2) swnd geniral error
    res.status(500).json({
      status: 'error',
      message: 'Somthing went worng!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV !== 'production') {
    sendErrorProd(err, res);
  }
};
