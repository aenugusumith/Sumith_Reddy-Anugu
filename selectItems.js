const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  MENU: Symbol("menu"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  DESSERT: Symbol("dessert"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment"),
});

module.exports = class selectItems extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.selectedDish = "";
        this.sSize = "";
        this.sToppings = "";
        this.selectedDessert = "";
        this.sDrinks = "";
        this.sItems = ["Fries", "Biryani"];
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
              this.stateCur = OrderState.MENU;
              aReturn.push("Welcome to Sumith's Restaurant.");
              aReturn.push("Please select a dish");
              aReturn.push("1. Fries");
              aReturn.push("2. Biryani");
              break;
            case OrderState.MENU:
              if (sInput === "1" || sInput.toLowerCase() === "fries") {
                this.selectedDish = "Fries";
                this.stateCur = OrderState.SIZE;
                aReturn.push("Great choice! What size of Fries would you like?");
                aReturn.push("Small ($6.99), Medium ($8.99), Large ($10.99)");
              } else if (sInput === "2" || sInput.toLowerCase() === "biryani") {
                this.selectedDish = "Biryani";
                this.stateCur = OrderState.SIZE;
                aReturn.push("Great choice! What size of Biryani would you like?");
                aReturn.push("Small ($10.99), Medium ($12.99), Large ($15.99)");
              } else {
                aReturn.push(
                  "We are not serving this dish at the moment. Please choose a valid dish"
                );
              }
              break;
            case OrderState.SIZE:
              this.sSize = sInput.toLowerCase();
              if (this.sSize === "small" ||this.sSize === "medium" || this.sSize === "large") {
                this.stateCur = OrderState.TOPPINGS;
                aReturn.push("What toppings would you like?");
              } else {
                aReturn.push(
                  "Invalid input. Please enter a valid size (Small, Medium, or Large):"
                );
              }
              break;
            case OrderState.TOPPINGS:
              this.stateCur = OrderState.DESSERT;
              this.sToppings = sInput;
              aReturn.push("Would you like to add dessert to your order?");
              break;
      
            case OrderState.DESSERT:
              this.selectedDessert = sInput;
              this.stateCur = OrderState.DRINKS;
              aReturn.push("Would you like to add drinks to your order?");
              break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.nOrder = this.calculatePrice();
                this.sDrinks = sInput;
                aReturn.push("Thank you for your order!");
                aReturn.push(`You ordered:\nDish: ${this.selectedDish}\nSize: ${this.sSize}\nToppings: ${this.sToppings}\nDessert: ${this.selectedDessert}\nDrink: ${this.sDrinks}`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                aReturn.push(`Total Combo Price: $${this.nOrder.toFixed(2)}`); 
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your payment was successful!!`);
                aReturn.push(`Your order will be delivered within ${d.toTimeString()}`);
                aReturn.push(`Your order will be delivered at \n${this.addressFormat(sInput.purchase_units[0].shipping)}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'AfW5WBMWu9wS-efS9LLAk1bo2G1vDPa25JKQ9RxKi4d75T6hiZKYWXvLMrZQYXgezxgumF1rwnjoo91C'
      return(`
      <!DOCTYPE html>
  
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}">
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
        </script>
      </body>
      `);
  
    }

    addressFormat(addressObj) {
      const {
        address: {
          address_line_1,
          address_line_2,
          admin_area_2,
          admin_area_1,
          postal_code,
          country_code,
        },
      } = addressObj;

    const addressLines = [];

    if (address_line_1) {
      addressLines.push(address_line_1);
    }
    if (address_line_2) {
      addressLines.push(address_line_2);
    }

    const cityStatePostal = `${admin_area_2}, ${admin_area_1} ${postal_code}`;
    addressLines.push(cityStatePostal);

    if (country_code) {
      addressLines.push(country_code);
    }

    const formatAddress = addressLines.join("\n");

    return formatAddress;
    }

    calculatePrice() {
      let basePrice = 0;
      switch (this.selectedDish) {
        case "Fries":
          switch (this.sSize.toLowerCase()) {
            case "small":
              basePrice = 6.99;
              break;
            case "medium":
              basePrice = 8.99;
              break;
            case "large":
              basePrice = 10.99;
              break;
          }
          break;
        case "Biryani":
          switch (this.sSize.toLowerCase()) {
            case "small":
              basePrice = 10.99;
              break;
            case "medium":
              basePrice = 12.99;
              break;
            case "large":
              basePrice = 15.99;
              break;
          }
          break;
        default:
          break;
      }
      let totalPrice = basePrice;
      return totalPrice;
    }
}