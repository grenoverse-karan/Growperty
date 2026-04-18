/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("projects");

  const existing = collection.fields.getByName("brochure");
  if (existing) {
    if (existing.type === "file") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("brochure"); // exists with wrong type, remove first
  }

  collection.fields.add(new FileField({
    name: "brochure",
    maxSelect: 1,
    maxSize: 10485760
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("projects");
    collection.fields.removeByName("brochure");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
