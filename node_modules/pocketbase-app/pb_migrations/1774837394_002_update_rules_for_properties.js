/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.listRule = "status = 'approved' || (owner_id = @request.auth.id && status != 'approved') || @request.auth.collectionName = \"admins\"";
  collection.viewRule = "status = 'approved' || (owner_id = @request.auth.id && status != 'approved') || @request.auth.collectionName = \"admins\"";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "(owner_id = @request.auth.id && status = 'pending') || @request.auth.collectionName = \"admins\"";
  collection.deleteRule = "(owner_id = @request.auth.id && status = 'pending') || @request.auth.collectionName = \"admins\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.collectionName = \"admins\"";
  collection.deleteRule = "@request.auth.collectionName = \"admins\"";
  return app.save(collection);
})