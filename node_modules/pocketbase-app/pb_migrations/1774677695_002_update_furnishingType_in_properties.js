/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("furnishingType");
  field.type = "text";
  field.required = false;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("furnishingType");
  field.type = "select";
  field.required = false;
  return app.save(collection);
})