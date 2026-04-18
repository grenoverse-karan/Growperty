/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("is_active");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new BoolField({
    name: "is_active",
    required: false
  }));
  return app.save(collection);
})