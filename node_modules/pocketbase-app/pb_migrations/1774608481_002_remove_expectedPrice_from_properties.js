/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("expectedPrice");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new NumberField({
    name: "expectedPrice",
    required: true
  }));
  return app.save(collection);
})