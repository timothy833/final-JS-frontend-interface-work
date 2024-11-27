//設定商品列表渲染位置
const productList = document.querySelector('.productWrap');

//購物車清單綁定位置
const cartList = document.querySelector('.shoppingCart-list');

//裝api產品列表資料
let productData = [];

//裝api購物車列表資料
let cartData = [];


//初始化產品列表
function init(){
  getProductList();
  getCartData();
}

init();


//發API拿產品列表
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).then(function(res){
    productData = res.data.products;
    renderProductList();
  }).catch(errors =>{
    console.log(errors.message);
  })
}

//渲染產品列表
function renderProductList(){
    let products = "";
    productData.forEach(function(item){
       products += mixProductHTMLItem(item);
    })
    productList.innerHTML = products;
}

//篩選顯示資料與全部產品列表結構
function mixProductHTMLItem(item){
  const price = formatNumber(item.price)
  const originPrice = formatNumber(item.origin_price)
  return  `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${originPrice}</del>
                <p class="nowPrice">NT$${price}</p>
            </li>`;  
}


//處理千分位價格顯示問題
function formatNumber(number) {
  let parts = number.toString().split('.'); // 分割整數和小數部分
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 格式化整數部分
  return parts.length > 1 ? parts.join('.') : parts[0]; // 拼接小數部分
}


//注意大原則 監聽在外層 innerHTML在內層

//設定要監聽選單位置
let productSelect = document.querySelector('.productSelect');


//顯示篩選列表
productSelect.addEventListener('change', function(e){
  const category = e.target.value;
  if(category == "全部"){
    renderProductList();
    return
  }
  let product = ""
  productData.forEach(function(item){
    if(item.category == category){
      product += mixProductHTMLItem(item);
    }
  })
   productList.innerHTML =  product;
})


//加入購物車
productList.addEventListener('click', function(e){
  e.preventDefault();
  const addCartClass = e.target.getAttribute("class");
  if(addCartClass != "addCardBtn"){
    return
  }
  const productId = e.target.getAttribute("data-id");
  let count = 1;
  
  cartData.carts.forEach(function(item){
    if(item.product.id === productId){
      //要使用++需要處理前置遞增問題 保險起見可以+=1
      // count = ++item.quantity;
      count = item.quantity += 1;
    }
  })
  
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
      "data": {
      "productId": productId,
      "quantity": count
    }
  }).then(function(res){
    alert("成功加入購物車")
    getCartData();
  })
})


//得到購物車列表並渲染
function getCartData(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).then(function(res){
    
    cartData = res.data;
    if(cartData.carts.length == 0){
      cartList.innerHTML = `<tr>
                              <td colspan="5"   class="shopping-notice" >購物車沒有任何商品</td>
                            </tr>`
      return
    }
    
    //總金額顯示調整
    const finalTotal = document.querySelector(".finalTotal");
    finalTotal.textContent = cartData.finalTotal
    
    let cartProduct = "";
    
    cartData.carts.forEach(function(item){
       cartProduct += `<tr>
                  <td>
                    <div class="cardItem-title">
                      <img src="${item.product.images}" alt="">
                      <p>${item.product.title}</p>
                    </div>
                  </td>
                  <td>NT$${item.product.price}</td>
                  <td>
                    <button type="button" class="decreaseBtn" data-btnId="${item.id}" data-quantity="${item.quantity}">-</button>
                      ${item.quantity}
                    <button type="button" class="addBtn"  data-btnId="${item.id}" data-quantity="${item.quantity}">+</button>
                  </td>
                  <td>NT$${item.quantity * item.product.price}</td>
                  <td class="discardBtn">
                    <a href="#" class="material-icons" data-id="${item.id}">
                      clear
                    </a>
                  </td>
                </tr>` 
    })    
    cartList.innerHTML =  cartProduct;
  }).catch(errors =>{
    console.log(errors.message);
  })
}

//編輯更新購物車產品數量
cartList.addEventListener('click', function(e){
  let orderProudctClass = e.target.getAttribute("class");
  let orderProductId = e.target.getAttribute("data-btnId");
  let quantityBtn = e.target.getAttribute("data-quantity");
  let quantity = Number(quantityBtn);
  let count = quantity;
  if(orderProudctClass !== "decreaseBtn" && orderProudctClass !== "addBtn"){
    return;
  }
  
  if(orderProudctClass == "decreaseBtn"){
      count  -= 1;
  }else if(orderProudctClass == "addBtn"){
      count += 1;
  }
  
  const data = {
    "data": {
      "id": orderProductId,
      "quantity":  count
    }
  }
  
  axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, data).then(function(res){     
      getCartData();
  }).catch(errors =>{
    console.log(errors.message);
  })
})






//刪除指定購物車
cartList.addEventListener('click', function(e){
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if(cartId == null){
    return
  }
  
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
.then(function(res){
    alert("刪除單筆購物車商品成功");
    getCartData();
  }).catch(errors =>{
    console.log(errors.message);
  })
})

//刪除全部購物車
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/`).then(function(res){
    alert('刪除全部購物車商品成功');
    getCartData();
  }).catch(errors =>{
    console.log(errors.message);
  }) 
})


//驗證表單

//驗證規則 省去欄位印出要在message開頭加^
const validationRule = {
  姓名: {
    presence:{
      message: "^姓名必填"
    }
  },
  電話: {
    presence:{
      message: "^電話必填"
    },
    format:{
      pattern:/(^09\d{8}$)|(^0\d{1,2}-\d{6,8}$)/,
      message: "^格式錯誤，請輸入正確的手機或市話號碼"
    }
  },
  Email: {
    presence:{
      message: "^Email必填"
    },
    format: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "^格式錯誤，請輸入有效的Email"
    }
  },
  寄送地址: {
    presence:{
      message: "^寄送地址必填"
    }
  }
}





//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click", function(e){
  e.preventDefault();
  console.log(cartData);
  if(cartData.carts.length == 0){
    alert("請將商品加入購物車");
    return;
  }
  const orderForm = document.querySelector(".orderInfo-form");
  const input = document.querySelectorAll('input[name="姓名"],input[name="電話"],input[name="Email"],input[name="寄送地址"]');
  input.forEach(item =>{
    item.nextElementSibling.textContent= "";
  })
  
  //回在錯誤狀態傳錯誤信息物件
  let errors = validate(orderForm, validationRule);
  if(errors){
    // console.log(Object.keys(errors));
    Object.keys(errors).forEach(keys =>{
      document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys]
      alert("請輸入正確訂單資料");
      return;
    })
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
    "user": {
      "name": customerName,
      "tel": customerPhone,
      "email": customerEmail,
      "address": customerAddress,
      "payment": tradeWay
    }
  }
  }).then(function(){
    alert("訂單建立成功");
    getCartData();
    orderForm.reset();
  }).catch(errors =>{
    console.log(errors.message);
  })
})