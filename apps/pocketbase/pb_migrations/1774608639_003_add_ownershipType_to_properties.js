/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("ownershipType");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("ownershipType"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "ownershipType",
    required: false,
    values: ["Individual", "Company", "Joint"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("ownershipType");
  return app.save(collection);
})