/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("societyVillage");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("societyVillage"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "societyVillage",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("societyVillage");
  return app.save(collection);
})