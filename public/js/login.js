const loginEndpoint = config.env === 'prod'? `${config.host}/login` : `${config.localServer}/login`;

async function basiclogin(email, password) {
  const body = encodeURI(`email=${email}&password=${password}`);
  const response = await fetch(loginEndpoint, {
    method: 'post',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body
  })
  if (response.status === 200) {
    const result = await response.json();
    sessionStorage.setItem('token', result.token);
  } else {
    alert('wrong email and password');
  }
  render();
  //localStorage.setItem('token', token)
}


startLogin = () => {
  const email = document.getElementById('Email').value;
  const password = document.getElementById('Password').value;
  basiclogin(email, password);
}

$('#Sign-In-Button').click(()=>{
  startLogin()
})