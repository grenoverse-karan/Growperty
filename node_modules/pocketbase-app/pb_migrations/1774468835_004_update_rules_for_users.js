/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.listRule = "@request.auth.collectionName = \"admins\"";
  collection.viewRule = "id = @request.auth.id || @request.auth.collectionName = \"admins\"";
  collection.updateRule = "id = @request.auth.id || @request.auth.collectionName = \"admins\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.listRule = "id = @request.auth.id";
  collection.viewRule = "id = @request.auth.id";
  collection.updateRule = "id = @request.auth.id";
  return app.save(collection);
})