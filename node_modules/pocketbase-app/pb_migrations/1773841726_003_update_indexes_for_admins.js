/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.indexes.push("CREATE UNIQUE INDEX idx_admins_email ON admins (email) WHERE email != ''");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_admins_email"));
  return app.save(collection);
})