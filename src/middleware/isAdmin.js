const knex = require('../database/knex');
const AppError = require('../utils/AppError');

const isAdmin = async (request, response, next) => {
  try {
    const userId = request.user.id;

    const user = await knex('Users').where({ id: userId }).first();

    if (!user || !user.isAdmin) {
      return response.status(403).json({
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  } catch {
    throw new AppError('Internal server error', 500);
  }
};

module.exports = isAdmin;
