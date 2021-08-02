const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const server = express();
server.use(cors());
server.use(express.json());

const PORT = process.env.PORT || 4000;

const drink = mongoose.Schema({
  drinkName: String,
  drinkImg: String,
  drinkId: String,
});

const user = mongoose.Schema({
  email: String,
  userDrinks: [drink],
});

const userModel = mongoose.model("drinks", user);

mongoose.connect(
  "mongodb://books:booksDB01@cluster0-shard-00-00.uvjqt.mongodb.net:27017,cluster0-shard-00-01.uvjqt.mongodb.net:27017,cluster0-shard-00-02.uvjqt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-h1qilz-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// let dataSeed = () => {
//   let dena = new userModel({
//     email: "omx302@gmail.com",
//     userDrinks: [
//       {
//         drinkName: "pepsi",
//         drinkImg: "https://m.media-amazon.com/images/I/515Lwr5CyxL.jpg",
//         drinkId: "123",
//       },
//       {
//         drinkName: "pepsi2",
//         drinkImg: "https://m.media-amazon.com/images/I/515Lwr5CyxL.jpg",
//         drinkId: "124",
//       },
//     ],
//   });

//   dena.save();
// };

const homeHandler = (req, res) => {
  res.send("Welcome Home");
};

server.get("/", homeHandler);

const drinksHandler = (req, res) => {
  axios
    .get(
      "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic"
    )
    .then((resultData) => {
      res.send(resultData.data.drinks);
    })
    .catch((error) => {
      res.send(error);
    });
};

server.get("/drinks", drinksHandler);

const addDrinksHandler = (req, res) => {
  let userEmail = req.query.email;
  drinkObj = req.body;
  userModel.find({ email: userEmail }, (error, result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      result[0].userDrinks.push({
        drinkName: drinkObj.strDrink,
        drinkImg: drinkObj.strDrinkThumb,
        drinkId: drinkObj.idDrink,
      });
      result[0].save();
    }
  });
};

server.post("/addDrinks", addDrinksHandler);

const favDrinksHandler = (req, res) => {
  let userEmail = req.query.email;
  userModel.find({ email: userEmail }, (error, result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      res.send(result[0]);
    }
  });
};

server.get("/favDrinks", favDrinksHandler);
// -------------------------------------------------------------------------------

const removefavDrinksHandler = (req, res) => {
  let userEmail = req.query.email;
  let drinkId = req.params.drinkId;

  userModel.find({ email: userEmail }, (error, result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      let index = -1;
      result[0].userDrinks.forEach((ele, idx) => {
        if (ele.drinkId == drinkId) {
          index = idx;
        }
      });

      result[0].userDrinks.splice(index, 1);
      result[0].save();
      res.send(result[0]);
    }
  });
};

server.delete("/removeFavDrinks/:drinkId", removefavDrinksHandler);

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const editfavDrinksHandler = (req, res) => {
  let userEmail = req.query.email;
  let drinkId = req.params.drinkId;

  userModel.find({ email: userEmail }, (error, result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      let index = -1;
      result[0].userDrinks.map((ele, idx) => {
        if (ele.drinkId == drinkId) {
          ele.drinkId = req.body.drinkId;
          ele.drinkName = req.body.drinkName;
          ele.drinkImg = req.body.drinkImg;
        }
        return ele;
      });
      result[0].save();
      res.send(result[0]);
    }
  });
};

server.put("/editFavDrinks/:drinkId", editfavDrinksHandler);

server.listen(PORT, () => console.log(`working fine on ${PORT}`));
