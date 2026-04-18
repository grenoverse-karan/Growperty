/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("status");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new SelectField({
    name: "status",
    values: ["pending", "approved", "rejected", "suspended"]
  }));
  return app.save(collection);
})