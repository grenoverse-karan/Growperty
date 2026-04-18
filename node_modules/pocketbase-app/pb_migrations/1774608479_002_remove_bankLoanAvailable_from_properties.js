/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("bankLoanAvailable");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.add(new BoolField({
    name: "bankLoanAvailable",
    required: true
  }));
  return app.save(collection);
})