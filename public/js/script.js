
const DEFAULT_TITLE = 'Bitcoin Price Tracker';
const DEFAULT_PRICE = '--.--';

const currentTime = () => Math.floor(new Date().getTime() / 1000);

let alertDisabled = false;
let lastUpdateTime = currentTime();

const showError = errorMessage => {
	if (!alertDisabled) {
		alertDisabled = true;
		$('footer').addClass('d-none')
		$('#price-display').text(DEFAULT_PRICE)
		document.title = DEFAULT_TITLE;
		alert(errorMessage)
	}
};

const updatePrice = price => {
	alertDisabled = false;
	$('#price-display').text(price)
	document.title = price + ' BTC/USD';
	$('footer').removeClass('d-none')
	lastUpdateTime = currentTime();
};

const loadPrice = () => {
	let secondsTillUpdate = alertDisabled ? 10 : 1;
	$.get('/price', response => {
		if (response.success) {
			if (response.price > 0) {
				secondsTillUpdate = response.updateIn;
				updatePrice(response.price);
			} else showError('Server error');
		} else showError('API error');
	})
	.fail(() => showError(`Can't connect to server`))
	.done(() => window.setTimeout(loadPrice, secondsTillUpdate * 1000))
};

const displayLastUpdated = () => {
	const now = currentTime();
	$('#last-update').text(`Updated ${now - lastUpdateTime} seconds ago`)
	const nextUpdate = now * 1000 - new Date().getTime();
	window.setTimeout(displayLastUpdated, nextUpdate)
}

// script
window.setTimeout(loadPrice, updateIn * 1000)
displayLastUpdated()
