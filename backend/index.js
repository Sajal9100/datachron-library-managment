const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const {errorHandler} = require("./middleware/ErrorHandler.middleware")
const { PrismaClient }  = require("./generated/prisma");
const cors  = require("cors");

app.use(cors());
const prisma  = new PrismaClient();

app.use(express.json());

app.get( "/",( (_,res)=> {
    res.send("server is healthy")
}))


app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);




app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is running at ${PORT}`)
})
