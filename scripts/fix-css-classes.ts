import { prisma } from "../src/lib/prisma";

async function fixCssClasses() {
  console.log("Fetching header components...");
  const components = await prisma.headerComponent.findMany();

  for (const component of components) {
    const config = JSON.parse(component.config);
    let updated = false;

    // Fix inputClassName
    if (config.inputClassName && config.inputClassName.includes("!important")) {
      console.log(`Fixing inputClassName for ${component.type} (${component.id})`);
      config.inputClassName = "focus:outline-none focus:ring-0 focus:border-transparent";
      updated = true;
    }

    // Fix className
    if (config.className && config.className.includes("!important")) {
      console.log(`Fixing className for ${component.type} (${component.id})`);
      config.className = config.className.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
      updated = true;
    }

    // Fix dropdownClassName
    if (config.dropdownClassName && config.dropdownClassName.includes("!important")) {
      console.log(`Fixing dropdownClassName for ${component.type} (${component.id})`);
      config.dropdownClassName = config.dropdownClassName.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
      updated = true;
    }

    // Fix itemClassName
    if (config.itemClassName && config.itemClassName.includes("!important")) {
      console.log(`Fixing itemClassName for ${component.type} (${component.id})`);
      config.itemClassName = config.itemClassName.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
      updated = true;
    }

    // Fix avatarClassName
    if (config.avatarClassName && config.avatarClassName.includes("!important")) {
      console.log(`Fixing avatarClassName for ${component.type} (${component.id})`);
      config.avatarClassName = config.avatarClassName.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
      updated = true;
    }

    if (updated) {
      await prisma.headerComponent.update({
        where: { id: component.id },
        data: { config: JSON.stringify(config) },
      });
      console.log(`✓ Updated ${component.type} (${component.id})`);
    }
  }

  console.log("\nDone! All CSS-in-JS styles converted to Tailwind classes.");
  await prisma.$disconnect();
}

fixCssClasses().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
