chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== "BLACKTAG_FILL") return;

  const { title, description, price } = message.payload;

  console.log("BLACKTAG Autofill", message.payload);

  const inputs = document.querySelectorAll("input, textarea");

  inputs.forEach((element) => {
    const placeholder = (element.placeholder || "").toLowerCase();

    if (placeholder.includes("titolo")) {
      element.value = title;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (placeholder.includes("descrizione")) {
      element.value = description;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (placeholder.includes("prezzo")) {
      element.value = price;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
});