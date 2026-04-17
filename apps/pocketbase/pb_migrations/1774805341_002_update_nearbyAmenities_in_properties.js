/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("nearbyAmenities");
  field.maxSize = 1000000;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("nearbyAmenities");
  field.maxSize = 0;
  return app.save(collection);
})