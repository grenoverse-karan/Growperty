/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const record0 = new Record(collection);
    record0.set("title", "Sample Property");
    record0.set("description", "Test property in Noida");
    record0.set("price", 5000000);
    record0.set("location", "Noida");
    record0.set("bedrooms", 3);
    record0.set("bathrooms", 2);
    record0.set("status", "approved");
    record0.set("created_at", "2024-01-01");
    record0.set("userId", "system");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})