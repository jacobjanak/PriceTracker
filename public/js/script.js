const loadPrice = () => {
	$.get('/price', price => {
		console.log(price)
		price = (Math.round(price * 100) / 100).toFixed(2);

		if (!isNan(price)) {
			document.title = price;
			$('.price-display').text(price)
		}
	})
}

loadPrice()

window.setInterval(loadPrice, 5000)