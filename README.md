<img src="https://i.imgur.com/cD5R8OG.png" width="600px;display:inline-block;margin:auto">

# Mongoose - Referencing Related Data

## Learning Objectives

| Students Will Be Able To: |
|---|
| CRUD Data External to the Application |
| Explain the Difference Between 1:M & M:M Relationships |
| Use Referencing to Implement 1:M & M:M Data Relationships |
| "Populate" Referenced Documents |

## Road Map

1. Setup
2. Review the Starter Code
3. Create a CRUD Helper Module
4. Compute the _Average Rating_ of the Reviews
5. The `mongoose-movies` Data Model
6. Referencing _Performers_ in the _Movie_ Model
7. Associating Movies and Performers
8. Essential Questions

## 1. Setup

1. Fork and clone this repo.  
3. `cd` into *u2_lessons_referencing_related_data_with_starter_code* and then *mongoose-movies*
4. `npm i` to install the necessary dependencies for the project to run. 
5.  `touch` a `.env` file
6.  Copy over your `DATABASE_URL` from yesterday's **intro to mongoose** code.`

## 2. Review the Starter Code

The starter code has a few updates from where we left off in the _Mongoose - Embedding Related Data_ lesson:
	
- As you will learn in this lesson, a many-to-many relationship between two data resources such as _movies_ and _performers_, requires that those resources already exist.  Therefore, the functionality to create _performers_ has been implemented to save time. However, rest assured that there is nothing in this code that has not been previously taught

- let's checkout the model, router, controller & view.

- Also, check out how the `newPerformer` controller function to see how we can sort documents.

- The cast-related code that treated `cast` as an array of strings has been removed from templates.

### 👉 You Do - Create a Few Performers <small>(1 min)</small>

Feel free to use these from Star Wars and Caddyshack:

```
Mark Hamill  9/25/1951
Carrie Fisher  10/21/1956
Harrison Ford  7/13/1942
Chevy Chase  10/8/1943
Bill Murray  9/21/1950
```

## 3. Create a CRUD Helper Module

### CRUD Data Externally to the Application

At times you might need to CRUD data "outside" of the application.

Well, that time is now because we need to "reset" all of the movie documents' `cast` property to an empty array.

To do this, we're going to create a **crud-helper.js** module and load it within a Node REPL...

### Create **crud-helper.js**

Although **crud-helper.js** will not run as part of the app, it needs to be able to connect to the database and access the models.

Creating it in the project's root folder makes sense:

```
touch crud-helper.js
```

Copy/paste the following code with comments:

```js
// crud-helper.js

// Used to perform CRUD external to the application

// If the db connection string is in a .env file, we need
// to read in those env variables just like in server.js
require('dotenv').config();
// Connect to the database
require('./config/database');

// Require the app's Mongoose models
const Movie = require('./models/movie');

// Function to clear the cast arrays of all existing movies
async function clearCastArrays() {
  try {
    // Clear the cast arrays of all existing movies
    const result = await Movie.updateMany({}, { cast: [] });
    console.log(result);
  } catch (error) {
    console.error('Error clearing cast arrays:', error);
  }
}

// Directly execute the functions
clearCastArrays();
```

We'll then run the CRUD helper with the following command:

```
node crud-helper.js 
```

## 4. Compute the _Average Rating_ of the Reviews

The demo of the completed mongoose-movies app computed and displayed an _average rating_ for reviews in the movie's detail page:

<img src="https://i.imgur.com/CoFuOOW.png">
	
All it takes is adding some EJS to **views/movies/show.ejs**.

Add the new markup under each comment:

```html
<tbody>
  <!-- Yes, we can define variables! -->
  <% let total = 0 %>
  <% movie.reviews.forEach(function(r) { %>
    <!-- Accumulate the total rating -->
    <% total += r.rating %>
    <tr>
      <td><%= r.createdAt.toLocaleDateString() %></td>
      <td><%= r.content %></td>
      <td><%= r.rating %></td>
    </tr>
  <% }); %>
  <!-- Add a row to display the avg AFTER the forEach iteration  -->
  <tr>
    <td colspan="2"></td>
    <td><strong><%= (total / movie.reviews.length).toFixed(1) %></strong></td>
  </tr>
</tbody>
```

Cool!

<img src="https://i.imgur.com/pK21nxL.png">

Although we just used the amazing power of EJS, typically it's the controller's responsibility to gather/compute data and pass it to views to be rendered.

<details>
<summary>
👀 Do you need to sync your code?
</summary>
<hr>

**`git reset --hard origin/sync-12-avg-rating`**

<hr>
</details>

## 5. The `mongoose-movies` Data Model

We are going to implement the following data relationship:

**`Movie >--< Performer`** (Many-To-Many)<br>
**_A Movie has many Performers; A Performer has many Movies_**

However, unlike we saw with _Reviews_ (One-To-Many), multiple Movies can reference the same Performer creating a Many-To-Many relationship.  Here's a simplified example:

<img src="https://i.imgur.com/hzoRC2y.png" width="100%">

### Entity-Relationship-Diagram (ERD)

As part of the planning for your future projects, you'll need to plan the data model and document it with an Entity-Relationship-Diagram (ERD).

Here's an ERD that documents the final data model for mongoose-movies:

<img src="https://i.imgur.com/CVTFHMJ.png" width="100%">

## 6. Referencing _Performers_ in the _Movie_ Model

Let's update the `cast` property in the `Movie` model (**models/movie.js**) to hold the `ObjectId`s of performer documents:

```js
reviews: [reviewSchema],
// Refactor from [String]
cast: [{
  type: Schema.Types.ObjectId,
  ref: 'Performer'
}],
```

The property type of `ObjectId` (or an array of `ObjectId`s) **is always** used to implement **referencing**.

The `ref: 'Performer'` informs the unicorn of Mongoose methods, [populate()](https://mongoosejs.com/docs/populate.html), which model's documents to use to replace the `ObjectId`s with. 

### Contrasting One-to-Many (1:M) and Many-to-Many (M:M) Relationships

The key difference between a `1:M` and a `M:M` relationship:

- In a `1:M` relationship, each of the **many** (child) documents belongs to only **one** (parent) document. Each time we want add a new relationship - **the child document must be created**.
- In a `M:M` relationship, **existing** documents are referenced and the same document can be referenced over and over. New documents are created only if it's the first of its kind. 

### Many:Many CRUD

So, before a many-to-many relationship can be created between two documents (often called an **association**), those two documents must first exist.

This requires that the app first provide the functionality to create the two resources independent of each other.

Then, creating the association is a matter of adding the `ObjectId` to an array on the other side of the relationship.

The array property can be on either side (even both, but that's not usually recommended).  Usually, the app's functionality reveals which side makes more sense.  For example, the viewing of a movie with its performers is slightly easier to code by putting the `cast` array on the `Movie` Model vs. a `movies` array on the `Performer` Model.

### ❓ Review Questions

<details>
<summary>
(1) What property type is used in schemas to reference other documents?
</summary>
<hr>

```
ObjectId
```

<hr>
</details>

<details>
<summary>
(2) True or False:  Assuming the <code>Movie >---< Performer</code> relationship, when associating a "performer" document with a "movie" document, both documents must already exist in the database.
</summary>
<hr>

**True**

<hr>
</details>

## 7. Associating Movies and Performers

Now that we've refactored the `cast` property in `movieSchema`, we're ready to implement the M:M relationship between _movies_ and _performers_.

But first, a quick refactor...

### 👉 You Do - Redirect to Movie `show` Functionality <small>(1 min)</small>

Currently, when a new movie is created the user is being redirected to the movies' `index` functionality...

#### _AAU, after adding a movie, I want to see its details page_

1. Implement the above user story.

> 👀 Hint: What controller function is doing the creating? 

<details>
<summary>
Solution (try not to peek)
</summary>
<hr>

```js
// controllers/movies.js

async function create(req, res) {
  ...
  try {
    // Update this line because now we need the _id of the new movie
    const movie = await Movie.create(req.body);
    // Redirect to the new movie's show functionality 
    res.redirect(`/movies/${movie._id}`);
  } catch (err) {
  ...
```
Be sure to use a template literal (backticks)

<hr>
</details>

Refactoring the redirect is done! Now for some fun!

### _AAU, when viewing a movie's detail page, I want to see a list of the cast's performers' name and birth date_

Thinking about what it's going to take to implement the above user story, answer the following questions...

<details>
<summary>
❓ Do movie documents have a <code>cast</code> array?
</summary>
<hr>

**Yes**

<hr>
</details>

<details>
<summary>
❓ Currently, will the movie document being passed to <strong>show.ejs</strong> contain the performers' names and birth dates in the <code>cast</code> array?
</summary>
<hr>

**No** it will contain only the `ObjectId` of the related performers' documents.

<hr>
</details>

<details>
<summary>
❓ What's the name of the Mongoose method used replace the ObjectIds with the performers' documents?
</summary>
<hr>

`populate()`, the unicorn of Mongoose

<hr>
</details>

#### Using `populate()` to Replace `ObjectId`s with the Actual Performer Docs

Let's refactor the `moviesCtrl.show` action so that the movie will have its _performer_ documents populated in its `cast` array instead of `ObjectId`s:

```js
// controllers/movies.js

async function show(req, res) {
  // Populate the cast array with performer docs instead of ObjectIds
  const movie = await Movie.findById(req.params.id).populate('cast');
  res.render('movies/show', { title: 'Movie Detail', movie });
}
```

We can populate documents by chaining the `populate` method after any query.

<details>
<summary>
❓ How does the <code>populate()</code> method know which model's documents to use to replace the <code>ObjectId</code>s with?
</summary>
<hr>

The `ref` property in the schema, for example:

```js
cast: [{
  type: Schema.Types.ObjectId,
  ref: 'Performer'
}],
```

<hr>
</details>

#### Update `movies/show.ejs` to Render the Cast

There are comments to help us find the proper place to refactor **show.ejs**.

It's a great opportunity to use the `map()` method and then join transformed array's strings.

We'll review the code while we type:

```html
<!-- movies/show.ejs -->

<div><%= movie.nowShowing ? 'Yes' : 'Nope' %></div>
<!-- start cast list -->
<div>Cast:</div>
<ul>
  <%= movie.cast.map(renderCastMember).join('') %>
</ul>
<!-- end cast list -->

<% function renderCastMember(castMember) { %>
  <li>
    <%= castMember.name %> 
    <small><%= castMember.born.toLocaleDateString() %></small>
  </li>
<% } %>
```

> 👀 The raw output EJS tag (`<%-`) avoids the HTML tags from being escaped resulting in them displaying as text.

Cool, but we're not going to be able to see it in action until we implement the next user story...

<details>
<summary>
👀 Do you need to sync your code?
</summary>
<hr>

**`git reset --hard origin/sync-13-cast-refactor`**

<hr>
</details>

### _AAU, when viewing a movie's detail page, I want to be able to add a new performer to the list_

Thinking about the steps necessary to implement the above user story:

- We will use a `<form>` to send an HTTP request used to to associate a performer and movie on the server.
- The `<form>` will include a `<select>` dropdown to include the selected performer's `_id` in the payload of the request. 
- The movies controller's `show` function will provide the list of performers used to render the `<option>` tags for the dropdown, however, we only want to include the performers in the dropdown that are not already in the cast!

Let's do this - here's our wireframe:

<img src="https://i.imgur.com/Zg0pCYa.png">

#### Passing the _Performers_ for the `<select>` Dropdown

Currently, the `moviesCtrl.show` function is just passing the `movie`, but now it also needs to query for the _performers_ that are not already associated with the `movie` and pass them to **show.ejs** as well.

First, we're going to need to access the `Performer` model, so require it at the top of **controllers/movies.js**:

```js
const Movie = require('../models/movie');
// require the Performer model
const Performer = require('../models/performer');
```
	
Now we're ready to refactor the `show` action, we'll review as we refactor the code:

```js
async function show(req, res) {
  // Populate the cast array with performer docs instead of ObjectIds
  const movie = await Movie.findById(req.params.id).populate('cast');
  // Mongoose query builder approach to retrieve performers not the movie:
    // Performer.find({}).where('_id').nin(movie.cast)
  // The native MongoDB approach uses a query object to find 
  // performer docs whose _ids are not in the movie.cast array like this:
  const performers = await Performer.find({ _id: { $nin: movie.cast } }).sort('name');
  console.log(performers);
  res.render('movies/show', { title: 'Movie Detail', movie, performers });
}
```

> 👀 Refer to MongoDB's [$nin operator](https://www.mongodb.com/docs/manual/reference/operator/query/nin/) docs for more info.

The `console.log` will show we are retrieving the _performers_ - a good baby step at this point. 

#### Render the `<form>` in **movies/show.ejs**

Again, there are comments to help us as we refactor **show.ejs** to render

```html
<!-- movies/show.ejs -->
	
<!-- add to cast form below this comment -->
<form id="add-per-to-cast" action="???" method="POST">
  <select name="performerId">
    <!-- Emit an option for each performer -->
    <%- performers.map(p => 
      `<option value="${p._id}">${p.name}</option>`
    ).join('') %>
  </select>
  <button type="submit">Add to Cast</button>
</form>
```

We'll come back and update the `action` attribute after we determine the proper route.

Now let's add this bit of CSS to end of **public/stylesheets/style.css** to tidy up the cast list:

```css
#show-page ul {
  margin: 0 0 2rem;
  padding: 0;
  list-style: none;
}
	
#show-page li {
  font-weight: bold;
}
```

#### Identify the Proper Route to Perform the Association

Let's check out the [Routing Guide](https://gist.github.com/jim-clark/17908763db7bd3c403e6) to find the endpoint (keep looking...).

The route is RESTful for adding an association between a movie and a performer but it's up to us to think of a good name for that action.

Note that there are two proper routes, however, the one that matches our scenario where the id of the performer is being sent in the payload of the request, is this one:

```
POST /movies/:id/performers
```

Remember, you can call the `:id` route parameter something like `:movieId` if it helps avoid confusion.

#### 👉 You Do - Update the `<form>`'s `<action>` Attribute (1 min)

- Now that the proper route has been identified, update the `action="???"` in the Add to Cast `<form>`.

<details>
<summary>
Solution (try not to peek)
</summary>
<hr>

```html
<form id="add-per-to-cast" action="/movies/<%= movie._id %>/performers" method="POST">
```

<hr>
</details>

#### Add the Route for the _Add to Cast_ `<form>` Post

We could add the route and controller function used to perform the association in either resource's modules, but we'll go with _performers_ because it's not as crowded:

In **routes/performers.js**:

```js
// POST /movies/:id/performers
router.post('/movies/:id/performers', performersCtrl.addToCast);
```
`addToCast` - not a bad name!

Last step coming up!

#### Code the `addToCast` Controller Action

All that's left is to code the `addToCast` controller function:

```js
// controllers/performers.js
	
module.exports = {
  new: newPerformer,
  create,
  addToCast
};
	
async function addToCast(req, res) {
  const movie = await Movie.findById(req.params.id);
  // The cast array holds the performer's ObjectId (referencing)
  movie.cast.push(req.body.performerId);
  await movie.save();
  res.redirect(`/movies/${movie._id}`);
}
```

Reads like a book!

##### We Did It!

<img src="https://i.imgur.com/xMxqpWE.png">

That was fun!

<details>
<summary>
👀 Do you need to sync your code?
</summary>
<hr>

**`git reset --hard origin/sync-14-finish-referencing`**

<hr>
</details>

## 8. ❓ Essential Questions

```js
const bookSchema = new Schema({
  authors: [{type: Schema.Types.ObjectId, ref: 'Author'}],
  ...
```

<details>
<summary>
(1) True or False:  Assuming the above <code>bookSchema</code>, the <code>authors</code> property would properly implement a <code>Book >--< Author</code> relationship.
</summary>
<hr>

**True**

<hr>
</details>

<details>
<summary>
(2) Describe the difference between 1:M & M:M relationships.
</summary>
<hr>

**In a 1:M relationship, the "child" document belongs to only one parent and we have to create that dedicated child document.**

**However, in a M:M relationship, we are associating existing documents and they can have/belong to any number of documents.**

<hr>
</details>

<details>
<summary>
(3) What's the name of the Mongoose method used to replace an <code>ObjectId</code> with the document it references?
</summary>
<hr>

```js
populate()
```

<hr>
</details>

## References

- [MongooseJS Docs - Populate](https://mongoosejs.com/docs/populate.html)

- [MongooseJS Docs - Queries](https://mongoosejs.com/docs/queries.html)



