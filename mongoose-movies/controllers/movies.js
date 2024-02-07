const Movie = require('../models/movie');
const Performer = require('../models/performer');

module.exports = {
  index,
  show,
  new: newMovie,
  create
};

async function index(req, res) {
  console.log("this is the logged in user", req.user)
  const movies = await Movie.find({});
  res.render('movies/index', { title: 'All Movies', movies });
}

async function show(req, res) {
  const movie = await Movie.findById(req.params.id).populate('cast');
  const performers = await Performer.find({});
  const movieCast = movie.cast;
  //create a new array of just the names from the movieCast
  const castNames = movieCast.map((castMember) => castMember.name);
   
  const availablePerformers = performers.filter((performer)=> {
    console.log(typeof performer._id)
    if(!castNames.includes(performer.name)) {
      return performer;
    }
  })
  res.render('movies/show', { title: 'Movie Detail', movie, availablePerformers });
}

function newMovie(req, res) {
  // We'll want to be able to render an  
  // errorMsg if the create action fails
  res.render('movies/new', { title: 'Add Movie', errorMsg: '' });
}

async function create(req, res) {
  // convert nowShowing's checkbox of nothing or "on" to boolean
  req.body.nowShowing = !!req.body.nowShowing;
  // Remove empty properties so that defaults will be applied
  for (let key in req.body) {
    if (req.body[key] === '') delete req.body[key];
  }
  try {
    await Movie.create(req.body);
    // Always redirect after CUDing data
    // We'll refactor to redirect to the movies index after we implement it
    res.redirect('/movies');  // Update this line
  } catch (err) {
    // Typically some sort of validation error
    console.log(err);
    res.render('movies/new', { errorMsg: err.message });
  }
}