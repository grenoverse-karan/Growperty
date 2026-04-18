/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "";
  collection.updateRule = "@request.auth.id != \"\"";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.listRule = "@request.auth.role = 'admin'";
  collection.viewRule = "@request.auth.role = 'admin'";
  collection.createRule = "@request.auth.role = 'admin'";
  collection.updateRule = "@request.auth.role = 'admin'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
})