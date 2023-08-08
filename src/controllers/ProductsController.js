const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class ProductsController {
  async create(request, response) {
    const { title, description, price, categories, ingredients } = request.body;
    const user_id = request.user.id;
    const imageProductFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const filename = await diskStorage.saveFile(imageProductFilename);

    const [product_id] = await knex('Products').insert({
      title,
      description,
      price,
      categories,
      user_id: user_id,
      image: filename,
    });

    const ingredientsInsert = ingredients.split(',').map((name) => {
      return {
        product_id,
        user_id: user_id,
        name,
        categories,
      };
    });

    await knex('Ingredients').insert(ingredientsInsert);

    return response.status(201).json();
  }

  async update(request, response) {
    const { id } = request.params;
    const { title, description, price, categories, ingredients } = request.body;
    const userAuthenticated = request.user.id;
    const imageProductFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const filename = await diskStorage.saveFile(imageProductFilename);

    const product = await knex.select('*').from('Products').where({ id });
    const userCreateProduct = await knex
      .select('user_id')
      .from('Products')
      .where({ id })
      .first();

    const imageProduct = await knex
      .select('image')
      .from('Products')
      .where({ id });

    if (userCreateProduct.user_id !== userAuthenticated) {
      throw new AppError('You are not authorized to edit this product', 401);
    }

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    product.filename = filename ?? product.filename;
    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.categories = categories ?? product.categories;

    await knex('Products').where({ id }).update({
      image: product.filename,
      title: product.title,
      description: product.description,
      price: product.price,
      categories: product.categories,
    });

    // Atualiza os ingredientes
    const ingredientsInsert = ingredients.split(',').map((ingredient) => {
      return {
        product_id: request.params.id,
        user_id: request.user.id,
        name: ingredient,
        categories,
      };
    });

    const ingredientsLength = await knex('Ingredients').where({
      product_id: id,
    });

    if (ingredientsLength.length >= 0) {
      await knex('Ingredients').where({ product_id: id }).delete();
    }

    await knex('Ingredients').insert(ingredientsInsert);

    return response.status(201).json();
  }

  async show(request, response) {
    const { id } = request.params;

    const product = await knex('Products').where('id', id).first();
    const ingredients = await knex('Ingredients')
      .where({ product_id: id })
      .select('name')
      .orderBy('name');

    const convertIngredients = ingredients.map((ingredient) => ingredient.name);
    return response.json({
      product,
      convertIngredients,
    });
  }

  async index(request, response) {
    const { title } = request.query;

    const ingredient = await knex('Products')
      .select(
        'Products.id',
        'Products.title',
        'Products.categories',
        'Products.description',
        'Products.price',
        'Products.image'
      )
      .whereRaw('LOWER(Products.title) LIKE ?', [`%${title.toLowerCase()}%`])
      .innerJoin('Ingredients', 'product_id', 'Products.id')
      .groupBy('Products.id');

    return response.json(ingredient);
  }

  async delete(request, response) {
    const { id } = request.params;
    const userAuthenticated = request.user.id;

    const userCreateProduct = await knex
      .select('user_id')
      .from('Products')
      .where({ id })
      .first();

    if (userCreateProduct.user_id !== userAuthenticated) {
      throw new AppError('You are not authorized to delete this product', 401);
    }

    const deleteProduct = await knex('Products').where({ id }).delete();
    const deleteIngredients = await knex('Ingredients')
      .where('product_id', id)
      .delete();

    return response.json({
      deleteProduct,
      deleteIngredients,
    });
  }
}

module.exports = ProductsController;
