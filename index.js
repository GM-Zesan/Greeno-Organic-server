const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//verify token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.288lx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const organicCollection = client
            .db("organicFruit")
            .collection("fruits");

        // For using JWT
        app.post("/login", (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d",
            });
            res.send({ token });
        });

        //Load all data from database
        //http://localhost:5000/fruits
        app.get("/fruits", async (req, res) => {
            const query = {};
            const cursor = organicCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        });

        //personal data (Indevidually) by email
        app.get("/myproducts", verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email };
                const cursor = organicCollection.find(query);
                const myproduct = await cursor.toArray();
                res.send(myproduct);
            } else {
                res.status(403).send({ message: "Forbidden access" });
            }
        });

        //Load a single data for a perticular id
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await organicCollection.findOne(query);
            res.send(product);
        });

        //Post data to database
        app.post("/fruit", async (req, res) => {
            const getFruit = req.body;
            const result = await organicCollection.insertOne(getFruit);
            res.send(result);
        });

        
        //Update quntity
        app.put("/fruit/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const newQuantity = req.body;
            const options = { upsert: true };
            const updateFruit = {
                $set: { quantity: newQuantity.quantity },
            };
            const result = await organicCollection.updateOne(
                filter,
                updateFruit,
                options
            );
            res.send(result);
        });



        //Delete data from database
        app.delete("/fruit/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await organicCollection.deleteOne(query);
            res.send(result);
        });
    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Running my server");
});

app.listen(port, () => {
    console.log("listining to port", port);
});
