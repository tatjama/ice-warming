//contenful - sdk
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "4dc3o9jraa0z",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "d4du6R1JxvgDw_Ae9YINNJRzOk9l0a9Kbxv18ziSHLU"
  });
  //console.log(client)

//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];
let buttonsDOM = [];
//classes
//getting products
class Products {
   async getProducts() {
       try {
        console.log("data")
           // This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.
          let contentful = await client.getEntries({
            content_type: 'comfyHouseProducts'
          });
          //console.log(contentful)
            //LOCAL JSON CALL for products
           /* let result = await fetch('../products.json');
            let data  = await result.json();
            console.log("data")
            let products = data.items;*/
            let products = contentful.items;
            products = products.map((item) => {
                const {id} = item.sys;
                const {title, price} = item.fields;
                const image = item.fields.image.fields.file.url;
                return {id, title, price, image}
            })
            return products;
       } catch (error) {
           console.log(error);
       }
      
    }
}
//display products
class UI{
    displayProducts(products){
        let result = "";
        console.log("products")
        products.forEach(product => {
           result +=`
            <!--single product-->
            <article class="product items__item">             
                <div class="img-container">
                <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>                 
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>             
            </article>
         <!--end of single product-->
            `
        })
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
               button.innerText = "in cart";
               button.disabled = true; 
            }else{
                button.addEventListener('click', (event) =>{
                    event.target.innerText = "in cart";
                    event.target.disabled = true;
                    //get product from products
                    let cartItem = {...Storage.getProducts(id), amount:1}
                    //add product to the cart
                    cart.push(cartItem);
                    // save cart to local Storage
                    Storage.saveCart(cart)
                    //set card values
                    this.setCartValues(cart);
                    //display  cart item
                    this.addCartItem(cartItem);
                    //show the cart
                    this.showCart();
                })
            }
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;         
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
        console.log(item)
        const div = document.createElement("div");
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product"/>
                <div>  
                    <h4>${item.title}</h4>
                    <h5>$ ${item.price}</h5>
                    <div class="remove-item" data-id = ${item.id} >remove</div>
                </div>
                <div>  
                    <i class="fas fa-chevron-up" data-id = ${item.id} ></i>
                    <p class="item-amount">${item.amount}</p>
                    <i class="fas fa-chevron-down" data-id = ${item.id} ></i>
                </div>        
        `        
        cartContent.appendChild(div);
    }
     showCart(){
         cartOverlay.classList.add('transparentBcg');
         cartDOM.classList.add('showCart');
        //cartOverlay.style.visibility = 'visible';
        //cartDOM.style.transform = 'translate(0%)';
    }
    setupApp(){
        console.log("setupApp")
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart){
        cart.forEach((item) => this.addCartItem(item))
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //clear all cart button
        clearCartBtn.addEventListener('click', () => { this.clearCart()})
        //cart functionality
        cartContent.addEventListener('click', (event) => {
            //remove-item click
           if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);                
                this.removeCartItem(id);              
           }
           if(event.target.classList.contains('fa-chevron-up')){
               let chevronUp = event.target;
               let id = chevronUp.dataset.id;
               //using forEach method
               cart.forEach((item) => {
                   if(item.id === id){
                    item.amount++   
                    chevronUp.nextElementSibling.innerHTML = item.amount;    
                   }
               })
               Storage.saveCart(cart);
               this.setCartValues(cart);
               
           }
           if(event.target.classList.contains('fa-chevron-down')){               
               let chevronDown = event.target;
               let id = chevronDown.dataset.id;
               //using find method
               let tempItem = cart.find(item => item.id === id );
               tempItem.amount--;
               if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    chevronDown.previousElementSibling.innerHTML = tempItem.amount;
               }else{
                    cartContent.removeChild(chevronDown.parentElement.parentElement);
                    this.removeCartItem(id);
               }
               
               
           }
        })
    }
    clearCart(){
        let cartItems = cart.map(item =>item.id);
        //remove from cart
        cartItems.forEach(id => this.removeCartItem(id));
        //remove from DOM
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeCartItem(id){
        //filter cart array and remove items with pass id's
        cart = cart.filter(item => item.id !== id );    
        //set new Total values for cart
        this.setCartValues(cart);
        //save new cart in local storage
        Storage.saveCart(cart);
        //button enabled again
        let button = this.getSingleButton(id);
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
        button.disabled = false;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProducts(id){
       let products = JSON.parse(localStorage.getItem("products"));
       console.log(products);
       let product = products.find((item) => {
            return item.id === id
       })
       return product
    }
    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart(){
       return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")): []
    }
}

document.addEventListener("DOMContentLoaded",() => {
    console.log("DOM")
    const ui = new UI();
    console.log(ui)
    const products = new Products();
    console.log(products)
    ui.setupApp();
    //getting all Products
    products.getProducts().then((products) => {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    })
})
