"use strict";

var order = {}
var products

const loadProducts = () => {
    products = JSON.parse(productsStr);
}

const updateCart = (product) => {

    order.product = product ?? order.product;
    let quantity = $(`#quantity-field-${order.product}`).val();

    if (quantity === "0") {
        $(`#quantity-field-${order.product}`).val("1");
        quantity = 1;
    }

    let toppings = [];
    $(".topping_card.active").each((index, element) => {
        toppings.push(element.id.replace("topping_", ""));
    });

    // get sides
    let sides = [];
    products.filter((e) => e.product_type === "side").forEach((side) => {
        console.log(side);
        let quantity = $(`#quantity-field-${side._id}`).val();
        console.log(quantity);
        if (quantity > 0) {
            sides.push({
                product_id: side._id,
                quantity: quantity,
                toppings: []
            });
        }
    })

    order.sides = sides;
    order.quantity = quantity;
    order.toppings = toppings;

    console.log(order);
    let productObj = products.find((product) => product._id === order.product);
    order.max_toppings = productObj['max_toppings'];

    let subtotal = productObj['list_price'] + Math.max(0, (order.toppings.length - productObj['max_toppings'])) * 2;
    subtotal *= order.quantity;


    // add sides
    order.sides.forEach((side) => {
            let sideObj = products.find((product) => product._id === side.product_id);
            subtotal += sideObj['list_price'] * side.quantity;
        }
    );
    order.sub_total = subtotal.toFixed(2);

    $("#subtotal").text(`$${order.sub_total}`);
    let tax = subtotal * 0.13;
    order.tax = tax.toFixed(2);
    $("#tax").text(`$${order.tax}`);
    let tip = parseFloat($("#tipSelect").val()) / 100 * subtotal;
    order.tip = tip.toFixed(2);
    $("#tip").text(`$${order.tip}`);
    let total = subtotal + tip + tax;
    order.total = total.toFixed(2);
    $("#total").text(`$${order.total}`);
}

const clearCart = () => {
    order = {};
    $(".quantity-field").val("1");
    $(".topping_card").removeClass("active");
    $("#subtotal").text(`$0.00`);
    $("#tax").text(`$0.00`);
    $("#tip").text(`$0.00`);
    $("#total").text(`$0.00`);
}

window.onload = () => {
    loadProducts();

    $("#productSelect").change(() => {
        let selected = $("#productSelect").val();
        console.log(selected);
        // hide item views
        $(".item-view").addClass("d-none");
        // show selected item view
        if (selected !== "none") {
            $(`#${selected}`).removeClass("d-none");
            $(".toppings").removeClass("d-none");
            $(".sides").removeClass("d-none");
            $(".tip").removeClass("d-none");
            $(".summary").removeClass("d-none");
            $("#place-order-btn").removeClass("d-none");
            updateCart(selected);
        } else {
            $(".toppings").addClass("d-none");
            $(".sides").addClass("d-none");
            $(".tip").addClass("d-none");
            $(".summary").addClass("d-none");
            $("#place-order-btn").addClass("d-none");
            clearCart();
        }
    });

    $("#tipSelect").change(() => {
            let selected = $("#tipSelect").val();
            console.log(selected);
            updateCart();
        }
    );

    $(".topping_card").click((event) => {
        let topping = event.currentTarget.id
        console.log(topping);
        // toggle the selected class
        $(`#${topping}`).toggleClass("active");
        updateCart();
    });


    $('.input-group').on('click', '.button-plus', function (e) {
        incrementValue(e);
        updateCart();
    });

    $('.input-group').on('click', '.button-minus', function (e) {
        decrementValue(e);
        updateCart();
    });

    $('#place-order-btn').click((event) => {
        event.preventDefault();

        if (order.toppings.length < order.max_toppings) {
            alert(`Please select at least ${order.max_toppings} toppings.`);
            return;
        }

        let orderStr = JSON.stringify(order);

        post('/shopping_cart', {data: orderStr});
    });
}