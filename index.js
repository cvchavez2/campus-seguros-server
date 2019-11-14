// Import package
var mongodb = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');


//Create Express Service
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Create MongoDB Client
var MongoClient = mongodb.MongoClient;

//Connection URL 27017 is the default port
const uri = "mongodb+srv://cvchavez2:Carlitos.1@ires2019-h1bds.mongodb.net/test?retryWrites=true&w=majority";
//var url = 'mongodb://localhost:27017'

// PORT
const PORT = process.env.PORT || 3000;

//Connect to MongoDB
MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client){
    if (err)
        console.log('Unable to connect to the mongoDB server. Error', err);
    else{

        //Alert; params: latitude, longitude and timestamp in milliseconds
        //Collection: alerts
        app.post('/alert', (request,response, next)=>{
          var post_data = request.body;

          var latitude = post_data.latitude;
          var longitude = post_data.longitude;
          var timestamp = post_data.timestamp;

          var insertJson = {
            'latitude': latitude,
            'longitude':longitude,
            'timestamp': timestamp,
        };
        var db = client.db('ires2019');

          //Insert data
          db.collection('alerts')
          .insertOne(insertJson, function(error, res){
              response.json('Alert Sent');
              console.log('Alert Sent'); 
          })
        });

         //Infrastructure
         app.post('/allReports', (request,response, next)=>{
          var insertJson = formJson(request);

          var db = client.db('ires2019');

            //Insert data
            db.collection('allReports')
            .insertOne(insertJson, function(error, res){
                response.json('Report Sent to allReports');
                console.log('Report Sent to allReports'); 
            })
          });

          function formJson(request){
            var post_data = request.body;
              var category = post_data.category;
              var longitude = post_data.longitude;
              var latitude = post_data.latitude;
              var timestamp = post_data.timestamp;
              var incident = post_data.incident;
              var description = post_data.description;
    
              var json = {
                'category': category,
                'latitude': latitude,
                'longitude':longitude,
                'timestamp':timestamp,
                'incident': incident,
                'description': description,
            };
            return json;
          }

        //GET json data from reports 
        app.get('/reports', (request,response,next)=>{
            var category = request.query.category;
            console.log(category);

            // database name
            var db = client.db('ires2019');

            
            // query reports
            var query = (category == 'all') ? { "category" : /^/ } : {"category" : category};
            console.log(JSON.stringify(query))
            db.collection('allReports').find(query).toArray(function(err, result){
              if (err) throw err;
              response.json(result);
              console.log(result);
            })
            // db.collection('infrastructure').find({},{
            //   projection: {
            //     _id: 0, latitude: 1, longitude: 1, timestamp: 1, incident: 1, description: 1,color: 1 
            //   }
            // }).toArray(function(err, result) {
            //   if (err) throw err;
            //   response.json(result);
            //   console.log('reports retrieved');
            // })
        });

        // GET json data from panic button 
        app.get('/location', (request, response, next)=>{
            var get_data=request.body;
            var db = client.db('pButton');

            db.collection('coordinates').find({}, { projection: {_id: 0, latitud: 1, longitud: 1 } }).toArray(function(err, result) {
                if (err) throw err;
                response.json('coordinates exist');
                console.log(result);            
            })

        });          

        //Start Web Server 3000 is the port where it is connected to the server
        app.listen(PORT,()=>{
            console.log(`Connected to MongoDB Server, WebService running on port ${PORT}`);  
        })
    }
})
