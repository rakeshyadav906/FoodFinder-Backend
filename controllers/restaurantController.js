const Restaurant = require("../models/Restaurant");

exports.getRestaurants = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search && search.trim() !== "") {
      const searchText = search.trim();

      filter = {
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { location: { $regex: searchText, $options: "i" } },
          { type: { $regex: searchText, $options: "i" } }
        ]
      };
    }

    const restaurants = await Restaurant.find(filter);

    res.json(restaurants);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

