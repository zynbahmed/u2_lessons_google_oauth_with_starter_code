const Performer = require('../models/performer');
const Movie = require('../models/movie');

module.exports = {
  new: newPerformer,
  create
};

async function newPerformer(req, res) {
  //Sort performers by their name
  const performers = await Performer.find({}).sort('name');
  res.render('performers/new', { title: 'Add Performer', performers });
}

async function create(req, res) {
  try {
    await Performer.create(req.body);
  } catch (err) {
    console.log(err);
  }
  res.redirect('/performers/new');
}