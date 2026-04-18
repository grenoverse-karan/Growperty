/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("bankLoanAvailable");
  if (existing) {
    if (existing.type === "bool") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("bankLoanAvailable"); // exists with wrong type, remove first
  }

  collection.fields.add(new BoolField({
    name: "bankLoanAvailable",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("bankLoanAvailable");
  return app.save(collection);
})