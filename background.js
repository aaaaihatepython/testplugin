chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trumpify",
    title: "Trumpify Selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "trumpify") {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });

    const trumpifiedText = await callOpenAI(result);
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => alert(text),
      args: [trumpifiedText]
    });
  }
});

async function callOpenAI(text) {
  const key = "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"; // Replace with your real API key
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Donald Trump. Rewrite and summarize in your style." },
        { role: "user", content: text }
      ],
      temperature: 0.8
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}
