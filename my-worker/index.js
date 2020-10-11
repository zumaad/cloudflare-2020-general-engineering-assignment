const links = [
  { "name": "a project of mine: sonar/camera enabled raspberry pi robot", "url": "https://github.com/zumaad/Remote-Control-Roach-Destroyer" },
  { "name": "another project of mine: async python http server", "url": "https://github.com/zumaad/pyrver" },
  { "name": "one of the main contributors to this open source project :)", "url": "https://github.com/Belieal/flipping-utilities" }
]

const socialLinks= [
  { "name": "portfolio", "url": "https://zumaad.me", "svg":"https://simpleicons.org/icons/python.svg" },
  { "name": "github", "url": "https://github.com/zumaad", "svg":"https://simpleicons.org/icons/github.svg" },
  { "name": "linkedin", "url": "https://www.linkedin.com/in/zumaad-khan-629a07177", "svg":"https://simpleicons.org/icons/linkedin.svg" }
]

//adds the links to some of my projects. Its located under the Avatar.
class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  
  async element(element) {
    const newContent = this.links.map(link => `<a href=${link.url}>${link.name}</a>`).join("")
    element.setInnerContent(newContent, {html:true})
  }
}

//unhides the profile div
class ProfileTransformer {
  async element(element) {
    element.setAttribute("style", "")
  }
}

//sets the avatar picture using the image hosted on my personal website
class AvatarTransformer {
  async element(element) {
    element.setAttribute("src", "https://zumaad.me/images/profile.png")
  }
}

class NameTransformer {
  async element(element) {
    element.setInnerContent("zumaad")
  }
}

//adds some of my social links to the div with id social.
class SocialLinksTransformer {
  constructor(links) {
    this.links = links
  }
  
  async element(element) {
    element.setAttribute("style", "")
    const newContent = this.links.map(link => `<a href=${link.url}>${link.name}<img src=${link.svg}></a>`).join("")
    element.setInnerContent(newContent, {html:true})
  }
}

class TitleTransformer {
  async element(element) {
    element.setInnerContent("Zumaad Khan")
  }
}

//Admittedly, the green looks kind of ugly -.-
class BodyTransformer {
  async element(element) {
    element.setAttribute("style","background-color:green")
  }
}

//best practice is to not keep redefining the rewriter in the request handler, hence the global variable.
const transformer = new HTMLRewriter().
  on("div#links", new LinksTransformer(links)).
  on("div#profile", new ProfileTransformer()).
  on("img#avatar", new AvatarTransformer()).
  on("h1#name", new NameTransformer()).
  on("div#social", new SocialLinksTransformer(socialLinks)).
  on("title", new TitleTransformer()).
  on("body", new BodyTransformer())



//DESIGN DECISION:
//I could have done HTML rewriting using one rewriter class that evaluated "div" (or even just listened for any element) 
//and checked for id and then set things appropriately.
//However, the assignment description seemed to want us to "target" the specific elements, so I
//decided to target them in the HTMLRewriter with each one having their own class, instead of having branches in
//one class checking for a specific element.


//Handles requests for the url "my-worker.zumaad.workers.dev/links"
async function linksHandler(request) {
  let linksJson = JSON.stringify(links)
  return new Response(linksJson,{
    headers: {'content-type':'application/json'}
  })
}

//handles request for any url that isn't my-worker.zumaad.workers.dev/links
async function htmlRewriterHandler() {
  const res = await fetch("https://static-links-page.signalnerve.workers.dev")
  const transformedHtmlResponse = await transformer.transform(res)
  return transformedHtmlResponse
}

async function handleRequest(request) {
  let requestUrl = request.url
  if (requestUrl === "https://my-worker.zumaad.workers.dev/links") {
    const linksResponse = await linksHandler(requestUrl)
    return linksResponse
  }
  else {
    const htmlResponse = await htmlRewriterHandler()
    return htmlResponse
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})