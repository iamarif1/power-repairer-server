const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfohb.gcp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());


const port = 4000;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const servicesCollection = client.db("powerRepairer").collection("services");
  const reviewCollection = client.db("powerRepairer").collection("reviews");
  const adminCollection = client.db("powerRepairer").collection("admin");
  const orderCollection = client.db("powerRepairer").collection("orders");


  //SERVICES
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    servicesCollection.insertOne({ name, price, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/services", (req, res) => {
      servicesCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })

  //REVIEWS
app.post("/addReview", (req, res) => {
  const name = req.body.name;
  const description = req.body.description;

  reviewCollection.insertOne({ name, description }).then((result) => {
    res.send(result.insertedCount > 0);
  });
}); 

app.get("/reviews", (req, res) => {
  reviewCollection.find({})
  .toArray((err, documents) => {
    res.send(documents);
  })
})
//ADMIN
app.post("/addAdmin", (req, res) => {
  const email = req.body.email;

  adminCollection.insertOne({ email }).then((result) => {
    res.send(result.insertedCount > 0);
  });
});
//isAdmin
app.post("/isAdmin",(req, res) => {
  const email = req.body.email;
  adminCollection.find({email: email})
  .toArray((err, documents) =>{
    res.send(documents.length > 0)
  })
}) 

//SingleService

app.get("/services/:id", (req, res) => {
  servicesCollection.find({_id: ObjectId(req.params.id)})
  .toArray((err, documents) => {
    res.send(documents[0])
  })
})

//addOrder
app.post("/addOrder", (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const email = req.body.email;
  const service = req.body.service;

  orderCollection.insertOne({ name, price, email, service }).then((result) => {
    res.send(result.insertedCount > 0);
  });
}); 
app.get("/orders", (req, res) => {
  orderCollection.find({})
  .toArray((err, documents) =>{
    res.send(documents)
  })
})

//DeleteService

app.delete("/delete/:id", (req, res) => {
  const id = ObjectId(req.params.id)
  console.log('delete this', id)
  servicesCollection.deleteOne({_id: id})
  .then(result => {
    console.log(result)
  })

})

});


app.get("/", (req, res) => {
  res.send("Hello Database is working!!");
});


  app.listen(process.env.PORT || port);