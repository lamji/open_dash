#!/usr/bin/env ts-node
/// <reference types="node" />

/**
 * API Test Script for Widget Endpoints
 * Tests GET /api/widgets and GET /api/widgets/[slug]
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface WidgetTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  jsxCode: string;
  createdAt: string;
  updatedAt: string;
}

async function testGetAllWidgets() {
  console.log('\n=== Testing GET /api/widgets ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/widgets`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, {
      widgetCount: data.widgets?.length || 0,
      hasWidgets: Array.isArray(data.widgets),
    });
    
    if (response.status === 200 && Array.isArray(data.widgets)) {
      console.log('✓ GET /api/widgets - PASS');
      return data.widgets;
    } else {
      console.log('✗ GET /api/widgets - FAIL');
      return [];
    }
  } catch (error) {
    console.error('✗ GET /api/widgets - ERROR:', error);
    return [];
  }
}

async function testGetWidgetBySlug(slug: string) {
  console.log(`\n=== Testing GET /api/widgets/${slug} ===`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/widgets/${slug}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200 && data.widget) {
      console.log(`Response:`, {
        slug: data.widget.slug,
        title: data.widget.title,
        category: data.widget.category,
        hasJsxCode: !!data.widget.jsxCode,
        jsxCodeLength: data.widget.jsxCode?.length || 0,
      });
      console.log(`✓ GET /api/widgets/${slug} - PASS`);
      return true;
    } else if (response.status === 404) {
      console.log(`✗ GET /api/widgets/${slug} - NOT FOUND`);
      return false;
    } else {
      console.log(`✗ GET /api/widgets/${slug} - FAIL`);
      return false;
    }
  } catch (error) {
    console.error(`✗ GET /api/widgets/${slug} - ERROR:`, error);
    return false;
  }
}

async function testInvalidWidgetSlug() {
  console.log('\n=== Testing GET /api/widgets/invalid-slug-12345 ===');
  
  try {
    const response = await fetch(`${BASE_URL}/api/widgets/invalid-slug-12345`);
    const _data = await response.json();
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('✓ Invalid slug returns 404 - PASS');
      return true;
    } else {
      console.log('✗ Invalid slug should return 404 - FAIL');
      return false;
    }
  } catch (error) {
    console.error('✗ Invalid slug test - ERROR:', error);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Widget API Test Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  const widgets = await testGetAllWidgets();
  
  if (widgets.length > 0) {
    console.log(`\nFound ${widgets.length} widgets. Testing individual widget endpoints...`);
    
    // Test first 3 widgets
    const testSlugs = widgets.slice(0, 3).map((w: WidgetTemplate) => w.slug);
    for (const slug of testSlugs) {
      await testGetWidgetBySlug(slug);
    }
  } else {
    console.log('\n⚠ No widgets found. Please run the seed script first:');
    console.log('  npx ts-node prisma/seed-widgets.ts');
  }
  
  await testInvalidWidgetSlug();
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Suite Complete');
  console.log('='.repeat(60));
}

runTests().catch(console.error);
