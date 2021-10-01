
const render = () => {
  const authenticated = sessionStorage.getItem('token');
  const href =  window.location.href;
  if (!authenticated && href.indexOf('dashboard') !== -1) window.location = '/';
  if (authenticated && href.indexOf('dashboard') === -1) {
    window.location = '/dashboard';
  }
}

render();