/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("propertyType");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("propertyType"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "propertyType",
    required: true,
    values: ["Flat/Apartment", "Independent House", "Villa", "Penthouse", "Plot/Land", "Commercial"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("propertyType");
  return app.save(collection);
})