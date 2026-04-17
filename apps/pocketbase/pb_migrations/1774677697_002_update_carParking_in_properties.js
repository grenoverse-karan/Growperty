/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("carParking");
  field.type = "json";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("carParking");
  field.type = "number";
  return app.save(collection);
})