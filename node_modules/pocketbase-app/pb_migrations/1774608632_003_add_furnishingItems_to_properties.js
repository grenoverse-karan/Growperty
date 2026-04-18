/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("furnishingItems");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("furnishingItems"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "furnishingItems",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("furnishingItems");
  return app.save(collection);
})