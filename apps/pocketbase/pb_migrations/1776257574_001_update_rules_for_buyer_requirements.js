/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("buyer_requirements");
  collection.listRule = "@request.auth.collectionName = \"admins\" || @request.auth.id = \"\"";
  collection.viewRule = "@request.auth.collectionName = \"admins\" || @request.auth.id = \"\"";
  collection.createRule = "";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("buyer_requirements");
  collection.createRule = "";
  collection.listRule = "@request.auth.collectionName = \"admins\"";
  collection.viewRule = "@request.auth.collectionName = \"admins\"";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
