const { hash } = require('bcryptjs');
const AppError = require('../utils/AppError');
const knex = require('../database/knex');

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      throw new AppError('All fields are required');
    }

    const checkUserExists = await knex
      .select('*')
      .from('Users')
      .where('email', email)
      .first();

    if (checkUserExists) {
      throw new AppError('This email already exists');
    }

    const hashedPassword = await hash(password, 8);

    await knex('Users').insert({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    response.status(201).json({ name, email, password });
  }
}

module.exports = UsersController;
