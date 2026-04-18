/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("propertyType");
  field.type = "text";
  field.required = true;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  const field = collection.fields.getByName("propertyType");
  field.type = "select";
  field.required = true;
  return app.save(collection);
})