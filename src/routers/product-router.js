import { Router } from 'express';
import is from '@sindresorhus/is';
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
// import { loginRequired } from "../middlewares";
import { productService } from '../services';

const productRouter = Router();

// 상품등록 api (아래는 /register이지만, 실제로는 /api/products 로 요청해야 함.)
productRouter.post('/products', async (req, res, next) => {
  try {
    // Content-Type: application/json 설정을 안 한 경우, 에러를 만들도록 함.
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error('headers의 Content-Type을 application/json으로 설정해주세요');
    }

    // req (request)의 body 에서 데이터 가져오기
    const productName = req.body.productName;
    const price = req.body.price;
    const description = req.body.description;
    const company = req.body.company;
    const category = req.body.category;

    // 위 데이터를 유저 db에 추가하기
    const newProduct = await productService.addProduct({
      productName,
      price,
      description,
      company,
      category,
    });

    // 추가된 상품의 db 데이터를 프론트에 다시 보내줌
    res.status(201).json({
      statusCode: 201,
      message: '상품 등록 성공',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
});

// 전체 상품 목록을 가져옴 (배열 형태임)
productRouter.get('/products', async function (req, res, next) {
  try {
    // 전체 상품 목록을 얻음
    const products = await productService.getProducts();

    // 상품 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json({
      statusCode: 200,
      message: '전체 상품 목록 조회 성공',
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

// 특정 상품의 상세정보 조회
productRouter.get('/products/:productId', async function (req, res, next) {
  try {
    // 특정 id에 맞는 상품 상세정보를 얻음
    const product = await productService.getProduct(req.params.productId);

    // 상품상세정보를 JSON 형태로 프론트에 보냄
    res.status(200).json({
      statusCode: 200,
      message: '상품 정보 조회 성공',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

export { productRouter };
