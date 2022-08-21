
const showError = errorMessage => {
	$('#error-message').text(errorMessage)
	$('.alert').removeClass('hide')
}

const hideError = () => $('.alert').addClass('hide');

const loadPrice = () => {
	$.get('/price', response => {
		if (response.success) {
			const price = (Math.round(response.price * 100) / 100).toFixed(2);
			if (!isNaN(price) && price > 0) {
				document.title = price;
				$('#price-display').text(price)
				hideError()
			} else {
				showError('Server error')
			}
		} else {
			if (response.status === 429) showError('API error')
			else showError('Server error')
		}
	})
	.fail(() => showError(`Can't connect to server`))
}

loadPrice()

window.setInterval(loadPrice, 5000)

$('.btn-close').on('click', () => hideError())
