const knex = require('../database/knex');

class CategoriesController {
  async index(request, response) {
    const { category } = request.params;

    const products = await knex('Products').where({ categories: category });
    const ingredients = await knex('Ingredients')
      .where({ categories: category })
      .orderBy('name');

    return response.json({ products, ingredients });
  }
}

module.exports = CategoriesController;
