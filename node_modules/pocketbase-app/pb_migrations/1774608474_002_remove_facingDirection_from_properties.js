/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("facingDirection");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new TextField({
    name: "facingDirection",
    required: true
  }));
  return app.save(collection);
})