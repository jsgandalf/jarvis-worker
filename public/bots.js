

async function updateBotStrategy(botId, useTradingView=false, key=false, secret=false) {

  const body = key && secret ? 
    encodeURI(`botId=${botId}&useTradingView=${useTradingView}&key=${key}&secret=${secret}`) :
    encodeURI(`botId=${botId}&useTradingView=${useTradingView}`);

  const endpoint = `/bot/strategy`;
  const response = await fetch(endpoint, {
    method: 'put',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Authorization": `Bearer ${sessionStorage.getItem('token')}`
    },
    body
  })
  if (response.status === 200) {
    const result = await response.json();
    return result;
  } else {
    alert('Something went wrong with your request');
  }
}

async function getBotStrategy(botId, key=false, secret=false) {

  const body = key && secret ? 
    encodeURI(`botId=${botId}&key=${key}&secret=${secret}`) :
    encodeURI(`botId=${botId}`);

  const endpoint = `/bot/strategy?${body}`;
  const response = await fetch(endpoint, {
    method: 'get',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Authorization": `Bearer ${sessionStorage.getItem('token')}`
    }
  })
  if (response.status === 200) {
    const result = await response.json();
    return result;
  } else {
    alert('Something went wrong with your request');
  }
}

const getIsTradingView = strategy => strategy.strategy[0].strategy === 'trading_view';

const disableButton = () => {
  document.getElementById('Strategy-Button').disabled = true;
}
const enableButton = () => {
  document.getElementById('Strategy-Button').disabled = false;
}

const renderButton = (strategy) => {
  const isTradingView = getIsTradingView(strategy)
  const buttonText = isTradingView ? 'Turn on Cyberbull Signals' : 'Turn on Trading View 1 minute buy or strong buy';
  $('#Strategy-Button').html(buttonText);
}

const renderCard = (id, strategy) => {
  const isTradingView = getIsTradingView(strategy)
  const text = isTradingView ? 'Trading View Strategy (1 min buy or strong buy)' : 'Cyberbull Strategy (Manual)';
  $(`#${id}`).html(text);
}

const setStrategy = strategy => {
  window.sessionStorage.setItem('isTradingView', getIsTradingView(strategy))
}
const getStrategy = () => {
  return window.sessionStorage.getItem('isTradingView');
}

const seansBotId = 5023500
const alexBotId = 5430456
const alexKey = 'THREE_COMMAS_API_KEY_NALDER';
const alexSecret = 'THREE_COMMAS_API_SECRET_NALDER';
const MANUAL = 'manual';
const TRADING_VIEW = 'trading_view';

const getBotStatus = async () => {
  disableButton();
  const strategySean = await getBotStrategy(seansBotId);
  const strategyAlex = await getBotStrategy(alexBotId, alexKey, alexSecret);
  renderButton(strategyAlex);
  renderCard('Sean-Strategy', strategySean);
  renderCard('Alex-Strategy', strategyAlex);
  setStrategy(strategyAlex);
  enableButton();
  //trading_view or manual
}

const clickUpdateBotStrategy = async () => {
  disableButton();
  const useTradingView = !(JSON.parse(getStrategy()));
  await updateBotStrategy(seansBotId, useTradingView);
  await updateBotStrategy(alexBotId, useTradingView, alexKey, alexSecret);
  getBotStatus();
}

getBotStatus();

$('#Strategy-Button').click(clickUpdateBotStrategy);

