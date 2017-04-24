var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var app = express();

// configure app
app.use(morgan('dev')); // log requests to the console

// config server
var config = require('./config');
var port = process.env.PORT || 4000;
mongoose.connect(config.database);

// Add middleware necessary for REST API's
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS Support
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

// get models
var Post = require('./models/post');

// api routes
var apiRoutes = express.Router();
// middleware to use for all requests
apiRoutes.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// server root
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'welcome to api' });
});

// on routes that end in /posts
apiRoutes.route('/posts')
	// create post
	.post(function(req, res) {
		var requestBody = req.body;
		var post = new Post({
			title: requestBody.title,
			categories: requestBody.categories,
			content: requestBody.content
		});

		console.log('requestBody ', requestBody);
		console.log('post ', post);

		post.save(function(err) {
			if (err) throw err;

			console.log('Post saved successfully');
			res.json({ success: true });
		});
	})

	// get all posts
	.get(function(req, res) {
		Post.find(function(err, posts) {
			if (err) res.send(err);

			res.json(posts);
		});
	});

// on routes that end in /posts/:post_id
apiRoutes.route('/posts/:post_id')
	// get a single post
	.get(function(req, res) {
		Post.findById(req.params.post_id, function(err, post) {
			if (err) res.send(err);

			res.json(post);
		});
	})

	// update single post
	.put(function(req, res) {
		Post.findById(req.params.post_id, function(err, post) {
			var requestBody = req.body;

			if (err) res.send(err);

			post.title = requestBody.title;
			post.categories = requestBody.categories;
			post.content = requestBody.content;

			post.save(function(err) {
				if (err) res.send(err);

				res.json({ message: 'Post updated' });
			});
		});
	})

	// delete single post
	.delete(function(req, res) {
		Post.remove({
			_id: req.params.post_id
		}, function(err, post) {
			if (err) res.send(err);

			res.json({ message: 'Post deleted' });
		});
	});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// start server
app.listen(port);
console.log('server starting in port ' + port);
