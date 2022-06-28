import { Router } from 'express';
import { productService } from '../services';
const searchRouter = Router();

// 상품 이름으로 상품 검색 (/api/serach)
searchRouter.get('/', async function (req, res, next) {
  try {
    // 페이지네이션
    // url 쿼리에서 page, perPage 받기
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 9);
    const { keyword } = req.query;
    // keyword에 맞는 상품 리스트 얻음
    const { products, total, totalPage } = await productService.searchByProductName(keyword, page, perPage);
    res.status(200).json({
      status: 200,
      message: `${keyword} 검색 성공`,
      data: {
        totalPage: totalPage,
        productCount: total,
        products,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { searchRouter };
