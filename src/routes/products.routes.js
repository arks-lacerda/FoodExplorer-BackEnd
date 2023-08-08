const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../config/upload');

const ProductsController = require('../controllers/ProductsController');
const CategoriesController = require('../controllers/CategoriesController');
const ImageProductController = require('../controllers/ImageProductController');
const isAdmin = require('../middleware/isAdmin');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const productsRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const productsController = new ProductsController();
const categoriesController = new CategoriesController();
const imageProductController = new ImageProductController();

productsRoutes.get('/search/', productsController.index);
productsRoutes.get('/categories/:category', categoriesController.index);
productsRoutes.get('/:id', productsController.show);
productsRoutes.delete('/:id', ensureAuthenticated, productsController.delete);
productsRoutes.put(
  '/edit/:id',
  ensureAuthenticated,
  upload.single('image'),
  isAdmin,
  productsController.update
);
productsRoutes.post(
  '/create',
  ensureAuthenticated,
  upload.single('image'),
  isAdmin,
  productsController.create
);
productsRoutes.patch(
  '/img/:id',
  ensureAuthenticated,
  upload.single('image'),
  isAdmin,
  imageProductController.update
);

module.exports = productsRoutes;
