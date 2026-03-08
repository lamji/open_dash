#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function run() {
  console.log("Debug flow: test-api-signup fired");
  const response = await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Signup Test",
      email: `signup-test-${Date.now()}@example.com`,
      password: "password1234",
      confirmPassword: "password1234",
    }),
  });
  const data = await response.json();
  console.log(JSON.stringify({ status: response.status, data }, null, 2));
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
