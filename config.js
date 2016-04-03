var config={}

config.ip = process.env.IP || 'localhost';
config.port = process.env.PORT || 3000;
config.mongoUrl = 'mongodb://localhost:27017/uomcollab';
//config.mongoUrl = "mongodb://test:test@ds043062.mongolab.com:43062/uomcollab"
config.basePath = 'views/';

module.exports = config;