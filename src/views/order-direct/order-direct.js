import * as Api from '/api.js';
import { getNode, addCommas } from '../../useful-functions.js';
// elements
const productsContainer = getNode('#products-container');
const totalCostElement = getNode('#total-cost');
const nameInput = getNode('#name');
const postalCodeInput = getNode('#postal-code');
const address1 = getNode('#address1');
const address2 = getNode('#address2');
const phoneInput = document.querySelectorAll('.phone');
const payButton = getNode('#pay-button');
const nameValidateMsg = getNode('#name-msg');
const addressValidateMsg = getNode('#postal-code-msg');
const phoneValidateMsg = getNode('#phone-msg');
const defaultAddressInput = getNode('#default-address');
const newAddressInput = getNode('#new-address');
const setDefaultAddress = getNode('#set-default-address');

const productUrl = window.location.search.split('=');
const productCount = productUrl[2];
const productId = productUrl[1].split('&')[0];

let productInfo;
async function getProductInfo(productId) {
  const res = await Api.getNoToken(`/api/products/${productId}`);
  productInfo = res.data;

  let markUp = '';
  markUp += `
  <div class="product-wrap">
    <div class="product-image-wrap">
      <img src="${productInfo.image}" alt="상품 사진" />
    </div>
    <div class="product-info-wrap">
      <div>상품명: ${productInfo.productName}</div>
      <div>수량: ${productCount}</div>
      <div>상품구매금액: ${addCommas(productInfo.price * productCount)}원</div>
    </div>
  </div>
`;

  productsContainer.innerHTML = markUp;
  totalCostElement.innerText = `${addCommas(productInfo.price * productCount)}원`;
  payButton.innerText = `${addCommas(productInfo.price * productCount)}원`;
  payButton.innerText = `${addCommas(productInfo.price * productCount)}원 결제하기`;
}
getProductInfo(productId);

// 회원 정보 받아오기
let userId;

async function getUserInfo() {
  const result = await Api.getYesToken('/api/users');
  const userData = result.data;
  userId = userData._id;

  nameInput.value = userData.fullName;

  const [phoneNumberFirst = '', phoneNumberSecond = '', phoneNumberThird = ''] = userData.phoneNumber?.split('-') || [];
  const phoneNumbers = [phoneNumberFirst, phoneNumberSecond, phoneNumberThird];
  const { postalCode = '', address1: baseAddress1 = '', address2: baseAddress2 = '' } = userData?.address || {};
  if (!postalCode) {
    defaultAddressInput.disabled = true;
    newAddressInput.checked = true;
    defaultAddressInput.nextSibling.nextSibling.style.color = 'gray';
    setDefaultAddressWrap.classList.remove('hide');
  } else {
    defaultAddressInput.checked = true;
    postalCodeInput.value = postalCode;
    address1.value = baseAddress1;
    address2.value = baseAddress2;
  }

  phoneInput.forEach((phone, idx) => {
    phone.value = phoneNumbers[idx];
  });
}

getUserInfo();

// 카카오 주소 가져오기
window.onload = function () {
  getNode('#kakao_address').addEventListener('click', () => {
    new daum.Postcode({
      oncomplete: function (data) {
        postalCodeInput.value = data.zonecode;
        postalCodeInput.classList.remove('is-danger');
        addressValidateMsg.classList.add('hide');
        address1.value = data.address;
        address2.value = '';
        address2.focus();
      },
    }).open();
  });
};
// 기본 주소 갖고오기
defaultAddressInput.addEventListener('click', defaultAddressFn);
function defaultAddressFn() {
  getUserInfo();
  setDefaultAddressWrap.style.display = 'none';
}

// 주소 폼 초기화
newAddressInput.addEventListener('click', resetForm);
function resetForm() {
  postalCodeInput.value = '';
  address1.value = '';
  address2.value = '';
  setDefaultAddressWrap.style.display = 'block';
}

// 기본 배송지 체크되어있으면 "기본배송지 설정" 체크박스 안보임
const setDefaultAddressWrap = getNode('#set-default-address-wrap');
if (defaultAddressInput.checked) {
  setDefaultAddressWrap.style.display = 'none';
}

// 폼 비어있는지 체크 (실시간 입력에 따른 체크)
// 이름
nameInput.addEventListener('input', () => {
  if (nameInput.value !== '') {
    nameInput.classList.remove('is-danger');
    nameValidateMsg.classList.add('hide');
  } else {
    nameInput.classList.add('is-danger');
    nameValidateMsg.classList.remove('hide');
  }
});

// 전화번호
const phoneWrap = getNode('#phone-input-wrap');
phoneWrap.addEventListener('input', phoneCheck);

function phoneCheck() {
  if (phoneInput[0].value !== '' && phoneInput[1].value !== '' && phoneInput[2].value !== '') {
    phoneInput[0].classList.remove('is-danger');
    phoneInput[1].classList.remove('is-danger');
    phoneInput[2].classList.remove('is-danger');
    phoneValidateMsg.classList.add('hide');
  } else {
    phoneInput[0].classList.add('is-danger');
    phoneInput[1].classList.add('is-danger');
    phoneInput[2].classList.add('is-danger');
    phoneValidateMsg.classList.remove('hide');
  }
}

// 결제하기 눌렀을 때 폼 유효성 검사
function checkForm() {
  let validateFlag = true;

  if (!nameInput.value) {
    nameInput.classList.add('is-danger');
    nameValidateMsg.classList.remove('hide');
    validateFlag = false;
  }

  if (!postalCodeInput.value) {
    postalCodeInput.classList.add('is-danger');
    addressValidateMsg.classList.remove('hide');
    validateFlag = false;
  }

  phoneInput.forEach((phone) => {
    if (!phone.value) {
      phoneInput[0].classList.add('is-danger');
      phoneInput[1].classList.add('is-danger');
      phoneInput[2].classList.add('is-danger');
      phoneValidateMsg.classList.remove('hide');
      validateFlag = false;
    }
  });
  return validateFlag;
}

// 결제하기 눌렀을 때 post 요청
async function postOrder() {
  const productsList = [
    {
      productId: productId,
      productImg: productInfo.image,
      productName: productInfo.productName,
      count: productCount,
      productPrice: productCount * productInfo.price,
    },
  ];

  const orderInfo = {
    address: {
      postalCode: postalCodeInput.value,
      address1: address1.value,
      address2: address1.value,
    },
    phoneNumber: `${getNode('#phone1').value}-${getNode('#phone2').value}-${getNode('#phone3').value}`,
    products: productsList,
    totalPrice: productInfo.price * productCount,
    userId: userId,
  };

  const res = await Api.postYesToken('/api/orders', orderInfo);
}

// 기본배송지 설정 눌렀을 때 주소정보 수정 patch 요청
async function changeAddress() {
  const newAddressInfo = {
    postalCode: postalCodeInput.value,
    address1: address1.value,
    address2: address2.value,
  };

  const res = await Api.patchYesToken('/api/users/address', '', { address: newAddressInfo });
  console.log('정보수정 잘 되었어요!', res);
}

const aTag = getNode('#move-page');

function handleSubmit() {
  const formValidateCheck = checkForm();
  if (!formValidateCheck) {
    aTag.removeAttribute('href');
    return;
  }

  aTag.setAttribute('href', '/order/complete');
  postOrder();
  if (setDefaultAddress.checked) {
    changeAddress();
  }
  localStorage.removeItem('cart');
}
payButton.addEventListener('click', handleSubmit);
