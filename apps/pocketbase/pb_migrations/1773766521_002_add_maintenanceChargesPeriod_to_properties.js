/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("maintenanceChargesPeriod");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("maintenanceChargesPeriod"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "maintenanceChargesPeriod",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("maintenanceChargesPeriod");
  return app.save(collection);
})