#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function run() {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      layoutId: "",
      next: "/preview/test-layout",
      email: "viewer@example.com",
      password: "password1234",
    }),
  });

  const body = await response.text();
  console.log(JSON.stringify({ status: response.status, body }, null, 2));
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
