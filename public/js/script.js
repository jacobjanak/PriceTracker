
let disableAlert = false;

const showError = errorMessage => {
	if (!disableAlert) {
		disableAlert = true;
		$('#error-message').text(errorMessage)
		$('.alert').removeClass('hide')
	}
}

const hideError = () => $('.alert').addClass('hide');

const updatePrice = price => {
	disableAlert = false;
	hideError()
	document.title = price + ' BTC/USD';
	$('#price-display').text(price)
}

const loadPrice = () => {
	let secondsTillUpdate = 10;
	$.get('/price', response => {
		if (response.success) {
			const price = (Math.round(response.price * 100) / 100).toFixed(2);
			if (!isNaN(price) && price > 0) {
				secondsTillUpdate = response.updateIn;
				updatePrice(price);
			} else showError('Server error');
		} else showError('API error');
	})
	.fail(() => showError(`Can't connect to server`))
	.done(() => window.setTimeout(loadPrice, secondsTillUpdate * 1000))
};

loadPrice()

$('.btn-close').on('click', () => hideError())
