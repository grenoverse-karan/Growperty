/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("bhk");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("bhk"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "bhk",
    required: false,
    values: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("bhk");
  return app.save(collection);
})