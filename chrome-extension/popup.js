const fillBtn = document.getElementById("fillBtn");

fillBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    type: "BLACKTAG_FILL",
    payload: {
      title,
      description,
      price,
    },
  });
});