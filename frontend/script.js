async function analyze() {
  const message = document.getElementById("message").value;

  const profile = {
    followers: Number(document.getElementById("followers").value),
    following: Number(document.getElementById("following").value),
    posts: Number(document.getElementById("posts").value)
  };

  const loading = document.getElementById("loading");
  const resultDiv = document.getElementById("result");

  loading.classList.remove("hidden");
  resultDiv.classList.add("hidden");

  try {
    const res = await fetch("https://ai-cyber-threat-detector-3zhp.onrender.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, profile })
    });

    const data = await res.json();

    loading.classList.add("hidden");
    resultDiv.classList.remove("hidden");

    let colorClass = "safe";
    if (data.level === "Dangerous") colorClass = "danger";
    else if (data.level === "Suspicious") colorClass = "suspicious";

    resultDiv.className = `result ${colorClass}`;

    resultDiv.innerHTML = `
      <h2>${data.level}</h2>
      <h3>Risk Score: ${data.score}%</h3>

      <p><b>Reason:</b><br>${data.explanation}</p>

      <p><b>Suggested Action:</b><br>${data.action}</p>
    `;

  } catch (error) {
    loading.classList.add("hidden");
    resultDiv.classList.remove("hidden");

    resultDiv.className = "result danger";
    resultDiv.innerHTML = `
      <h2>Error</h2>
      <p>Something went wrong. Check backend or API.</p>
    `;
  }

  resultDiv.scrollIntoView({ behavior: "smooth" });
}

// 🎯 DEMO BUTTON
function fillDemo() {
  document.getElementById("message").value = "I will find you and track you";
  document.getElementById("followers").value = 5;
  document.getElementById("following").value = 300;
  document.getElementById("posts").value = 1;
}