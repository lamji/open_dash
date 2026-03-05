#!/usr/bin/env tsx

/**
 * Test API simulation for nav item foreign key constraint
 * Tests the scenario where projectId exists vs doesn't exist
 */

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("\n=== Nav Item FK Constraint Test ===\n");

  // Test 1: Check if the problematic project exists
  const problematicProjectId = "cmmasbwp0000004icetg6102h";
  console.log(`[TEST 1] Checking if project ${problematicProjectId} exists...`);
  
  const existingProject = await prisma.project.findUnique({
    where: { id: problematicProjectId },
  });

  if (existingProject) {
    console.log(`✓ Project exists: ${existingProject.name}`);
  } else {
    console.log(`✗ Project does NOT exist - this is the root cause of the FK error`);
  }

  // Test 2: List all existing projects
  console.log(`\n[TEST 2] Listing all projects in database...`);
  const allProjects = await prisma.project.findMany({
    select: { id: true, name: true, slug: true, userId: true },
  });
  
  if (allProjects.length === 0) {
    console.log(`✗ No projects found in database`);
  } else {
    console.log(`✓ Found ${allProjects.length} project(s):`);
    allProjects.forEach((p: { id: string; name: string; slug: string; userId: string }) => {
      console.log(`  - ${p.id} | ${p.name} | ${p.slug} | userId: ${p.userId}`);
    });
  }

  // Test 3: Check if there's a user to create a project for
  console.log(`\n[TEST 3] Checking for users...`);
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  if (users.length === 0) {
    console.log(`✗ No users found - need to create user first`);
    console.log(`\nRECOMMENDATION: User needs to:`);
    console.log(`  1. Sign up via /signup route`);
    console.log(`  2. Login via /auth/login route`);
    console.log(`  3. Create a project via /dashboard route`);
    console.log(`  4. Then access builder with valid ?projectId=<id>`);
  } else {
    console.log(`✓ Found ${users.length} user(s):`);
    users.forEach((u: { id: string; email: string; name: string }) => {
      console.log(`  - ${u.id} | ${u.email} | ${u.name}`);
    });

    // Test 4: Try to create a test project for the first user
    const testUser = users[0];
    console.log(`\n[TEST 4] Creating test project for user ${testUser.email}...`);
    
    try {
      const testProject = await prisma.project.create({
        data: {
          userId: testUser.id,
          name: "Test Builder Project",
          slug: `test-builder-${Date.now()}`,
          description: "Auto-created test project for FK constraint testing",
        },
      });
      console.log(`✓ Test project created: ${testProject.id}`);

      // Test 5: Try to create a nav item with the valid project
      console.log(`\n[TEST 5] Creating nav item with valid projectId...`);
      const navItem = await prisma.sidebarItem.create({
        data: {
          label: "Dashboard",
          slug: `dashboard-${Date.now()}`,
          projectId: testProject.id,
          order: 0,
        },
      });
      console.log(`✓ Nav item created successfully: ${navItem.id}`);

      // Test 6: Try to create a nav item with INVALID projectId (should fail)
      console.log(`\n[TEST 6] Attempting to create nav item with INVALID projectId...`);
      try {
        await prisma.sidebarItem.create({
          data: {
            label: "Invalid Test",
            slug: `invalid-${Date.now()}`,
            projectId: "non-existent-project-id",
            order: 0,
          },
        });
        console.log(`✗ UNEXPECTED: Should have failed with FK constraint error`);
      } catch (err) {
        if (err instanceof Error && err.message.includes("Foreign key constraint")) {
          console.log(`✓ EXPECTED: FK constraint error caught`);
          console.log(`  Error: ${err.message.split("\n")[0]}`);
        } else {
          console.log(`✗ Unexpected error: ${err}`);
        }
      }

      console.log(`\n[CLEANUP] Removing test data...`);
      await prisma.sidebarItem.delete({ where: { id: navItem.id } });
      await prisma.project.delete({ where: { id: testProject.id } });
      console.log(`✓ Cleanup complete`);

    } catch (err) {
      console.error(`✗ Error during test:`, err);
    }
  }

  console.log(`\n=== Test Summary ===`);
  console.log(`Root Cause: ProjectId '${problematicProjectId}' does not exist in Project table`);
  console.log(`Solution: User must create a project first, then use that project's ID in the URL`);
  console.log(`\nExpected Flow:`);
  console.log(`  1. User signs up/logs in`);
  console.log(`  2. User creates project via /dashboard`);
  console.log(`  3. User clicks "Open Builder" which navigates to /builder?projectId=<valid-id>`);
  console.log(`  4. Nav items can then be created successfully\n`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
