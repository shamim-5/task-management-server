const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yw3qk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db("task_management").collection("task");
    const completedTaskCollection = client.db("task_management").collection("completedTask");

    app.get("/task/:email", async (req, res) => {
      const email = req.params.email;
      const result = await taskCollection.find({ email: email }).toArray();
      res.send(result);
    });
    app.post("/task", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    // completedTask
    app.get("/completedTask/:email", async (req, res) => {
      const email = req.params.email;
      const result = await completedTaskCollection.find({ email: email }).toArray();
      res.send(result);
    });
    app.post("/completedTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await completedTaskCollection.insertOne(query);
      res.send(result);
    });

    // update and insert data
    app.put("/task/:id", async (req, res) => {
      const id = req.params.id;
      const task = req.body;

      const result = await taskCollection.updateOne(
        {
          _id: ObjectId(id),
        },
        { $set: task },
        { upsert: true }
      );
      res.send({ result });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Task management app listening on port ${port}`);
});
