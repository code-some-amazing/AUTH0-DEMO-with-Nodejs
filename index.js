const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// *NOTICE*
// Fill your own credentials from "auth0.com"
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: 'YOUR_BASEURL',
  clientID: 'YOUR_CLIENT-ID',
  issuerBaseURL: 'YOUR_ISSUER_BASEURL',
  secret: 'YOUR_SECRET',
  clientSecret: 'YOUR_CLIENT-SECRET',
  routes: {
    login: false,
  },
};

app.use(auth(config));

app.use(express.static('public'));

// USER INTERFACE
const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auth0 Authentication Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Auth0 Demo</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/profile">Profile</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="container mt-4">
        ${content}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`;

// HOME
app.get('/', (req, res) => {
  const content = `
    <div class="jumbotron">
      <h1 class="display-4">Welcome to the Auth0 Demo</h1>
      <p class="lead">This is a simple authentication demo using Auth0 and Express.</p>
      <hr class="my-4">
      ${!req.oidc.isAuthenticated() ? 
        '<a class="btn btn-primary btn-lg" href="/login" role="button">Login</a>' : 
        '<a class="btn btn-success btn-lg" href="/profile" role="button">Go to Profile</a>'}
    </div>
  `;
  res.send(layout(content));
});

// LOGIN
app.get('/login', (req, res) => {
  res.oidc.login({ returnTo: '/profile' });
});

// PROFILE
app.get('/profile', requiresAuth(), (req, res) => {
  const user = req.oidc.user;
  const loginTime = new Date(user.updated_at).toLocaleString();
  
  const content = `
    <h1 class="mb-4">User Profile</h1>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${user.name}</h5>
        <p class="card-text">Email: ${user.email}</p>
        <p class="card-text">Last Login: ${loginTime}</p>
        <a href="/logout" class="btn btn-danger">Logout</a>
      </div>
    </div>
  `;
  res.send(layout(content));
});

// LOGOUT
app.get('/logout', (req, res) => {
  res.oidc.logout({ returnTo: '/' });
});

// PORT LISTENING
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
