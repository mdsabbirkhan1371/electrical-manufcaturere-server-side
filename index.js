const express = require('express');
const cors = require('cors');

// jwt token 
var jwt = require('jsonwebtoken');

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

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).send({ message: "unAuthorized Access" })
    }
    const token = authHeader.split(' ')[1]

    // verify a token symmetric
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
    });

}
// admin api verify 
const verifyAdmin = async (req, res, next) => {

    if (requesterAccount.role === 'admin') {
        next();
    }
    else {
        res.status(403).send({ message: 'forbidden' });
    }
}

async function run() {
    try {
        await client.connect()

        const eletricalCollection = client.db('electrical').collection('tools&parts');
        const purchaseCollection = client.db('electrical').collection('purchasedItems');
        const userCollection = client.db("electrical").collection("users");
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

        // get all my purchase
        app.get('/purchase', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const purchases = await purchaseCollection.find(query).toArray();
            res.send(purchases);

        })





        // first step to jwt 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true }
            const updateDocs = {
                $set: user,
            }
            const result = await userCollection.updateOne(filter, updateDocs, options)
            // jwt 
            const token = jwt.sign({ email: email },
                process.env.ACCESS_TOKEN, {
                expiresIn: '1hr'
            })

            res.send({ result, token })
        })

        // all users 

        app.get('/alluser', async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        });

        // make an admin api 
        app.put('/alluser/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // check admin if not then not allow to make an admin 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        });
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