/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("houseNo");
  field.max = 255;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("houseNo");
  field.max = 0;
  return app.save(collection);
})