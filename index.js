const express = require('express');
const cors = require('cors');

// from dotenv 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// mongodb to connect
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { application } = require('express');

// middleware 
app.use(cors());
app.use(express.json());



// from mongodb to connect
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.ouqgxt8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });

async function run() {
    try {
        await client.connect()

        const eletricalCollection = client.db('electrical').collection('tools&parts');
        const purchaseCollection = client.db('electrical').collection('purchasedItems');

        // get tools and parts 
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = eletricalCollection.find(query);
            const tools_Parts = await cursor.toArray();
            res.send(tools_Parts)
        });

        // get one tools and parts
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const purchaseItem = await eletricalCollection.findOne(query);
            res.send(purchaseItem);
        });

        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase)
            res.send(result)
        })
    }
    finally {

    }
}

run().catch(console.dir);














// for check 
app.get('/', (req, res) => {
    res.send("Manufacture Server Is Running")
})

app.listen(port, () => {
    console.log("Manufacture Is Listening", port)
})