import express from 'express';

const app = express();
app.use(express.json());

app.listen(8081, () => console.log("Server is running..."));
