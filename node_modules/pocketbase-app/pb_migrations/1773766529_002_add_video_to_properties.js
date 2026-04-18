/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("video");
  if (existing) {
    if (existing.type === "file") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("video"); // exists with wrong type, remove first
  }

  collection.fields.add(new FileField({
    name: "video",
    required: false,
    maxSelect: 1,
    maxSize: 104857600
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("video");
  return app.save(collection);
})