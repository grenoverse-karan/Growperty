/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("thumbnail");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new FileField({
    name: "thumbnail",
    maxSelect: 1,
    maxSize: 20971520
  }));
  return app.save(collection);
})