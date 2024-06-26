import express from "express";
import router from "./routes";
import DBConnect from "./connectDB";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
app.use("/", router);
const db = new DBConnect();
db.connectDB()
  .then(async () => {
    return await db.queryScript(`Select version()`);
  })
  .then(async (res) => {
    console.log(res.getResult());
    res.disconnectDB();
  });
