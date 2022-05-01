const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

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

        //Load all data from database
        //http://localhost:5000/fruits
        app.get("/fruits", async (req, res) => {
            const query = {};
            const cursor = organicCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        });

        //Post data to database
        //http://localhost:5000/fruit
        app.post("/fruit", async (req, res) => {
            const getFruit = req.body;
            const result = await organicCollection.insertOne(getFruit);
            res.send(result);
        });

        //Update data of database
        //http://localhost:5000/fruit/id
        app.put("/fruit/:id", async (req, res) => {
            const id = req.params.id;
            const getFruit = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateFruit = {
                $set: { ...getFruit },
            };
            const result = await organicCollection.updateOne(
                filter,
                updateFruit,
                options
            );
            res.send(result);
        });

        //Delete data from database
        //http://localhost:5000/fruit/id
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
    res.send("Running genius server");
});

app.listen(port, () => {
    console.log("listining to port", port);
});
