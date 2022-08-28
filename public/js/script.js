
const DEFAULT_TITLE = 'Bitcoin Price Tracker';
const DEFAULT_PRICE = '--.--';

let alertDisabled = false;
let lastUpdateTime = null;

const showError = errorMessage => {
	if (!alertDisabled) {
		alertDisabled = true;
		$('footer').addClass('d-none')
		$('#price-label').removeClass('text-start')
		$('#price-asset').removeClass('text-end')
		$('#price-display').text(DEFAULT_PRICE)
		document.title = DEFAULT_TITLE;
		alert(errorMessage)
	}
};

const updatePrice = price => {
	alertDisabled = false;
	$('#price-label').addClass('text-start')
	$('#price-asset').addClass('text-end')
	$('#price-display').text(price)
	document.title = price + ' BTC/USD';
	$('footer').removeClass('d-none')
	lastUpdateTime = currentTime();
};

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

const currentTime = () => Math.floor(new Date().getTime() / 1000);

const displayLastUpdated = () => {
	let nextUpdate = alertDisabled ? 2000 : 200;
	if (lastUpdateTime) {
		const now = currentTime();
		nextUpdate = now * 1000 - new Date().getTime();
		$('#last-update').text(`Updated ${now - lastUpdateTime} seconds ago`)
	}
	window.setTimeout(displayLastUpdated, nextUpdate)
}

// script
loadPrice()
displayLastUpdated()
