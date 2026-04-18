/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("maintenanceCharges");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new NumberField({
    name: "maintenanceCharges",
    required: false
  }));
  return app.save(collection);
})