addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const target = url.searchParams.get("url")

  if (!target) {
    return new Response("Missing url param", { status: 400 })
  }

  let fetchUrl
  try {
    // prepend https:// if not present
    fetchUrl = target.startsWith("http") ? target : "https://" + target
    const res = await fetch(fetchUrl)
    const text = await res.text()

    // rewrite all relative links to absolute
    const base = new URL(fetchUrl).origin
    const fixedText = text.replace(/(href|src)=["'](?!https?:|\/\/)/g, `$1="${base}/`)

    return new Response(fixedText, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    })
  } catch (e) {
    return new Response("Error fetching page: " + e.message, { status: 500 })
  }
}
