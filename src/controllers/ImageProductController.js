const knex = require('../database/knex');
const DiskStorage = require('../providers/DiskStorage');

class ImageProductController {
  async update(request, response) {
    const product_id = request.params.id;
    const imageProductFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const product = await knex('Products').where({ id: product_id }).first();

    if (product.image) {
      await diskStorage.deleteFile(product.image);
    }

    const filename = await diskStorage.saveFile(imageProductFilename);
    product.image = filename;

    await knex('Products').update(product).where({ id: product_id });

    return response.json(product);
  }
}

module.exports = ImageProductController;
