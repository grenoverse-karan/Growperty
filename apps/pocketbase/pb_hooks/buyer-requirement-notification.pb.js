/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const buyerName = e.record.get("buyerName");
  const buyerPhone = e.record.get("buyerPhone");
  const buyerEmail = e.record.get("buyerEmail");
  const propertyType = e.record.get("propertyType");
  const city = e.record.get("city");
  const minBudget = e.record.get("minBudget");
  const maxBudget = e.record.get("maxBudget");
  const specialRequirements = e.record.get("specialRequirements");
  const created = e.record.get("created");

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: "admin@site.com" }],
    subject: "New Buyer Requirement - " + propertyType + " in " + city,
    html: "<h2>New Buyer Requirement Submitted</h2>" +
          "<p><strong>Buyer Name:</strong> " + buyerName + "</p>" +
          "<p><strong>Phone:</strong> " + buyerPhone + "</p>" +
          "<p><strong>Email:</strong> " + buyerEmail + "</p>" +
          "<p><strong>Property Type:</strong> " + propertyType + "</p>" +
          "<p><strong>City:</strong> " + city + "</p>" +
          "<p><strong>Budget Range:</strong> " + (minBudget || "Not specified") + " - " + maxBudget + "</p>" +
          "<p><strong>Special Requirements:</strong> " + (specialRequirements || "None") + "</p>" +
          "<p><strong>Submitted At:</strong> " + created + "</p>"
  });
  $app.newMailClient().send(message);
  e.next();
}, "buyer_requirements");