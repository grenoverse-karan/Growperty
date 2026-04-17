/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("plotType");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("plotType"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "plotType",
    required: false,
    values: ["Lease Hold", "Free Hold", "Kisan Kota"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("plotType");
  return app.save(collection);
})