/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const record0 = new Record(collection);
    record0.set("title", "Modern 3BHK Apartment in Noida");
    record0.set("description", "Spacious apartment with modern amenities");
    record0.set("price", 4500000);
    record0.set("location", "Noida");
    record0.set("bedrooms", 3);
    record0.set("bathrooms", 2);
    record0.set("area", 1500);
    record0.set("amenities", "Gym, Pool, Parking");
    record0.set("status", "approved");
    record0.set("userId", "sample-user-1");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("title", "2BHK Flat in Greater Noida");
    record1.set("description", "Well-maintained flat near metro");
    record1.set("price", 3200000);
    record1.set("location", "Greater Noida");
    record1.set("bedrooms", 2);
    record1.set("bathrooms", 1);
    record1.set("area", 1000);
    record1.set("amenities", "Parking, Security");
    record1.set("status", "approved");
    record1.set("userId", "sample-user-2");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("title", "Luxury Villa in Delhi-NCR");
    record2.set("description", "Premium villa with garden");
    record2.set("price", 8500000);
    record2.set("location", "Delhi-NCR");
    record2.set("bedrooms", 4);
    record2.set("bathrooms", 3);
    record2.set("area", 2500);
    record2.set("amenities", "Garden, Pool, Gym, Parking");
    record2.set("status", "approved");
    record2.set("userId", "sample-user-3");
  try {
    app.save(record2);
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