
const render = () => {
  const authenticated = sessionStorage.getItem('token');
  
  $('#Header').hide();
  $('#Dashboard').hide();
  $('#Signin').hide();
  if (authenticated) {
    $('#Header').show();
    $('#Dashboard').show();
  } else {
    $('#Signin').show();
  }
}

render();