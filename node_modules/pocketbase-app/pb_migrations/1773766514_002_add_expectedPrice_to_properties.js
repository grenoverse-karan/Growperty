/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("expectedPrice");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("expectedPrice"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "expectedPrice",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("expectedPrice");
  return app.save(collection);
})