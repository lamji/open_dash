/**
 * Widget Seeding Script
 * 
 * Note: The /api/widgets endpoint already has auto-seeding logic built in.
 * When the database is empty, it automatically seeds 32 default widgets.
 * 
 * This script simply triggers that auto-seeding by calling the API endpoint.
 * Make sure your dev server is running: npm run dev
 */

async function main() {
  console.log(`Debug flow: seed-widgets main fired`);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/api/widgets`;
  
  console.log(`Debug flow: calling GET ${url} to trigger auto-seed`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`Debug flow: seed-widgets complete`, { 
        count: data.widgets?.length || 0,
        message: "Widgets loaded successfully (auto-seeded if DB was empty)"
      });
    } else {
      console.error(`Debug flow: seed-widgets error`, { 
        status: response.status,
        error: data 
      });
      process.exit(1);
    }
  } catch (error) {
    console.error(`Debug flow: seed-widgets fetch error`, error);
    console.log(`\nMake sure your dev server is running: npm run dev`);
    process.exit(1);
  }
}

main();
