const Performer = require('../models/performer');
const Movie = require('../models/movie');

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

const addToCast = async(req, res) => {
  try {
    //find the movie that I want to add the performers to 
    const movie = await Movie.findById(req.params.id);
    //added the id of the performer I selected to the cast field on the movie document
    movie.cast.push(req.body.performerId);
    //save the changes made to the movie
    await movie.save()
    //redirect to the show page for the movie
    res.redirect(`/movies/${movie._id}`);
  } catch(error) {
    console.log(error);
    res.redirect('/movies');
  } 
}

module.exports = {
  new: newPerformer,
  create,
  addToCast
};
