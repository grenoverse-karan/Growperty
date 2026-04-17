/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("maintenanceCharges");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("maintenanceCharges"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "maintenanceCharges",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("maintenanceCharges");
  return app.save(collection);
})