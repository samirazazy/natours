const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // https://stackoverflow.com/questions/57895175/server-discovery-and-monitoring-engine-is-deprecated
    useUnifiedTopology: true
  })
  .then(con => {
    // console.log(con.connection);
    console.log('DB connection successful');
  });

// Read json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);

// Import dsts inti database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data from the database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
