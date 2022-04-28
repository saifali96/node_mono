import express from "express";

const app = express();

app.use("/", (req, res) => {
	return res.json("Hello World!");
});

app.listen(8000, () => {
	console.log("Listening at 8000");
});