const path = require('path');
const express = require('express');
const zipdb = require('zippity-do-dah');
const ForecastIO = require('forecastio');

const app = express();
const weather = new ForecastIO('017240cacc4d34b5bffd160d2855f22e');

//Serves static files
app.use(express.static(path.resolve(__dirname, 'public')));

//Using EJS template engine
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

// base route
app.get('/', function(req, res) {
	res.render('index');
});

app.get(/^\/(\d{5})$/, function(req, res, next) {
	const zipcode = req.params[0];
	const location = zipdb.zipcode(zipcode);
	if (!location.zipcode) {
		next();
		return;
	}

	const latitude = location.latitude;
	const longitude = location.longitude;
	weather.forecast(latitude, longitude, function(err, data) {
		if (err) {
			next();
			return;
		}
		res.json({
			zipcode,
			temperature: data.currently.temperature
		});
	});
});

//404 handler
app.use(function(req, res) {
	res.status(404).render('404');
});

app.listen(3000);