/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("furnishingType");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("furnishingType"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "furnishingType",
    required: false,
    values: ["Unfurnished", "Semi-Furnished", "Fully Furnished"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("furnishingType");
  return app.save(collection);
})