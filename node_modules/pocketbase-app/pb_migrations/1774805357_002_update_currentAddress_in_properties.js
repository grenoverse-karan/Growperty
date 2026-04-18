/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("currentAddress");
  field.max = 500;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("currentAddress");
  field.max = 0;
  return app.save(collection);
})