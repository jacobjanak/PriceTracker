
const showError = errorMessage => {
	$('#error-message').text(errorMessage)
	$('.alert').removeClass('hide')
}

const hideError = () => $('.alert').addClass('hide');

const updatePrice = price => {
	hideError()
	document.title = price + ' BTC/USD';
	$('#price-display').text(price)
}

const loadPrice = () => {
	$.get('/price', response => {
		if (response.success) {
			const price = (Math.round(response.price * 100) / 100).toFixed(2);
			if (!isNaN(price) && price > 0) {
				updatePrice(price)
				return window.setTimeout(loadPrice, response.updateIn * 1000);
			}
		}
		showError(response.status === 429 ? 'API error' : 'Server error');
		window.setTimeout(loadPrice, 5 * 1000);
	})
	.fail(() => showError(`Can't connect to server`))
};

loadPrice()

$('.btn-close').on('click', () => hideError())
