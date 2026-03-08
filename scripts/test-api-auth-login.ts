#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function run() {
  console.log("Debug flow: test-api-auth-login fired");
  const email = `auth-login-test-${Date.now()}@example.com`;
  const password = "password1234";

  await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Auth Login Test",
      email,
      password,
      confirmPassword: password,
    }),
  });

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe: true }),
  });
  const data = await response.json();
  console.log(JSON.stringify({ status: response.status, data }, null, 2));
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
