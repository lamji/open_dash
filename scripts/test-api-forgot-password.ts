#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function run() {
  console.log("Debug flow: test-api-forgot-password fired");
  const response = await fetch(`${BASE_URL}/api/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "forgot-password-test@example.com" }),
  });
  const data = await response.json();
  console.log(JSON.stringify({ status: response.status, data }, null, 2));
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
