/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("videos");
  if (existing) {
    if (existing.type === "file") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("videos"); // exists with wrong type, remove first
  }

  collection.fields.add(new FileField({
    name: "videos",
    required: false,
    maxSelect: 5,
    maxSize: 104857600
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("videos");
  return app.save(collection);
})