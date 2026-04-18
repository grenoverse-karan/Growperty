/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("areaUnit");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("areaUnit"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "areaUnit",
    required: true,
    values: ["Sq.ft", "Sq.yd", "Sq.m"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("areaUnit");
  return app.save(collection);
})