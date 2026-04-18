/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "userId = @request.auth.id";
  collection.deleteRule = "userId = @request.auth.id";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "";
  collection.updateRule = "";
  collection.deleteRule = "";
  return app.save(collection);
})