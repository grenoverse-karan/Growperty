/// <reference path="../pb_data/types.d.ts" />
// Hide backend-only fields (flatHouseNumber, ownerMobileNumber) from non-owner users
onRecordEnrich((e) => {
  // Only hide if the requesting user is not the owner
  if (e.auth && e.auth.id !== e.record.get("userId")) {
    e.record.hide("flatHouseNumber");
    e.record.hide("ownerMobileNumber");
  }
  e.next();
}, "properties");

// Prevent non-owners from updating backend-only fields
onRecordUpdate((e) => {
  const userId = e.record.get("userId");
  const isOwner = e.auth && e.auth.id === userId;
  
  if (!isOwner) {
    // Check if user is trying to modify backend-only fields
    const original = e.record.original();
    if (e.record.get("flatHouseNumber") !== original.get("flatHouseNumber")) {
      throw new BadRequestError("You cannot modify flatHouseNumber");
    }
    if (e.record.get("ownerMobileNumber") !== original.get("ownerMobileNumber")) {
      throw new BadRequestError("You cannot modify ownerMobileNumber");
    }
  }
  e.next();
}, "properties");