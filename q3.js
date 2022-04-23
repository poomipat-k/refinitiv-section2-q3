const axios = require('axios')
const jsdom = require("jsdom");

const { JSDOM } = jsdom;

const getFieldMapper = tbodyDom => {
      // Parse html raw text to dom tree by jsdom lib
      const columnNameRowElements = tbodyDom.children[0].children;
      const fieldMapper = {};
      for (let i = 0; i < columnNameRowElements.length; i++) {
        const element = columnNameRowElements[i]
        fieldMapper[element.innerHTML.trim()] = i;
      }
      return fieldMapper;
}

const findNavByFundName = ({
  searchFundName,
  tbodyDom,
  fieldMapper,
  searchFieldName = 'Nav'
}) => {
  const fundNameColumnIndex = fieldMapper['Fund Name'];
  const navColumnIndex = fieldMapper[searchFieldName];
  let matchRowIndex = -1;
  const rows = tbodyDom.children;
  // Search for fund name
  for (let row = 1; row < rows.length; row++) {
    const fundName = rows[row].children[fundNameColumnIndex].innerHTML.trim();
    if (fundName === searchFundName) {
      matchRowIndex = row;
      break;
    }
  }
  if (matchRowIndex == -1) {
    throw new Error('Fund Name not found.');
  }
  const nav = rows[matchRowIndex].children[navColumnIndex].innerHTML;
  return nav
}

async function main() {
  const inputFundName = process.argv[2] && process.argv[2].trim();
  try {
    const res = await axios.get('https://codequiz.azurewebsites.net', {
      headers: {
        // Set Cookie
        Cookie: "hasCookie=true;"
      }
    });
    const rawHtml = res.data;
    const dom = new JSDOM(rawHtml);

    // Parse html raw text to dom tree by jsdom lib
    const tbodyDom = dom.window.document.querySelector('tbody');
    const fieldMapper = getFieldMapper(tbodyDom);
    const nav = findNavByFundName({
      searchFundName: inputFundName,
      tbodyDom,
      fieldMapper,
      searchFieldName: 'Nav',
    })
    console.log(nav);
  } catch (error) {
    console.error(error)
  }
}

main();