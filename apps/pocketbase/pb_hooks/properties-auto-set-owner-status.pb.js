/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Force set owner_id to authenticated user
  e.record.set("owner_id", e.auth.id);
  
  // Force set status to pending
  e.record.set("status", "pending");
  
  // Continue execution chain
  e.next();
}, "properties");