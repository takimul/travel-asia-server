const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rfr5aqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const spotCollection = client.db("spotDB").collection("spotCollection");
        const userCollection = client.db("userDB").collection("userCollection");

        app.get('/spots',async (req, res) => {
            const cursor = spotCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/spots/:id',async (req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const spot = await spotCollection.findOne(query);
            res.send(spot);
        })

        app.put('/spots/:id',async (req, res) => {
            const id = req.params.id;
            const query = { _id : new ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = req.body;
            const spot = {
                $set: {
                    image: updateDoc.image,
                    spot: updateDoc.spot,
                    country: updateDoc.country,
                    location: updateDoc.location,
                    description: updateDoc.description,
                    cost: updateDoc.cost,
                    seasonality: updateDoc.seasonality,
                    travelTime: updateDoc.travelTime,
                    visitor: updateDoc.visitor,
                },
            }

            const result = await spotCollection.updateOne(query, spot, options);
            res.send(result);
        })

        app.delete('/spots/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
            const result = await spotCollection.deleteOne(query)
            res.send(result);
        })


        app.post('/spots',async(req, res) => {
            const newSpot = req.body;      
            const result = await spotCollection.insertOne(newSpot);
            res.send(result);
        })

        // User Section 
        app.post('/users', async(req, res) => {
            const userInfo = req.body;
            const result = await userCollection.insertOne(userInfo);
            res.send(result);

        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("App is running");
})

app.listen(port,() => {
    console.log(`App is listening on ${port}`);
});
