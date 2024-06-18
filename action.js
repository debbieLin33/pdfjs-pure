console.log(globalThis.pdfjsLib);
const url = "./GNHRL.pdf"; // URL to your PDF
let pdfDoc = null;
const container = document.getElementById("pdf-container");

pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
  pdfDoc = pdfDoc_;
  renderPages();
});

async function renderPages() {
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const div = document.createElement("div");
    div.className = "pdf-page";
    div.id = `page-${pageNum}`;
    container.appendChild(div);

    const canvas = document.createElement("canvas");
    div.appendChild(canvas);
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    page
      .render({ canvasContext: context, viewport: viewport })
      .promise.then(() => {
        return page.getTextContent();
      })
      .then((textContent) => {
        const textLayerDiv = document.createElement("div");
        textLayerDiv.className = "textLayer";
        div.appendChild(textLayerDiv);

        page.TextLayer = new pdfjsLib.TextLayer({
          // textContent: textContent,
          textContentSource: page.streamTextContent(
            textContent || {
              includeMarkedContent: true,
              disableNormalization: true,
            }
          ),
          container: textLayerDiv,
          viewport: viewport,
          textDivs: [],
        });
        // page.TextLayer.render();
      });
  }
}

function searchKeyword(keyword) {
  pdfDoc.getPage(1).then((page) => {
    const numPages = pdfDoc.numPages;
    let promises = [];

    for (let i = 1; i <= numPages; i++) {
      promises.push(pdfDoc.getPage(i).then((page) => page.getTextContent()));
    }

    Promise.all(promises).then((pagesText) => {
      let found = false;
      for (let i = 0; i < pagesText.length; i++) {
        const page = pagesText[i];
        for (let j = 0; j < page.items.length; j++) {
          const item = page.items[j];
          if (item.str.toLowerCase().includes(keyword)) {
            found = true;
            const pageDiv = document.getElementById(`page-${i + 1}`);
            pageDiv.scrollIntoView();
            highlightText(pageDiv, keyword);
            break;
          }
        }
        if (found) break;
      }
      if (!found) alert("Keyword not found");
    });
  });
}

function highlightText(pageDiv, keyword) {
  const textLayer = pageDiv.querySelector(".textLayer");
  if (textLayer) {
    const textDivs = textLayer.querySelectorAll("span");
    textDivs.forEach((span) => {
      if (span.textContent.toLowerCase().includes(keyword)) {
        span.style.backgroundColor = "yellow";
      }
    });
  }
}
document.getElementById("btn").addEventListener("click", function () {
  const keyword = document.getElementById("keyword").value.toLowerCase();
  searchKeyword(keyword);
});
