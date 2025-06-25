const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors())
app.use(express.json());

const rootRouter  = require("./routes/index");

app.use("/api/v1", rootRouter);
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});